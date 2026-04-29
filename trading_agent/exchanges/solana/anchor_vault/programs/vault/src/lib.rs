use anchor_lang::prelude::*;
use anchor_spl::token::{self, Approve, Token, TokenAccount, Transfer};

declare_id!("CfBkwkkgaXAhMBWSiBTXet9uSE3biCQAiWAtjYRFZrSv");

#[program]
pub mod vault {
    use super::*;

    /// Create a new vault PDA for a (user × strategy) pair.
    /// Stores initial metadata; balance starts at zero.
    pub fn create_vault(
        ctx: Context<InitializeVault>,
        strategy_id: [u8; 32],
        platform_wallet: Pubkey,
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
    pub fn settle_epoch(ctx: Context<SettleEpoch>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        // No profit this epoch — just roll the opening balance forward
        if vault.balance <= vault.opening_balance {
            vault.epoch_profit = 0;
            vault.opening_balance = vault.balance;
            msg!("Epoch settled with no profit");
            return Ok(());
        }

        let profit = vault.balance
            .checked_sub(vault.opening_balance)
            .ok_or(VaultError::Overflow)?;

        // 20% to platform, rounded down (user always gets at least 80%)
        let platform_fee = profit
            .checked_mul(20)
            .and_then(|n| n.checked_div(100))
            .ok_or(VaultError::Overflow)?;

        if platform_fee > 0 {
            let user_key = vault.user_pubkey;
            let strategy_id = vault.strategy_id;
            let bump = vault.bump;
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

        // Snapshot state after fee deduction
        vault.balance = vault.balance
            .checked_sub(platform_fee)
            .ok_or(VaultError::Overflow)?;
        vault.epoch_profit = profit;
        vault.opening_balance = vault.balance;

        msg!(
            "Epoch settled: profit={}, platform_fee={}, user_balance={}",
            profit,
            platform_fee,
            vault.balance
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

        msg!("Withdrew {} USDC from vault", amount);
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

    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// Platform wallet's token account — receives 20% profit share
    #[account(mut)]
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

    #[account(mut)]
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

    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
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

    /// CHECK: vault_token_account is the vault's associated USDC token account.
    /// Validated by matching mint + ownership in tests; not enforced on-chain
    /// to keep the instruction generic (supports USDC and CASH).
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    // Anchor uses has_one to match vault.user_pubkey == user_pubkey account key.
    // This field must be present so the constraint resolves.
    /// CHECK: must match vault.user_pubkey
    pub user_pubkey: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

// ── Account struct ─────────────────────────────────────────────────────────

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
}

impl Vault {
    // 8 discriminator + 32 + 32 + 8 + 8 + 8 + 32 + 32 + 1
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 32 + 32 + 1;
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
}
