use anchor_lang::prelude::*;

declare_id!("CfBkwkkgaXAhMBWSiBTXet9uSE3biCQAiWAtjYRFZrSv");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[account]
pub struct Vault {
    /// Owner of this vault
    pub user_pubkey: Pubkey,
    /// Which strategy this vault belongs to (max 32 chars)
    pub strategy_id: [u8; 32],
    /// Current USDC balance in lamports (6 decimals)
    pub balance: u64,
    /// Balance at start of current epoch — used for profit calculation
    pub opening_balance: u64,
    /// Accumulated profit this epoch (balance - opening_balance when positive)
    pub epoch_profit: u64,
    /// Platform wallet that receives the 20% profit share on settle_epoch
    pub platform_wallet: Pubkey,
    /// Bump seed for the vault PDA
    pub bump: u8,
}

impl Vault {
    // 8 discriminator + 32 user_pubkey + 32 strategy_id + 8 balance
    // + 8 opening_balance + 8 epoch_profit + 32 platform_wallet + 1 bump
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 8 + 32 + 1;
}
