import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { assert } from "chai";
import { Vault } from "../target/types/vault";

// ── helpers ──────────────────────────────────────────────────────────────────

// Transfer SOL from provider wallet instead of requestAirdrop to avoid devnet rate limits
async function fundSol(
  provider: anchor.AnchorProvider,
  dest: PublicKey,
  lamports: number = 2e9
): Promise<void> {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: dest,
      lamports,
    })
  );
  await provider.sendAndConfirm(tx);
}

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

    await fundSol(provider, user.publicKey);

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
    await fundSol(provider, poorUser.publicKey);

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
    await fundSol(provider, attacker.publicKey);

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

    await fundSol(provider, user.publicKey);

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
    await fundSol(provider, attacker.publicKey);

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

// ── V20: vault PDA is unique per (user × strategy) ───────────────────────────

describe("vault — V20: PDA uniqueness per (user × strategy)", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Vault as Program<Vault>;

  let mint: PublicKey;
  let mintAuthority: Keypair;
  let platformWallet: Keypair;

  before(async () => {
    mintAuthority = Keypair.generate();
    platformWallet = Keypair.generate();
    mint = await createMint(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      mintAuthority.publicKey,
      null,
      6
    );
  });

  async function airdrop(pubkey: PublicKey): Promise<void> {
    await fundSol(provider, pubkey);
  }

  it("V20-1: same user + different strategy_id → different PDA addresses", async () => {
    const user = Keypair.generate();
    await airdrop(user.publicKey);

    const sid1 = strategyId(20);
    const sid2 = strategyId(21);

    const [pda1] = await deriveVaultPda(program.programId, user.publicKey, sid1);
    const [pda2] = await deriveVaultPda(program.programId, user.publicKey, sid2);

    assert.notEqual(
      pda1.toBase58(),
      pda2.toBase58(),
      "different strategy_id must produce a different PDA for the same user"
    );

    // Both can be created without conflict
    await program.methods
      .createVault(sid1, platformWallet.publicKey)
      .accounts({ vault: pda1, user: user.publicKey, systemProgram: SystemProgram.programId })
      .signers([user])
      .rpc();

    await program.methods
      .createVault(sid2, platformWallet.publicKey)
      .accounts({ vault: pda2, user: user.publicKey, systemProgram: SystemProgram.programId })
      .signers([user])
      .rpc();

    const state1 = await program.account.vault.fetch(pda1);
    const state2 = await program.account.vault.fetch(pda2);

    assert.equal(state1.userPubkey.toBase58(), user.publicKey.toBase58());
    assert.equal(state2.userPubkey.toBase58(), user.publicKey.toBase58());
    assert.deepEqual(Array.from(state1.strategyId), sid1, "vault 1 stores strategy 20");
    assert.deepEqual(Array.from(state2.strategyId), sid2, "vault 2 stores strategy 21");
  });

  it("V20-2: different users + same strategy_id → different PDA addresses", async () => {
    const userA = Keypair.generate();
    const userB = Keypair.generate();
    await airdrop(userA.publicKey);
    await airdrop(userB.publicKey);

    const sid = strategyId(30);

    const [pdaA] = await deriveVaultPda(program.programId, userA.publicKey, sid);
    const [pdaB] = await deriveVaultPda(program.programId, userB.publicKey, sid);

    assert.notEqual(
      pdaA.toBase58(),
      pdaB.toBase58(),
      "same strategy_id with different users must produce different PDAs"
    );

    // Both can be created without conflict
    await program.methods
      .createVault(sid, platformWallet.publicKey)
      .accounts({ vault: pdaA, user: userA.publicKey, systemProgram: SystemProgram.programId })
      .signers([userA])
      .rpc();

    await program.methods
      .createVault(sid, platformWallet.publicKey)
      .accounts({ vault: pdaB, user: userB.publicKey, systemProgram: SystemProgram.programId })
      .signers([userB])
      .rpc();

    const stateA = await program.account.vault.fetch(pdaA);
    const stateB = await program.account.vault.fetch(pdaB);

    assert.equal(stateA.userPubkey.toBase58(), userA.publicKey.toBase58());
    assert.equal(stateB.userPubkey.toBase58(), userB.publicKey.toBase58());
    assert.deepEqual(Array.from(stateA.strategyId), sid);
    assert.deepEqual(Array.from(stateB.strategyId), sid);
  });

  it("V20-3: same user + same strategy_id → second create_vault fails (no duplicates)", async () => {
    const user = Keypair.generate();
    await airdrop(user.publicKey);

    const sid = strategyId(40);
    const [pda] = await deriveVaultPda(program.programId, user.publicKey, sid);

    // First creation succeeds
    await program.methods
      .createVault(sid, platformWallet.publicKey)
      .accounts({ vault: pda, user: user.publicKey, systemProgram: SystemProgram.programId })
      .signers([user])
      .rpc();

    // Second creation with identical seeds must fail
    let threw = false;
    try {
      await program.methods
        .createVault(sid, platformWallet.publicKey)
        .accounts({ vault: pda, user: user.publicKey, systemProgram: SystemProgram.programId })
        .signers([user])
        .rpc();
    } catch {
      threw = true;
    }
    assert.isTrue(threw, "creating a vault with duplicate (user × strategy) seeds must fail");
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

    await fundSol(provider, u.publicKey);

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

    await fundSol(provider, user.publicKey);

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
    await fundSol(provider, impostor.publicKey, 1e9);

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
