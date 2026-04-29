import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import { Vault } from "../target/types/vault";

// ── helpers ──────────────────────────────────────────────────────────────────

async function makeTokenAccount(
  provider: anchor.AnchorProvider,
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  // Pass an explicit Keypair so spl-token creates a plain token account (not an
  // associated token account). Associated accounts require the owner to be on the
  // ed25519 curve, which PDAs are not — this avoids TokenOwnerOffCurveError.
  const kp = Keypair.generate();
  return createAccount(provider.connection, (provider.wallet as anchor.Wallet).payer, mint, owner, kp);
}

async function fundTokenAccount(
  provider: anchor.AnchorProvider,
  mint: PublicKey,
  mintAuthority: Keypair,
  dest: PublicKey,
  amount: number
): Promise<void> {
  await mintTo(
    provider.connection,
    (provider.wallet as anchor.Wallet).payer,
    mint,
    dest,
    mintAuthority,
    amount
  );
}

function strategyId(n: number): number[] {
  const buf = Buffer.alloc(32);
  buf.writeUInt8(n, 0);
  return Array.from(buf);
}

async function deriveVaultPda(
  programId: PublicKey,
  userPubkey: PublicKey,
  sid: number[]
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), userPubkey.toBuffer(), Buffer.from(sid)],
    programId
  );
}

// ── shared fixtures ───────────────────────────────────────────────────────────

