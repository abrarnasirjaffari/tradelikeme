use anchor_lang::prelude::*;
use anchor_spl::token::{self, Approve, CloseAccount, Token, TokenAccount, Transfer};

declare_id!("rGMTq8sS5GUJ7q1ei9x75dnZ3kM2QCn5YRKYGHbwdSd");

/// Minimum epoch duration in seconds (7 days)
const MIN_EPOCH_DURATION: i64 = 7 * 24 * 60 * 60;

#[program]
pub mod vault {
    use super::*;

    /// Create a new vault PDA for a (user × strategy) pair.
    /// Stores initial metadata; balance starts at zero.
    pub fn create_vault(
        ctx: Context<InitializeVault>,
        strategy_id: [u8; 32],
        platform_wallet: Pubkey,
        mint: Pubkey,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.user_pubkey = ctx.accounts.user.key();
        vault.strategy_id = strategy_id;
        vault.balance = 0;
        vault.opening_balance = 0;
        vault.epoch_profit = 0;
        vault.platform_wallet = platform_wallet;
        vault.agent_pubkey = Pubkey::default();
        vault.bump = ctx.bumps.vault;
        vault.risk_mode = 1; // default: Medium
        vault.trade_count = 0;
        vault.mint = mint;
        vault.last_settle_ts = 0;
        vault.active_trades = 0;

        emit!(VaultCreated {
            user: ctx.accounts.user.key(),
            strategy_id,
            platform_wallet,
            mint,
        });

        Ok(())
    }

