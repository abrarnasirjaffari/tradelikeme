use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

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
    pub bump: u8,
}

impl Vault {
    // 8 discriminator + 32 + 32 + 8 + 8 + 8 + 32 + 1
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 32 + 1;
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
}
