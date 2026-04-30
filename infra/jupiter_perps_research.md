# Jupiter Perps — JC1 Research Findings

Verified Apr 30, 2026 via web search + on-chain RPC checks.

## Key Facts

- **Program ID**: `PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu` — confirmed live on mainnet
- **No devnet**: program is NOT deployed on devnet. Mainnet-only. JC10 uses mainnet with small amounts.
- **Max leverage**: 100x (higher than Zeta's 50x — this is why it's the fallback)
- **Pairs**: SOL, BTC, ETH only
- **Integration method**: anchorpy + on-chain IDL (no official Python SDK)

## Reference Repos

- IDL + TypeScript reference: `github.com/julianfssen/jupiter-perps-anchor-idl-parsing` (linked from Jupiter docs)
  - IDL JSON at: `src/idl/jupiter-perpetuals-idl-json.json`
- Python decode example: `github.com/lukatavcer/jupiter_perpetuals` (anchorpy + solana-py, read-only decoding)

## Execution Model — Two Paths

### Path 1: Keeper/Request model (async, ~2-5s delay)
1. User calls `createIncreasePositionMarketRequest`
2. Keeper bots pick up the request on-chain
3. Keeper calls `increasePosition4` — trade opens
4. Client polls Position PDA to confirm

### Path 2: Instant model (preferred for trading agent)
- `instantIncreasePosition` — opens immediately, no keeper wait
- `instantDecreasePosition` — closes immediately, no keeper wait
- `instantCreateTpsl` — set SL + TP in one instruction
- `instantUpdateTpsl` — modify existing SL/TP

**Use the instant path** — trading agent needs immediate confirmation.

## Full IDL Instruction List (position-related)

```
createIncreasePositionMarketRequest   ← keeper path open
createDecreasePositionRequest2         ← keeper path close
createDecreasePositionMarketRequest    ← keeper path market close
updateDecreasePositionRequest2
closePositionRequest
closePositionRequest2
increasePosition4                      ← called BY keeper, not user
decreasePosition4                      ← called BY keeper, not user
decreasePositionWithTpsl
liquidateFullPosition4
instantIncreasePosition                ← use this (no keeper wait)
instantDecreasePosition                ← use this (no keeper wait)
instantCreateTpsl                      ← use this for SL/TP
instantCreateLimitOrder
instantUpdateLimitOrder
instantUpdateTpsl                      ← use this to modify SL/TP
```

## Account/PDA Structure

- **Perpetuals config PDA**: derived from `[b"perpetuals"]`
- **Pool PDA**: one pool (JLP pool) — mainnet address to fetch from IDL constants
- **Position PDA seeds**: `[b"position", owner_pubkey, pool_pubkey, custody_pubkey, side_bytes]`
- **Custody PDA**: one per token (SOL custody, BTC custody, ETH custody)
- **Oracle**: Pyth price feed account for each token

## Important Gotchas

1. **WSOL required**: SOL collateral must be wrapped. Bundle `createAssociatedTokenAccount` + `syncNative` before open instruction.
2. **Priority fees mandatory**: Position instructions are compute-heavy (~200k units). Without priority fees they drop during congestion.
3. **Compute budget**: Add `SetComputeUnitLimit(200_000)` + `SetComputeUnitPrice(priority_fee)` to every tx.
4. **IDL fetch**: Download `src/idl/jupiter-perpetuals-idl-json.json` from julianfssen repo and save to `infra/jupiter_perps_idl.json` before running.

## Setup Steps Before JC3 Can Run

1. `curl -o infra/jupiter_perps_idl.json https://raw.githubusercontent.com/julianfssen/jupiter-perps-anchor-idl-parsing/main/src/idl/jupiter-perpetuals-idl-json.json`
2. Look up mainnet Pool + Custody addresses from IDL or on-chain (Solscan program page)
3. Fund mainnet wallet with USDC for first test (JC10)