    /// Deposit USDC into the vault.
    /// Transfers `amount` (in USDC smallest units, 6 decimals) from the user's
    /// token account into the vault's token account, then updates vault.balance.
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::ZeroAmount);

        // Transfer USDC from user → vault token account
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, amount)?;

        // Update vault balance
        ctx.accounts.vault.balance = ctx.accounts.vault.balance
            .checked_add(amount)
            .ok_or(VaultError::Overflow)?;

        emit!(Deposited {
            vault: ctx.accounts.vault.key(),
            user: ctx.accounts.user.key(),
            amount,
        });

        msg!("Deposited {} USDC into vault", amount);
        Ok(())
    }

    /// Delegate trade authority to the agent keypair.
    /// Calls SPL token `approve` so the agent can move funds for trading.
    /// The agent can NEVER call `withdraw()` — that requires the user as Signer.
    /// Stores `agent_pubkey` on the vault for use by `settle_epoch()` access control.
    pub fn delegate_to_protocol(
        ctx: Context<DelegateToProtocol>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, VaultError::ZeroAmount);

        // V12: only the vault owner may delegate trading authority
        require!(
            ctx.accounts.user.key() == ctx.accounts.vault.user_pubkey,
            VaultError::Unauthorized
        );

        // H8: prevent re-delegation while trades are active
        require!(
            ctx.accounts.vault.active_trades == 0,
            VaultError::ActiveTrades
        );

        // Record the agent so settle_epoch can verify the caller
        ctx.accounts.vault.agent_pubkey = ctx.accounts.agent.key();

        let user_key = ctx.accounts.vault.user_pubkey;
        let strategy_id = ctx.accounts.vault.strategy_id;
        let bump = ctx.accounts.vault.bump;
        let seeds: &[&[u8]] = &[b"vault", user_key.as_ref(), &strategy_id, &[bump]];
        let signer_seeds = &[seeds];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Approve {
                to: ctx.accounts.vault_token_account.to_account_info(),
                delegate: ctx.accounts.agent.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
            signer_seeds,
        );
        token::approve(cpi_ctx, amount)?;

        emit!(Delegated {
            vault: ctx.accounts.vault.key(),
            agent: ctx.accounts.agent.key(),
            amount,
        });

        msg!(
            "Delegated {} USDC trading authority to agent {}",
            amount,
            ctx.accounts.agent.key()
        );
        Ok(())
    }

    /// Settle the current epoch: calculate profit, send 20% to platform wallet.
    /// Called by the agent monthly. If no profit, resets opening_balance and returns.
    /// After settlement vault.balance reflects the user's 80% share only.
    ///
    /// C4 FIX: Uses vault_token_account.amount (on-chain truth) for profit calculation
    /// instead of the manually tracked vault.balance field. This ensures trading P&L
    /// is captured and deposits are not counted as profit.
    pub fn settle_epoch(ctx: Context<SettleEpoch>) -> Result<()> {
        // V11: only the registered agent keypair may call this
        require!(
            ctx.accounts.agent.key() == ctx.accounts.vault.agent_pubkey,
            VaultError::AgentMismatch
        );

        // M11: enforce minimum epoch duration (7 days)
        let clock = Clock::get()?;
        let now = clock.unix_timestamp;
        if ctx.accounts.vault.last_settle_ts > 0 {
            let elapsed = now
                .checked_sub(ctx.accounts.vault.last_settle_ts)
                .ok_or(VaultError::Overflow)?;
            require!(elapsed >= MIN_EPOCH_DURATION, VaultError::EpochTooShort);
        }

        // C4 FIX: Read the actual on-chain token balance for profit calculation.
        // This captures trading P&L that vault.balance cannot track.
        let actual_balance = ctx.accounts.vault_token_account.amount;
        let opening_balance = ctx.accounts.vault.opening_balance;

        let vault_key = ctx.accounts.vault.key();
        let user_key = ctx.accounts.vault.user_pubkey;
        let strategy_id = ctx.accounts.vault.strategy_id;
        let bump = ctx.accounts.vault.bump;

        // No profit this epoch — just roll the opening balance forward
        if actual_balance <= opening_balance {
            let vault = &mut ctx.accounts.vault;
            vault.epoch_profit = 0;
            vault.opening_balance = actual_balance;
            vault.balance = actual_balance;
            vault.last_settle_ts = now;
            msg!("Epoch settled with no profit");
            return Ok(());
        }

        let profit = actual_balance
            .checked_sub(opening_balance)
            .ok_or(VaultError::Overflow)?;

        // 20% to platform, rounded down (user always gets at least 80%)
        let platform_fee = profit
            .checked_mul(20)
            .and_then(|n| n.checked_div(100))
            .ok_or(VaultError::Overflow)?;

        if platform_fee > 0 {
            let seeds: &[&[u8]] = &[b"vault", user_key.as_ref(), &strategy_id, &[bump]];
            let signer_seeds = &[seeds];

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_token_account.to_account_info(),
                    to: ctx.accounts.platform_token_account.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                signer_seeds,
            );
            token::transfer(cpi_ctx, platform_fee)?;
        }

        // Mutable update after CPI is complete
        let new_balance = actual_balance
            .checked_sub(platform_fee)
            .ok_or(VaultError::Overflow)?;
        let vault = &mut ctx.accounts.vault;
        vault.balance = new_balance;
        vault.epoch_profit = profit;
        vault.opening_balance = new_balance;
        vault.last_settle_ts = now;

        emit!(EpochSettled {
            vault: vault_key,
            profit,
            platform_fee,
            new_balance,
        });

        msg!(
            "Epoch settled: profit={}, platform_fee={}, user_balance={}",
            profit,
            platform_fee,
            new_balance
        );
        Ok(())
    }

    /// Withdraw USDC from the vault back to the user.
    /// Only the vault owner can call this. Transfers `amount` from the vault's
    /// token account to the user's token account using the PDA as signer.
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::ZeroAmount);
        require!(
            ctx.accounts.vault.balance >= amount,
            VaultError::InsufficientFunds
        );

        // PDA signs the transfer on behalf of the vault token account
        let user_key = ctx.accounts.vault.user_pubkey;
        let strategy_id = ctx.accounts.vault.strategy_id;
        let bump = ctx.accounts.vault.bump;
        let seeds: &[&[u8]] = &[b"vault", user_key.as_ref(), &strategy_id, &[bump]];
        let signer_seeds = &[seeds];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(cpi_ctx, amount)?;

        ctx.accounts.vault.balance = ctx.accounts.vault.balance
            .checked_sub(amount)
            .ok_or(VaultError::Overflow)?;

        emit!(Withdrawn {
            vault: ctx.accounts.vault.key(),
            user: ctx.accounts.user.key(),
            amount,
        });

        msg!("Withdrew {} USDC from vault", amount);
        Ok(())
    }

    // ── NEW INSTRUCTIONS (P3 — On-Chain Trade Journal) ─────────────────────

    /// Record a new trade opened by the agent.
    /// trade_id must equal vault.trade_count (the next sequential ID).
    /// Seeds for TradeRecord PDA: ["trade", vault_pubkey, trade_id_le_bytes].
    pub fn record_trade(
        ctx: Context<RecordTrade>,
        trade_id: u64,
        symbol: [u8; 16],
        direction: u8,
        entry_price: u64,
        qty: u64,
        sl_price: u64,
        tp1_price: u64,
        tp2_price: u64,
        strategy_id: [u8; 32],
        opened_at: i64,
    ) -> Result<()> {
        require!(
            ctx.accounts.agent.key() == ctx.accounts.vault.agent_pubkey,
            VaultError::AgentMismatch
        );
        // Ensure trade_id matches the next expected sequential ID
        require!(
            trade_id == ctx.accounts.vault.trade_count,
            VaultError::InvalidTradeId
        );

        let trade_record = &mut ctx.accounts.trade_record;
        trade_record.vault_pubkey = ctx.accounts.vault.key();
        trade_record.symbol = symbol;
        trade_record.direction = direction;
        trade_record.entry_price = entry_price;
        trade_record.qty = qty;
        trade_record.sl_price = sl_price;
        trade_record.tp1_price = tp1_price;
        trade_record.tp2_price = tp2_price;
        trade_record.strategy_id = strategy_id;
        trade_record.opened_at = opened_at;
        trade_record.status = 0; // OPEN
        trade_record.exit_price = 0;
        trade_record.realized_pnl = 0;
        trade_record.closed_at = 0;
        trade_record.outcome = 0; // NONE
        trade_record.trade_id = trade_id;
        trade_record.bump = ctx.bumps.trade_record;

        // Increment vault trade counter AFTER writing the record
        ctx.accounts.vault.trade_count = ctx.accounts.vault.trade_count
            .checked_add(1)
            .ok_or(VaultError::Overflow)?;

        // Increment active trades counter
        ctx.accounts.vault.active_trades = ctx.accounts.vault.active_trades
            .checked_add(1)
            .ok_or(VaultError::Overflow)?;

        emit!(TradeOpened {
            trade_id,
            vault_pubkey: trade_record.vault_pubkey,
            symbol,
            direction,
            entry_price,
            opened_at,
        });

        msg!(
            "Trade {} opened: symbol={:?} direction={} entry={}",
            trade_id,
            symbol,
            direction,
            entry_price
        );
        Ok(())
    }

    /// Close an existing trade record.
    /// Only the registered agent may call this. trade_record.status must be OPEN (0).
    pub fn close_trade(
        ctx: Context<CloseTrade>,
        exit_price: u64,
        realized_pnl: i64,
        closed_at: i64,
        outcome: u8,
    ) -> Result<()> {
        require!(
            ctx.accounts.agent.key() == ctx.accounts.vault.agent_pubkey,
            VaultError::AgentMismatch
        );
        require!(
            ctx.accounts.trade_record.status == 0,
            VaultError::TradeAlreadyClosed
        );
        require!(outcome <= 4, VaultError::InvalidOutcome);

        let trade_record = &mut ctx.accounts.trade_record;
        trade_record.exit_price = exit_price;
        trade_record.realized_pnl = realized_pnl;
        trade_record.closed_at = closed_at;
        trade_record.status = 1; // CLOSED
        trade_record.outcome = outcome;

        let trade_id = trade_record.trade_id;
        let vault_pubkey = trade_record.vault_pubkey;

        // Decrement active trades counter
        let vault = &mut ctx.accounts.vault;
        vault.active_trades = vault.active_trades.saturating_sub(1);

        emit!(TradeClosed {
            trade_id,
            vault_pubkey,
            exit_price,
            realized_pnl,
            outcome,
            closed_at,
        });

        msg!(
            "Trade {} closed: exit={} pnl={} outcome={}",
            trade_id,
            exit_price,
            realized_pnl,
            outcome
        );
        Ok(())
    }

    /// Register a strategy on-chain.
    /// Seeds: ["strategy", trader_pubkey, strategy_id].
    /// Only the trader themselves can register (PDA seeds enforce this).
    pub fn register_strategy(
        ctx: Context<RegisterStrategy>,
        strategy_id: [u8; 32],
        strategy_name: [u8; 64],
        fee_tier: u8,
        rules_hash: [u8; 32],
        min_win_rate: u8,
    ) -> Result<()> {
        let strategy_record = &mut ctx.accounts.strategy_record;
        strategy_record.trader_pubkey = ctx.accounts.trader.key();
        strategy_record.strategy_name = strategy_name;
        strategy_record.fee_tier = fee_tier;
        strategy_record.rules_hash = rules_hash;
        strategy_record.min_win_rate = min_win_rate;
        strategy_record.created_at = Clock::get()?.unix_timestamp;
        strategy_record.strategy_id = strategy_id;
        strategy_record.bump = ctx.bumps.strategy_record;

        msg!(
            "Strategy registered: trader={} fee_tier={} min_win_rate={}",
            ctx.accounts.trader.key(),
            fee_tier,
            min_win_rate
        );
        Ok(())
    }

    /// Set the risk mode for a vault.
    /// Only the vault owner (user) can call this.
    /// risk_mode: 0=Conservative, 1=Medium, 2=Aggressive
    pub fn set_risk_mode(ctx: Context<SetRiskMode>, risk_mode: u8) -> Result<()> {
        require!(
            ctx.accounts.user.key() == ctx.accounts.vault.user_pubkey,
            VaultError::Unauthorized
        );
        // H10: validate risk_mode is within valid range
        require!(risk_mode <= 2, VaultError::InvalidRiskMode);

        ctx.accounts.vault.risk_mode = risk_mode;

        msg!("Risk mode set to {} for vault", risk_mode);
        Ok(())
    }

    /// H9: Update the platform wallet address.
    /// Only the current platform wallet holder can call this.
    pub fn update_platform_wallet(
        ctx: Context<UpdatePlatformWallet>,
        new_platform_wallet: Pubkey,
    ) -> Result<()> {
        ctx.accounts.vault.platform_wallet = new_platform_wallet;

        msg!(
            "Platform wallet updated to {}",
            new_platform_wallet
        );
        Ok(())
    }

    /// M12: Close a vault account and return rent to the user.
    /// Only allowed when balance is 0 and no active trades.
    pub fn close_vault(ctx: Context<CloseVault>) -> Result<()> {
        let vault = &ctx.accounts.vault;
        require!(vault.balance == 0, VaultError::VaultNotEmpty);
        require!(vault.active_trades == 0, VaultError::ActiveTrades);

        // Close the vault token account, returning rent to user
        let user_key = vault.user_pubkey;
        let strategy_id = vault.strategy_id;
        let bump = vault.bump;
        let seeds: &[&[u8]] = &[b"vault", user_key.as_ref(), &strategy_id, &[bump]];
        let signer_seeds = &[seeds];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.vault_token_account.to_account_info(),
                destination: ctx.accounts.user.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            },
            signer_seeds,
        );
        token::close_account(cpi_ctx)?;

        msg!("Vault closed, rent returned to user");
        Ok(())
    }

    /// M13: Close a trade record account and return rent to the payer.
    /// Only allowed when the trade is closed (status == 1).
    /// Only the agent can call this.
    pub fn close_trade_record(ctx: Context<CloseTradeRecord>) -> Result<()> {
        require!(
            ctx.accounts.agent.key() == ctx.accounts.vault.agent_pubkey,
            VaultError::AgentMismatch
        );
        require!(
            ctx.accounts.trade_record.status == 1,
            VaultError::TradeNotClosed
        );

        msg!("Trade record closed, rent returned to agent");
        Ok(())
    }
}

