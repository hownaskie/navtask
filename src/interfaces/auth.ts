import type { LoginType } from '../types/auth'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string | null
  loginType: LoginType
  createdDate: string
  updatedDate: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface AuthResponse {
  token: string
  tokenType: string
  user: User
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}