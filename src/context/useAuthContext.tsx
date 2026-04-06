import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode
} from 'react'
import { ApiError, authApi } from '../services/api'
import { clearToken, getToken, saveToken } from '../utils/tokenStorage'
import type { ApiResponse, User } from '../interfaces/auth'

const isApiResponse = (value: unknown): value is ApiResponse<unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  )
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<User>
  register: (username: string, password: string) => Promise<User>
  logout: () => Promise<void>
  loginWithToken: (token: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const hydrateFromRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await authApi.refresh()
      const { token, user } = res.data.data
      saveToken(token)
      setUser(user)
      return true
    } catch {
      return false
    }
  }, [])

  const loadUser = useCallback(async () => {
    const token = getToken()
    if (!token) {
      await hydrateFromRefresh()
      setLoading(false)
      return
    }

    try {
      const res = await authApi.me()
      setUser(res.data.data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const hydrated = await hydrateFromRefresh()
        if (!hydrated) {
          clearToken()
        }
      }
    } finally {
      setLoading(false)
    }
  }, [hydrateFromRefresh])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (username: string, password: string): Promise<User> => {
    try {
      const res = await authApi.login({ username, password })
      const { token, user } = res.data.data
      saveToken(token)
      setUser(user)
      return user
    } catch (error) {
      if (error instanceof ApiError && isApiResponse(error.data)) {
        const message = error.data.message
        throw new Error(message || 'Unable to sign in. Please check your credentials.')
      }

      throw new Error('Unable to sign in. Please check your credentials.')
    }
  }

  const register = async (
    username: string,
    password: string
  ): Promise<User> => {
    try {
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
      const { user } = res.data.data
      return user
    } catch (error) {
      if (error instanceof ApiError && isApiResponse(error.data)) {
        const message = error.data.message
        throw new Error(message || 'Unable to create account. Please check your details.')
      }

      throw new Error('Unable to create account. Please check your details.')
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Always clear local session even if server-side cookie cleanup fails.
    }
    clearToken()
    setUser(null)
  }

  const loginWithToken = (token: string) => {
    saveToken(token)
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
  if (!ctx) {
    return {
      user: null,
      loading: false,
      login: async () => {
        throw new Error('AuthProvider is not mounted')
      },
      register: async () => {
        throw new Error('AuthProvider is not mounted')
      },
      logout: async () => {},
      loginWithToken: () => {},
    }
  }
  return ctx
}