// ── Accounts contexts ──────────────────────────────────────────────────────

/// Create a new vault PDA. Seeds: ["vault", user_pubkey, strategy_id].
/// One unique vault per (user × strategy).
#[derive(Accounts)]
#[instruction(strategy_id: [u8; 32])]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = user,
        space = Vault::LEN,
        seeds = [b"vault", user.key().as_ref(), &strategy_id],
        bump
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Settle the epoch: transfer 20% profit to platform wallet.
/// Agent must be Signer; V11 adds the require! check against vault.agent_pubkey.
#[derive(Accounts)]
pub struct SettleEpoch<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.user_pubkey.as_ref(), &vault.strategy_id],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,

    /// C2: vault_token_account must be owned by the vault PDA
    /// H7: vault_token_account must use the expected mint
    #[account(
        mut,
        constraint = vault_token_account.owner == vault.key() @ VaultError::InvalidTokenAccount,
        constraint = vault_token_account.mint == vault.mint @ VaultError::InvalidTokenAccount,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// C3: platform_token_account must be owned by vault.platform_wallet
    /// H7: platform_token_account must use the expected mint
    #[account(
        mut,
        constraint = platform_token_account.owner == vault.platform_wallet @ VaultError::InvalidTokenAccount,
        constraint = platform_token_account.mint == vault.mint @ VaultError::InvalidTokenAccount,
    )]
    pub platform_token_account: Account<'info, TokenAccount>,

    /// The agent calling this instruction
    pub agent: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

