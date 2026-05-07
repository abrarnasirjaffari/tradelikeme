import { Connection, Transaction } from '@solana/web3.js'
import type { WalletContextState } from '@solana/wallet-adapter-react'

const HELIUS_RPC = import.meta.env.VITE_HELIUS_RPC_URL || 'https://api.devnet.solana.com'

export const connection = new Connection(HELIUS_RPC, 'confirmed')

/**
 * Decode a base64 string to a Uint8Array without relying on Node Buffer.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * Sign and submit a base64-encoded unsigned transaction via Phantom wallet.
 * Returns the transaction signature.
 */
export async function signAndSubmitTx(
  wallet: WalletContextState,
  serializedTxBase64: string
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected')
  }

  // Deserialize the unsigned tx from backend
  const txBytes = base64ToUint8Array(serializedTxBase64)
  const tx = Transaction.from(txBytes)

  // Set recent blockhash if not already set
  if (!tx.recentBlockhash) {
    const { blockhash } = await connection.getLatestBlockhash('finalized')
    tx.recentBlockhash = blockhash
  }

  // Set fee payer to connected wallet
  tx.feePayer = wallet.publicKey

  // Sign with Phantom
  const signedTx = await wallet.signTransaction(tx)

  // Submit to network
  const rawTx = signedTx.serialize()
  const signature = await connection.sendRawTransaction(rawTx, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })

  // Wait for confirmation
  await connection.confirmTransaction(signature, 'confirmed')

  return signature
}
