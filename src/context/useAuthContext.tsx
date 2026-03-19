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
import type { User } from '../interfaces/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<User>
  register: (username: string, password: string) => Promise<User>
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

  const login = async (username: string, password: string): Promise<User> => {
    const res = await authApi.login({ username, password })
    const { token, user } = res.data.data
    localStorage.setItem('navtask_token', token)
    setUser(user)
    return user
  }

  const register = async (
    username: string,
    password: string
  ): Promise<User> => {
    const normalized = username.trim().toLowerCase()
    const [localPart = "user"] = normalized.split("@")
    const [firstNameRaw, secondNameRaw] = localPart
      .split(/[._-]+/)
      .filter(Boolean)

    const firstName = firstNameRaw
      ? firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1)
      : "User"
    const lastName = secondNameRaw
      ? secondNameRaw.charAt(0).toUpperCase() + secondNameRaw.slice(1)
      : "User"

    const res = await authApi.register({
      firstName,
      lastName,
      email: normalized,
      password,
    })
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