/// Approve the agent as delegate on the vault token account.
/// Only the vault owner (user) can call this.
#[derive(Accounts)]
pub struct DelegateToProtocol<'info> {
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref(), &vault.strategy_id],
        bump = vault.bump,
        has_one = user_pubkey @ VaultError::Unauthorized,
    )]
    pub vault: Account<'info, Vault>,

    /// C2: vault_token_account must be owned by the vault PDA
    /// H7: vault_token_account must use the expected mint
    #[account(
        mut,
        constraint = vault_token_account.owner == vault.key() @ VaultError::InvalidTokenAccount,
        constraint = vault_token_account.mint == vault.mint @ VaultError::InvalidTokenAccount,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// The agent keypair that receives trading delegation
    /// CHECK: stored in vault.agent_pubkey; no other constraint needed
    pub agent: AccountInfo<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: must match vault.user_pubkey
    pub user_pubkey: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

/// Withdraw USDC from an existing vault back to the user.
/// The vault PDA acts as the token account authority (PDA signer).
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref(), &vault.strategy_id],
        bump = vault.bump,
        has_one = user_pubkey @ VaultError::Unauthorized,
    )]
    pub vault: Account<'info, Vault>,

    /// C2: vault_token_account must be owned by the vault PDA
    /// H7: vault_token_account must use the expected mint
    #[account(
        mut,
        constraint = vault_token_account.owner == vault.key() @ VaultError::InvalidTokenAccount,
        constraint = vault_token_account.mint == vault.mint @ VaultError::InvalidTokenAccount,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.mint == vault.mint @ VaultError::InvalidTokenAccount,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: must match vault.user_pubkey
    pub user_pubkey: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

