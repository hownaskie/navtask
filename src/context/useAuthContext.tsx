import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode
} from 'react'
import { authApi } from '../services/api'
import { clearToken } from '../utils/tokenStorage'
import type { User } from '../types/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<User>
  logout: () => void
  loginWithToken: (token: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('navtask_token')
    if (!token) { setLoading(false); return }
    try {
      const res = await authApi.me()
      setUser(res.data.data)
    } catch {
      clearToken()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authApi.login({ email, password })
    const { token, user } = res.data.data
    localStorage.setItem('navtask_token', token)
    setUser(user)
    return user
  }

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<User> => {
    const res = await authApi.register({ firstName, lastName, email, password })
    const { token, user } = res.data.data
    localStorage.setItem('navtask_token', token)
    setUser(user)
    return user
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  const loginWithToken = (token: string) => {
    localStorage.setItem('navtask_token', token)
    loadUser()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}