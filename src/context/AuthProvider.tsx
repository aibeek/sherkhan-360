import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, API_URL } from '@/lib/api'

type User = { id: string; email: string; name: string }

type AuthCtx = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    ;(async () => {
      if (!token) return setUser(null)
      try {
        const res = await fetch(`${API_URL}/auth/me`, { headers: { authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('unauthorized')
        const u: User = await res.json()
        setUser(u)
      } catch {
        setToken(null)
        setUser(null)
      }
    })()
  }, [token])

  async function login(email: string, password: string) {
    const { token } = await api('/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    setToken(token)
  }

  async function register(name: string, email: string, password: string) {
    await api('/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    await login(email, password)
  }

  function logout() {
    setToken(null)
  }

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}