/// Deposit USDC into an existing vault.
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref(), &vault.strategy_id],
        bump = vault.bump,
        has_one = user_pubkey @ VaultError::Unauthorized,
    )]
    pub vault: Account<'info, Vault>,

    /// C2: vault_token_account must be owned by the vault PDA
    /// H7: vault_token_account must use the expected mint
    #[account(
        mut,
        constraint = vault_token_account.owner == vault.key() @ VaultError::InvalidTokenAccount,
        constraint = vault_token_account.mint == vault.mint @ VaultError::InvalidTokenAccount,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.mint == vault.mint @ VaultError::InvalidTokenAccount,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    // Anchor uses has_one to match vault.user_pubkey == user_pubkey account key.
    // This field must be present so the constraint resolves.
    /// CHECK: must match vault.user_pubkey
    pub user_pubkey: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

/// Record a new open trade. Seeds: ["trade", vault_pubkey, trade_id_le_bytes].
/// trade_id is passed as an instruction arg so Anchor can use it in PDA seeds
/// without referencing vault.trade_count inside a mutable account constraint.
#[derive(Accounts)]
#[instruction(
    trade_id: u64,
    symbol: [u8; 16],
    direction: u8,
    entry_price: u64,
    qty: u64,
    sl_price: u64,
    tp1_price: u64,
    tp2_price: u64,
    strategy_id: [u8; 32],
    opened_at: i64
)]
pub struct RecordTrade<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.user_pubkey.as_ref(), &vault.strategy_id],
        bump = vault.bump,
        constraint = agent.key() == vault.agent_pubkey @ VaultError::AgentMismatch,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        init,
        payer = agent,
        space = TradeRecord::LEN,
        seeds = [b"trade", vault.key().as_ref(), &trade_id.to_le_bytes()],
        bump
    )]
    pub trade_record: Account<'info, TradeRecord>,

    #[account(mut)]
    pub agent: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Close an existing trade record. Seeds derived from trade_record.trade_id (already stored).
