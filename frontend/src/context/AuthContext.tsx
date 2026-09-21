import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import api from '../services/api'
import type { User } from '../types'

type AuthContextValue = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (payload: {
    full_name: string
    email: string
    password: string
    confirm_password: string
    company_name: string
  }) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const cachedUser = localStorage.getItem('reviewiq_user')
    return cachedUser ? JSON.parse(cachedUser) : null
  })
  const [loading, setLoading] = useState(() => !localStorage.getItem('reviewiq_user'))

  useEffect(() => {
    const token = localStorage.getItem('reviewiq_token')
    if (!token) {
      setLoading(false)
      setUser(null)
      localStorage.removeItem('reviewiq_user')
      return
    }

    api
      .get('/auth/me')
      .then((response) => {
        setUser(response.data)
        localStorage.setItem('reviewiq_user', JSON.stringify(response.data))
      })
      .catch(() => {
        localStorage.removeItem('reviewiq_token')
        localStorage.removeItem('reviewiq_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    localStorage.setItem('reviewiq_token', response.data.access_token)
    const me = await api.get('/auth/me')
    setUser(me.data)
    localStorage.setItem('reviewiq_user', JSON.stringify(me.data))
  }

  const signup = async (payload: {
    full_name: string
    email: string
    password: string
    confirm_password: string
    company_name: string
  }) => {
    const response = await api.post('/auth/signup', payload)
    localStorage.setItem('reviewiq_token', response.data.access_token)
    const me = await api.get('/auth/me')
    setUser(me.data)
    localStorage.setItem('reviewiq_user', JSON.stringify(me.data))
  }

  const logout = () => {
    localStorage.removeItem('reviewiq_token')
    localStorage.removeItem('reviewiq_user')
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, signup, logout, loading }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