describe("vault — deposit()", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Vault as Program<Vault>;

  let mint: PublicKey;
  let mintAuthority: Keypair;
  let user: Keypair;
  let platformWallet: Keypair;
  let sid: number[];
  let vaultPda: PublicKey;
  let vaultBump: number;
  let userTokenAccount: PublicKey;
  let vaultTokenAccount: PublicKey;

  before(async () => {
    mintAuthority = Keypair.generate();
    user = Keypair.generate();
    platformWallet = Keypair.generate();
    sid = strategyId(1);

    // Fund user with SOL for rent + fees
    const sig = await provider.connection.requestAirdrop(user.publicKey, 2e9);
    await provider.connection.confirmTransaction(sig);

    // Create USDC-like mint (6 decimals)
    mint = await createMint(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      mintAuthority.publicKey,
      null,
      6
    );

    // Derive vault PDA
    [vaultPda, vaultBump] = await deriveVaultPda(program.programId, user.publicKey, sid);

    // Token accounts
    userTokenAccount = await makeTokenAccount(provider, mint, user.publicKey);
    vaultTokenAccount = await makeTokenAccount(provider, mint, vaultPda);

    // Mint 1000 USDC (1_000_000_000 raw) to user
    await fundTokenAccount(provider, mint, mintAuthority, userTokenAccount, 1_000_000_000);

    // Create the vault
    await program.methods
      .createVault(sid, platformWallet.publicKey)
      .accounts({
        vault: vaultPda,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
  });

  // ── V13: deposit() tests ───────────────────────────────────────────────────

  it("V13-1: deposits tokens and updates vault.balance", async () => {
    const amount = 100_000_000; // 100 USDC

    const userBefore = await getAccount(provider.connection, userTokenAccount);
    const vaultBefore = await getAccount(provider.connection, vaultTokenAccount);

    await program.methods
      .deposit(new BN(amount))
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        userTokenAccount,
        user: user.publicKey,
        userPubkey: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const userAfter = await getAccount(provider.connection, userTokenAccount);
    const vaultAfter = await getAccount(provider.connection, vaultTokenAccount);
    const vaultState = await program.account.vault.fetch(vaultPda);

    assert.equal(
      Number(userAfter.amount),
      Number(userBefore.amount) - amount,
      "user token balance should decrease by deposit amount"
    );
    assert.equal(
      Number(vaultAfter.amount),
      Number(vaultBefore.amount) + amount,
      "vault token balance should increase by deposit amount"
    );
    assert.equal(
      vaultState.balance.toNumber(),
      amount,
      "vault.balance should equal deposit amount"
    );
  });

  it("V13-2: second deposit accumulates correctly", async () => {
    const firstDeposit = 100_000_000;
    const secondDeposit = 50_000_000; // 50 USDC

    await program.methods
      .deposit(new BN(secondDeposit))
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        userTokenAccount,
        user: user.publicKey,
        userPubkey: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const vaultState = await program.account.vault.fetch(vaultPda);
    assert.equal(
      vaultState.balance.toNumber(),
      firstDeposit + secondDeposit,
      "vault.balance should accumulate across multiple deposits"
    );
  });

  it("V13-3: rejects zero-amount deposit", async () => {
    let threw = false;
    try {
      await program.methods
        .deposit(new BN(0))
        .accounts({
          vault: vaultPda,
          vaultTokenAccount,
          userTokenAccount,
          user: user.publicKey,
          userPubkey: user.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();
    } catch (err: any) {
      threw = true;
      assert.include(
        err.toString(),
        "ZeroAmount",
        "error should be VaultError::ZeroAmount"
      );
    }
    assert.isTrue(threw, "deposit(0) should have thrown");
  });

  it("V13-4: rejects deposit when user has insufficient token balance", async () => {
    // Use a fresh user with no token balance
    const poorUser = Keypair.generate();
    const fundSig = await provider.connection.requestAirdrop(poorUser.publicKey, 2e9);
    await provider.connection.confirmTransaction(fundSig);

    const poorSid = strategyId(99);
    const [poorVaultPda] = await deriveVaultPda(program.programId, poorUser.publicKey, poorSid);
    const poorUserTokenAccount = await makeTokenAccount(provider, mint, poorUser.publicKey);
    const poorVaultTokenAccount = await makeTokenAccount(provider, mint, poorVaultPda);

    await program.methods
      .createVault(poorSid, platformWallet.publicKey)
      .accounts({
        vault: poorVaultPda,
        user: poorUser.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([poorUser])
      .rpc();

    let threw = false;
    try {
      await program.methods
        .deposit(new BN(1_000_000))
        .accounts({
          vault: poorVaultPda,
          vaultTokenAccount: poorVaultTokenAccount,
          userTokenAccount: poorUserTokenAccount,
          user: poorUser.publicKey,
          userPubkey: poorUser.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .signers([poorUser])
        .rpc();
    } catch {
      threw = true;
    }
    assert.isTrue(threw, "deposit with zero balance should fail");
  });

  it("V13-5: non-owner cannot deposit into another user's vault", async () => {
    const attacker = Keypair.generate();
    const atkSig = await provider.connection.requestAirdrop(attacker.publicKey, 2e9);
    await provider.connection.confirmTransaction(atkSig);

    const attackerTokenAccount = await makeTokenAccount(provider, mint, attacker.publicKey);
    await fundTokenAccount(provider, mint, mintAuthority, attackerTokenAccount, 10_000_000);

    let threw = false;
    try {
      // attacker tries to pass their key as user but the vault PDA was seeded with user.publicKey
      await program.methods
        .deposit(new BN(1_000_000))
        .accounts({
          vault: vaultPda,
          vaultTokenAccount,
          userTokenAccount: attackerTokenAccount,
          user: attacker.publicKey,
          userPubkey: attacker.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .signers([attacker])
        .rpc();
    } catch {
      threw = true;
    }
    assert.isTrue(threw, "attacker should not be able to deposit into another user's vault");
  });
});

// ── V14: withdraw() tests ─────────────────────────────────────────────────────

describe("vault — withdraw()", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Vault as Program<Vault>;

  let mint: PublicKey;
  let mintAuthority: Keypair;
  let user: Keypair;
  let platformWallet: Keypair;
  let sid: number[];
  let vaultPda: PublicKey;
  let userTokenAccount: PublicKey;
  let vaultTokenAccount: PublicKey;

  const INITIAL_DEPOSIT = 500_000_000; // 500 USDC

  before(async () => {
    mintAuthority = Keypair.generate();
    user = Keypair.generate();
    platformWallet = Keypair.generate();
    sid = strategyId(2);

    const sig = await provider.connection.requestAirdrop(user.publicKey, 2e9);
    await provider.connection.confirmTransaction(sig);

    mint = await createMint(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      mintAuthority.publicKey,
      null,
      6
    );

    [vaultPda] = await deriveVaultPda(program.programId, user.publicKey, sid);

    userTokenAccount = await makeTokenAccount(provider, mint, user.publicKey);
    vaultTokenAccount = await makeTokenAccount(provider, mint, vaultPda);

    await fundTokenAccount(provider, mint, mintAuthority, userTokenAccount, 1_000_000_000);

    await program.methods
      .createVault(sid, platformWallet.publicKey)
      .accounts({
        vault: vaultPda,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Pre-load vault with 500 USDC so withdraw tests have funds to work with
    await program.methods
      .deposit(new BN(INITIAL_DEPOSIT))
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        userTokenAccount,
        user: user.publicKey,
        userPubkey: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();
  });

  it("V14-1: withdraws tokens and updates vault.balance", async () => {
    const amount = 100_000_000; // 100 USDC

    const userBefore = await getAccount(provider.connection, userTokenAccount);
    const vaultBefore = await getAccount(provider.connection, vaultTokenAccount);
    const stateBefore = await program.account.vault.fetch(vaultPda);

    await program.methods
      .withdraw(new BN(amount))
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        userTokenAccount,
        user: user.publicKey,
        userPubkey: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const userAfter = await getAccount(provider.connection, userTokenAccount);
    const vaultAfter = await getAccount(provider.connection, vaultTokenAccount);
    const stateAfter = await program.account.vault.fetch(vaultPda);

    assert.equal(
      Number(userAfter.amount),
      Number(userBefore.amount) + amount,
      "user token balance should increase by withdrawn amount"
    );
    assert.equal(
      Number(vaultAfter.amount),
      Number(vaultBefore.amount) - amount,
      "vault token balance should decrease by withdrawn amount"
    );
    assert.equal(
      stateAfter.balance.toNumber(),
      stateBefore.balance.toNumber() - amount,
      "vault.balance should decrease by withdrawn amount"
    );
  });

  it("V14-2: full withdrawal drains vault to zero", async () => {
    const stateNow = await program.account.vault.fetch(vaultPda);
    const remaining = stateNow.balance.toNumber();

    await program.methods
      .withdraw(new BN(remaining))
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        userTokenAccount,
        user: user.publicKey,
        userPubkey: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const stateAfter = await program.account.vault.fetch(vaultPda);
    const vaultAfter = await getAccount(provider.connection, vaultTokenAccount);

    assert.equal(stateAfter.balance.toNumber(), 0, "vault.balance should be 0 after full withdrawal");
    assert.equal(Number(vaultAfter.amount), 0, "vault token account should be empty");
  });

  it("V14-3: rejects zero-amount withdrawal", async () => {
    // Re-deposit so vault has funds (balance was drained in V14-2)
    await program.methods
      .deposit(new BN(10_000_000))
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        userTokenAccount,
        user: user.publicKey,
        userPubkey: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    let threw = false;
    try {
      await program.methods
        .withdraw(new BN(0))
        .accounts({
          vault: vaultPda,
          vaultTokenAccount,
          userTokenAccount,
          user: user.publicKey,
          userPubkey: user.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();
    } catch (err: any) {
      threw = true;
      assert.include(err.toString(), "ZeroAmount", "error should be VaultError::ZeroAmount");
    }
    assert.isTrue(threw, "withdraw(0) should have thrown");
  });

  it("V14-4: rejects withdrawal exceeding vault balance", async () => {
    const state = await program.account.vault.fetch(vaultPda);
    const overAmount = state.balance.toNumber() + 1_000_000; // 1 USDC over balance

    let threw = false;
    try {
      await program.methods
        .withdraw(new BN(overAmount))
        .accounts({
          vault: vaultPda,
          vaultTokenAccount,
          userTokenAccount,
          user: user.publicKey,
          userPubkey: user.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();
    } catch (err: any) {
      threw = true;
      assert.include(
        err.toString(),
        "InsufficientFunds",
        "error should be VaultError::InsufficientFunds"
      );
    }
    assert.isTrue(threw, "withdraw above balance should have thrown");
  });

  it("V14-5: non-owner cannot withdraw from another user's vault", async () => {
    const attacker = Keypair.generate();
    const atkSig = await provider.connection.requestAirdrop(attacker.publicKey, 2e9);
    await provider.connection.confirmTransaction(atkSig);

    const attackerTokenAccount = await makeTokenAccount(provider, mint, attacker.publicKey);

    let threw = false;
    try {
      // Attacker passes their key as `user`, but vault PDA was seeded with owner's key
      await program.methods
        .withdraw(new BN(1_000_000))
        .accounts({
          vault: vaultPda,
          vaultTokenAccount,
          userTokenAccount: attackerTokenAccount,
          user: attacker.publicKey,
          userPubkey: attacker.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .signers([attacker])
        .rpc();
    } catch {
      threw = true;
    }
    assert.isTrue(threw, "attacker should not be able to withdraw from another user's vault");
  });
});

// ── V15: settle_epoch() tests — 20/80 split math ─────────────────────────────

describe("vault — settle_epoch()", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Vault as Program<Vault>;

  let mint: PublicKey;
  let mintAuthority: Keypair;
  let user: Keypair;
  let agent: Keypair;
  let platformWallet: Keypair;
  let sid: number[];
  let vaultPda: PublicKey;
  let userTokenAccount: PublicKey;
  let vaultTokenAccount: PublicKey;
  let platformTokenAccount: PublicKey;

  async function setupFreshVault(sidN: number, depositAmount: number) {
    const u = Keypair.generate();
    const a = Keypair.generate();
    const pw = Keypair.generate();
    const s = strategyId(sidN);

    const sig = await provider.connection.requestAirdrop(u.publicKey, 2e9);
    await provider.connection.confirmTransaction(sig);

    const [pda] = await deriveVaultPda(program.programId, u.publicKey, s);
    const uTA = await makeTokenAccount(provider, mint, u.publicKey);
    const vTA = await makeTokenAccount(provider, mint, pda);
    const pwTA = await makeTokenAccount(provider, mint, pw.publicKey);

    await fundTokenAccount(provider, mint, mintAuthority, uTA, depositAmount + 1_000_000_000);

    await program.methods
      .createVault(s, pw.publicKey)
      .accounts({ vault: pda, user: u.publicKey, systemProgram: SystemProgram.programId })
      .signers([u])
      .rpc();

    await program.methods
      .deposit(new BN(depositAmount))
      .accounts({
        vault: pda,
        vaultTokenAccount: vTA,
        userTokenAccount: uTA,
        user: u.publicKey,
        userPubkey: u.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([u])
      .rpc();

    // delegate so agent_pubkey is stored on vault
    await program.methods
      .delegateToProtocol(new BN(depositAmount))
      .accounts({
        vault: pda,
        vaultTokenAccount: vTA,
        agent: a.publicKey,
        user: u.publicKey,
        userPubkey: u.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([u])
      .rpc();

    // Baseline: settle once with no profit so opening_balance == depositAmount
    // Without this, the first real settle_epoch would treat the entire deposit as profit.
    await program.methods
      .settleEpoch()
      .accounts({
        vault: pda,
        vaultTokenAccount: vTA,
        platformTokenAccount: pwTA,
        agent: a.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([a])
      .rpc();

    return { u, a, pw, s, pda, uTA, vTA, pwTA };
  }

  before(async () => {
    mintAuthority = Keypair.generate();
    user = Keypair.generate();
    agent = Keypair.generate();
    platformWallet = Keypair.generate();
    sid = strategyId(3);

    const sig = await provider.connection.requestAirdrop(user.publicKey, 2e9);
    await provider.connection.confirmTransaction(sig);

    mint = await createMint(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      mintAuthority.publicKey,
      null,
      6
    );

    [vaultPda] = await deriveVaultPda(program.programId, user.publicKey, sid);
    userTokenAccount = await makeTokenAccount(provider, mint, user.publicKey);
    vaultTokenAccount = await makeTokenAccount(provider, mint, vaultPda);
    platformTokenAccount = await makeTokenAccount(provider, mint, platformWallet.publicKey);

    await fundTokenAccount(provider, mint, mintAuthority, userTokenAccount, 2_000_000_000);

    await program.methods
      .createVault(sid, platformWallet.publicKey)
      .accounts({ vault: vaultPda, user: user.publicKey, systemProgram: SystemProgram.programId })
      .signers([user])
      .rpc();

    await program.methods
      .deposit(new BN(1_000_000_000))
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        userTokenAccount,
        user: user.publicKey,
        userPubkey: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    await program.methods
      .delegateToProtocol(new BN(1_000_000_000))
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        agent: agent.publicKey,
        user: user.publicKey,
        userPubkey: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    // Baseline: settle once with no profit so opening_balance == initial deposit.
    // Without this, the first real settle_epoch sees the whole deposit as profit.
    await program.methods
      .settleEpoch()
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        platformTokenAccount,
        agent: agent.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([agent])
      .rpc();
  });

  it("V15-1: 20/80 split — platform gets exactly 20% of profit", async () => {
    // Simulate trading profit: deposit 200 USDC on top of the initial 1000 USDC.
    // This moves tokens into the vault token account AND increments vault.balance,
    // so settle_epoch sees profit = balance - opening_balance = 200 USDC.
    const profit = 200_000_000; // 200 USDC
    await program.methods
      .deposit(new BN(profit))
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        userTokenAccount,
        user: user.publicKey,
        userPubkey: user.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const stateBefore = await program.account.vault.fetch(vaultPda);
    const platformBefore = await getAccount(provider.connection, platformTokenAccount);

    await program.methods
      .settleEpoch()
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        platformTokenAccount,
        agent: agent.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([agent])
      .rpc();

    const stateAfter = await program.account.vault.fetch(vaultPda);
    const platformAfter = await getAccount(provider.connection, platformTokenAccount);

    const expectedFee = Math.floor(profit * 20 / 100); // 40_000_000
    const expectedUserBalance = stateBefore.balance.toNumber() - expectedFee;

    assert.equal(
      Number(platformAfter.amount) - Number(platformBefore.amount),
      expectedFee,
      "platform should receive exactly 20% of profit"
    );
    assert.equal(
      stateAfter.balance.toNumber(),
      expectedUserBalance,
      "vault.balance should retain exactly 80% of profit"
    );
    assert.equal(
      stateAfter.epochProfit.toNumber(),
      profit,
      "vault.epoch_profit should record total profit before split"
    );
  });

  it("V15-2: opening_balance rolls forward after settlement", async () => {
    const stateAfter = await program.account.vault.fetch(vaultPda);
    assert.equal(
      stateAfter.openingBalance.toNumber(),
      stateAfter.balance.toNumber(),
      "opening_balance should equal post-settlement balance (ready for next epoch)"
    );
  });

  it("V15-3: no profit epoch — platform receives nothing, opening_balance resets", async () => {
    // No new funds — vault.balance == opening_balance so no profit
    const stateBefore = await program.account.vault.fetch(vaultPda);
    const platformBefore = await getAccount(provider.connection, platformTokenAccount);

    await program.methods
      .settleEpoch()
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        platformTokenAccount,
        agent: agent.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([agent])
      .rpc();

    const stateAfter = await program.account.vault.fetch(vaultPda);
    const platformAfter = await getAccount(provider.connection, platformTokenAccount);

    assert.equal(
      Number(platformAfter.amount),
      Number(platformBefore.amount),
      "platform should receive nothing when there is no profit"
    );
    assert.equal(
      stateAfter.balance.toNumber(),
      stateBefore.balance.toNumber(),
      "vault.balance should be unchanged when there is no profit"
    );
    assert.equal(stateAfter.epochProfit.toNumber(), 0, "epoch_profit should be 0");
  });

  it("V15-4: rounding — platform gets floor(profit * 20 / 100), user never shortchanged", async () => {
    // Use a fresh vault with odd profit that doesn't divide evenly
    const { u, a, pw, s, pda, uTA, vTA, pwTA } = await setupFreshVault(10, 1_000_000_000);

    // Add 1 raw unit profit (indivisible by 5) — floor(1 * 20 / 100) = 0
    const oddProfit = 1;
    await program.methods
      .deposit(new BN(oddProfit))
      .accounts({
        vault: pda,
        vaultTokenAccount: vTA,
        userTokenAccount: uTA,
        user: u.publicKey,
        userPubkey: u.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([u])
      .rpc();

    const stateBefore = await program.account.vault.fetch(pda);
    const platformBefore = await getAccount(provider.connection, pwTA);

    await program.methods
      .settleEpoch()
      .accounts({
        vault: pda,
        vaultTokenAccount: vTA,
        platformTokenAccount: pwTA,
        agent: a.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([a])
      .rpc();

    const stateAfter = await program.account.vault.fetch(pda);
    const platformAfter = await getAccount(provider.connection, pwTA);

    // floor(1 * 20 / 100) = 0 — measure delta so prior epoch fees don't interfere
    assert.equal(
      Number(platformAfter.amount) - Number(platformBefore.amount),
      0,
      "platform fee should floor to 0 on tiny profit"
    );
    assert.equal(
      stateAfter.balance.toNumber(),
      stateBefore.balance.toNumber(),
      "user balance unchanged when fee rounds to zero"
    );
  });

  it("V15-5: non-agent cannot call settle_epoch", async () => {
    const impostor = Keypair.generate();
    const impostorSig = await provider.connection.requestAirdrop(impostor.publicKey, 1e9);
    await provider.connection.confirmTransaction(impostorSig);

    let threw = false;
    try {
      await program.methods
        .settleEpoch()
        .accounts({
          vault: vaultPda,
          vaultTokenAccount,
          platformTokenAccount,
          agent: impostor.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .signers([impostor])
        .rpc();
    } catch (err: any) {
      threw = true;
      assert.include(err.toString(), "AgentMismatch", "error should be VaultError::AgentMismatch");
    }
    assert.isTrue(threw, "non-agent should not be able to call settle_epoch");
  });
});