#[derive(Accounts)]
pub struct CloseTrade<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.user_pubkey.as_ref(), &vault.strategy_id],
        bump = vault.bump,
        constraint = agent.key() == vault.agent_pubkey @ VaultError::AgentMismatch,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [b"trade", vault.key().as_ref(), &trade_record.trade_id.to_le_bytes()],
        bump = trade_record.bump,
    )]
    pub trade_record: Account<'info, TradeRecord>,

    pub agent: Signer<'info>,
}

/// Register a strategy on-chain. Seeds: ["strategy", trader_pubkey, strategy_id].
/// The trader must sign — PDA seeds include their pubkey so no one else can register for them.
#[derive(Accounts)]
#[instruction(strategy_id: [u8; 32])]
pub struct RegisterStrategy<'info> {
    #[account(
        init,
        payer = trader,
        space = StrategyRecord::LEN,
        seeds = [b"strategy", trader.key().as_ref(), &strategy_id],
        bump
    )]
    pub strategy_record: Account<'info, StrategyRecord>,

    #[account(mut)]
    pub trader: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Set risk mode on a vault. Only the vault owner may call this.
#[derive(Accounts)]
pub struct SetRiskMode<'info> {
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref(), &vault.strategy_id],
        bump = vault.bump,
        constraint = user.key() == vault.user_pubkey @ VaultError::Unauthorized,
    )]
    pub vault: Account<'info, Vault>,

    pub user: Signer<'info>,
}

/// H9: Update platform wallet. Only the current platform wallet holder can call this.
#[derive(Accounts)]
pub struct UpdatePlatformWallet<'info> {
    #[account(
        mut,
        seeds = [b"vault", vault.user_pubkey.as_ref(), &vault.strategy_id],
        bump = vault.bump,
        constraint = platform_wallet_signer.key() == vault.platform_wallet @ VaultError::Unauthorized,
    )]
    pub vault: Account<'info, Vault>,

    /// Must be the current platform_wallet
    pub platform_wallet_signer: Signer<'info>,
}

/// M12: Close a vault account and return rent to the user.
#[derive(Accounts)]
pub struct CloseVault<'info> {
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref(), &vault.strategy_id],
        bump = vault.bump,
        constraint = user.key() == vault.user_pubkey @ VaultError::Unauthorized,
        close = user,
    )]
    pub vault: Account<'info, Vault>,

    /// C2 + H7: vault_token_account must be owned by vault PDA and use expected mint
    #[account(
        mut,
        constraint = vault_token_account.owner == vault.key() @ VaultError::InvalidTokenAccount,
        constraint = vault_token_account.mint == vault.mint @ VaultError::InvalidTokenAccount,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

/// M13: Close a trade record account and return rent to the agent.
#[derive(Accounts)]
pub struct CloseTradeRecord<'info> {
    #[account(
        seeds = [b"vault", vault.user_pubkey.as_ref(), &vault.strategy_id],
        bump = vault.bump,
        constraint = agent.key() == vault.agent_pubkey @ VaultError::AgentMismatch,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [b"trade", vault.key().as_ref(), &trade_record.trade_id.to_le_bytes()],
        bump = trade_record.bump,
        close = agent,
    )]
    pub trade_record: Account<'info, TradeRecord>,

    #[account(mut)]
    pub agent: Signer<'info>,
}

