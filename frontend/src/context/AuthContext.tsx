import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authClient } from '../lib/auth-client'
import { signInWithPhantom as phantomSignIn } from '../lib/phantom-signin'

type User = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date
  walletAddress?: string | null
  twoFactorEnabled?: boolean
}

type Session = {
  id: string
  userId: string
  expiresAt: Date
}

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  walletAddress: string | null
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signInWithPhantom: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const walletAddress = user?.walletAddress ?? null

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setUser((data?.user as User) ?? null)
      setSession((data?.session as Session) ?? null)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await authClient.signUp.email({ email, password, name })
    if (error) return { error: error.message ?? 'Sign up failed' }
    setUser((data?.user as User) ?? null)
    setSession(null)
    return {}
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await authClient.signIn.email({ email, password })
    if (error) return { error: error.message ?? 'Sign in failed' }
    setUser((data?.user as User) ?? null)
    setSession(null)
    return {}
  }

  async function signInWithPhantom() {
    const result = await phantomSignIn()
    if ('error' in result) return { error: result.error }
    // Refresh session from server (cookie was set by verify endpoint)
    const { data } = await authClient.getSession()
    setUser((data?.user as User) ?? null)
    setSession((data?.session as Session) ?? null)
    return {}
  }

  async function signOut() {
    await authClient.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, walletAddress, signUp, signIn, signInWithPhantom, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
