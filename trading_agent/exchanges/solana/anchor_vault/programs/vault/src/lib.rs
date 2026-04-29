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