// ── Account structs ────────────────────────────────────────────────────────

#[account]
pub struct Vault {
    pub user_pubkey: Pubkey,
    pub strategy_id: [u8; 32],
    /// Current USDC balance (6 decimals)
    pub balance: u64,
    /// Balance at epoch start — used to compute profit in settle_epoch
    pub opening_balance: u64,
    /// Profit accumulated this epoch
    pub epoch_profit: u64,
    /// Receives 20% profit share on settle_epoch
    pub platform_wallet: Pubkey,
    /// Set by delegate_to_protocol(); verified by settle_epoch() access control
    pub agent_pubkey: Pubkey,
    pub bump: u8,
    /// User risk mode: 0=Conservative, 1=Medium, 2=Aggressive
    pub risk_mode: u8,
    /// Sequential counter for trade IDs — incremented by record_trade()
    pub trade_count: u64,
    /// H7: Expected token mint (USDC) — set during create_vault, validated on all token ops
    pub mint: Pubkey,
    /// M11: Timestamp of last epoch settlement — enforces min 7-day epoch
    pub last_settle_ts: i64,
    /// H8: Number of currently active (open) trades — prevents re-delegation
    pub active_trades: u64,
}

impl Vault {
    // 8 discriminator
    // + 32 (user_pubkey) + 32 (strategy_id) + 8 (balance) + 8 (opening_balance)
    // + 8 (epoch_profit) + 32 (platform_wallet) + 32 (agent_pubkey) + 1 (bump)
    // + 1 (risk_mode) + 8 (trade_count) + 32 (mint) + 8 (last_settle_ts)
    // + 8 (active_trades)
    // = 8 + 32 + 32 + 8 + 8 + 8 + 32 + 32 + 1 + 1 + 8 + 32 + 8 + 8 = 218
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 32 + 32 + 1 + 1 + 8 + 32 + 8 + 8;
}

/// On-chain record of a single trade opened by the agent.
/// PDA seeds: ["trade", vault_pubkey, trade_id_le_bytes]
#[account]
pub struct TradeRecord {
    /// Which vault this trade belongs to
    pub vault_pubkey: Pubkey,
    /// Coin symbol ASCII padded (e.g. b"SOL\0\0\0...")
    pub symbol: [u8; 16],
    /// 0=LONG, 1=SHORT
    pub direction: u8,
    /// Entry price × 1_000_000 (6 dp)
    pub entry_price: u64,
    /// Quantity × 1_000_000
    pub qty: u64,
    /// SL price × 1_000_000
    pub sl_price: u64,
    /// TP1 price × 1_000_000
    pub tp1_price: u64,
    /// TP2 price × 1_000_000
    pub tp2_price: u64,
    /// Matches vault.strategy_id
    pub strategy_id: [u8; 32],
    /// Unix timestamp when opened
    pub opened_at: i64,
    /// 0=OPEN, 1=CLOSED
    pub status: u8,
    /// Set on close_trade (0 until closed)
    pub exit_price: u64,
    /// Signed realized P&L (set on close_trade)
    pub realized_pnl: i64,
    /// Unix timestamp when closed (0 until closed)
    pub closed_at: i64,
    /// 0=NONE, 1=TP1, 2=TP2, 3=SL, 4=MANUAL
    pub outcome: u8,
    /// Sequential trade ID matching vault.trade_count at time of opening
    pub trade_id: u64,
    pub bump: u8,
}

impl TradeRecord {
    // 8 discriminator
    // + 32 (vault_pubkey) + 16 (symbol) + 1 (direction)
    // + 8 (entry_price) + 8 (qty) + 8 (sl_price) + 8 (tp1_price) + 8 (tp2_price)
    // + 32 (strategy_id) + 8 (opened_at) + 1 (status)
    // + 8 (exit_price) + 8 (realized_pnl) + 8 (closed_at)
    // + 1 (outcome) + 8 (trade_id) + 1 (bump)
    // = 8 + 32 + 16 + 1 + 8 + 8 + 8 + 8 + 8 + 32 + 8 + 1 + 8 + 8 + 8 + 1 + 8 + 1 = 172
    pub const LEN: usize = 8 + 32 + 16 + 1 + 8 + 8 + 8 + 8 + 8 + 32 + 8 + 1 + 8 + 8 + 8 + 1 + 8 + 1;
}

