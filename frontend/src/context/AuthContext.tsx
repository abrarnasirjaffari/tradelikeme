import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authClient } from '../lib/auth-client'

type User = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date
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
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setUser((data?.user as User) ?? null)
      setSession((data?.session as Session) ?? null)
      setLoading(false)
    })
  }, [])

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await authClient.signUp.email({ email, password, name })
    if (error) return { error: error.message ?? 'Sign up failed' }
    setUser((data?.user as User) ?? null)
    setSession((data?.session as Session) ?? null)
    return {}
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await authClient.signIn.email({ email, password })
    if (error) return { error: error.message ?? 'Sign in failed' }
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
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
