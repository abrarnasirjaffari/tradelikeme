import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { clusterApiUrl } from '@solana/web3.js'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

const network = WalletAdapterNetwork.Devnet
const endpoint = import.meta.env.VITE_HELIUS_RPC_URL || clusterApiUrl(network)

function Root() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <StrictMode>
      <ErrorBoundary>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <BrowserRouter>
              <AuthProvider>
                <App />
                <Toaster position="top-right" theme="dark" richColors />
              </AuthProvider>
            </BrowserRouter>
          </WalletProvider>
        </ConnectionProvider>
      </ErrorBoundary>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