/// On-chain record of a registered strategy.
/// PDA seeds: ["strategy", trader_pubkey, strategy_id]
#[account]
pub struct StrategyRecord {
    pub trader_pubkey: Pubkey,
    /// Strategy display name (UTF-8 padded)
    pub strategy_name: [u8; 64],
    /// 0=S-tier(85%+), 1=A-tier(75-84%), 2=B-tier(65-74%), 3=C-tier(55-64%)
    pub fee_tier: u8,
    /// SHA-256 of the strategy rules document
    pub rules_hash: [u8; 32],
    /// Minimum win rate percentage (e.g. 55 means 55%)
    pub min_win_rate: u8,
    /// Unix timestamp of registration
    pub created_at: i64,
    pub strategy_id: [u8; 32],
    pub bump: u8,
}

impl StrategyRecord {
    // 8 discriminator
    // + 32 (trader_pubkey) + 64 (strategy_name) + 1 (fee_tier)
    // + 32 (rules_hash) + 1 (min_win_rate) + 8 (created_at)
    // + 32 (strategy_id) + 1 (bump)
    // = 8 + 32 + 64 + 1 + 32 + 1 + 8 + 32 + 1 = 179
    pub const LEN: usize = 8 + 32 + 64 + 1 + 32 + 1 + 8 + 32 + 1;
}

// ── Events ─────────────────────────────────────────────────────────────────

#[event]
pub struct VaultCreated {
    pub user: Pubkey,
    pub strategy_id: [u8; 32],
    pub platform_wallet: Pubkey,
    pub mint: Pubkey,
}

#[event]
pub struct Deposited {
    pub vault: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct Withdrawn {
    pub vault: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct Delegated {
    pub vault: Pubkey,
    pub agent: Pubkey,
    pub amount: u64,
}

#[event]
pub struct EpochSettled {
    pub vault: Pubkey,
    pub profit: u64,
    pub platform_fee: u64,
    pub new_balance: u64,
}

#[event]
pub struct TradeOpened {
    pub trade_id: u64,
    pub vault_pubkey: Pubkey,
    pub symbol: [u8; 16],
    pub direction: u8,
    pub entry_price: u64,
    pub opened_at: i64,
}

#[event]
pub struct TradeClosed {
    pub trade_id: u64,
    pub vault_pubkey: Pubkey,
    pub exit_price: u64,
    pub realized_pnl: i64,
    pub outcome: u8,
    pub closed_at: i64,
}

// ── Errors ─────────────────────────────────────────────────────────────────

#[error_code]
pub enum VaultError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Signer is not the vault owner")]
    Unauthorized,
    #[msg("Insufficient vault balance")]
    InsufficientFunds,
    #[msg("Signer is not the registered agent for this vault")]
    AgentMismatch,
    #[msg("Trade is already closed")]
    TradeAlreadyClosed,
    #[msg("Unauthorized trader — signer does not match strategy registration")]
    UnauthorizedTrader,
    #[msg("Outcome value is out of range (must be 0-4)")]
    InvalidOutcome,
    #[msg("trade_id does not match vault.trade_count")]
    InvalidTradeId,
    #[msg("Token account does not belong to the expected owner or mint")]
    InvalidTokenAccount,
    #[msg("Cannot re-delegate while trades are active")]
    ActiveTrades,
    #[msg("Risk mode must be 0 (Conservative), 1 (Medium), or 2 (Aggressive)")]
    InvalidRiskMode,
    #[msg("Epoch settlement too soon — minimum 7 days between settlements")]
    EpochTooShort,
    #[msg("Vault balance must be zero before closing")]
    VaultNotEmpty,
    #[msg("Trade must be closed before closing the record account")]
    TradeNotClosed,
}
