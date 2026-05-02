import bs58 from 'bs58'

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL ?? 'http://localhost:3001'

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom: boolean
        connect(): Promise<{ publicKey: { toBytes(): Uint8Array; toString(): string } }>
        signMessage(msg: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>
      }
    }
  }
}

export async function signInWithPhantom(): Promise<{ walletAddress: string } | { error: string }> {
  const phantom = window.phantom?.solana
  if (!phantom?.isPhantom) {
    return { error: 'Phantom wallet not found. Please install the Phantom browser extension.' }
  }

  try {
    // 1. Connect wallet
    const { publicKey } = await phantom.connect()
    const walletAddress = publicKey.toString()

    // 2. Fetch nonce from auth server
    const nonceRes = await fetch(`${AUTH_BASE_URL}/api/auth/phantom/nonce`)
    if (!nonceRes.ok) return { error: 'Failed to fetch nonce' }
    const { nonce } = await nonceRes.json() as { nonce: string }

    // 3. Build message and sign
    const message = `Sign in to TradeLikeMe\n\nNonce: ${nonce}\nWallet: ${walletAddress}`
    const messageBytes = new TextEncoder().encode(message)
    const { signature: signatureBytes } = await phantom.signMessage(messageBytes, 'utf8')
    const signature = bs58.encode(signatureBytes)

    // 4. Verify with auth server
    const verifyRes = await fetch(`${AUTH_BASE_URL}/api/auth/phantom/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ walletAddress, signature, message, nonce }),
    })

    if (!verifyRes.ok) {
      const body = await verifyRes.json().catch(() => ({})) as { message?: string }
      return { error: body.message ?? 'Phantom sign-in failed' }
    }

    return { walletAddress }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('User rejected')) {
      return { error: 'Sign-in cancelled' }
    }
    return { error: err instanceof Error ? err.message : 'Phantom sign-in failed' }
  }
}
