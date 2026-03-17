export type LoginType = 'GOOGLE' | 'FACEBOOK' | 'MANUAL'
export type Priority = 'LOW' | 'HIGH' | 'CRITICAL'
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type SubtaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

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
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}