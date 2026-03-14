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

export interface Attachment {
  id: number
  attachmentUrl: string
}

export interface Subtask {
  id: number
  name: string
  status: SubtaskStatus
}

export interface Task {
  id: number
  title: string
  details: string | null
  priority: Priority
  status: TaskStatus
  userId: number
  createdDate: string
  dueDate: string | null
  updatedDate: string
  attachments: Attachment[]
  subtasks: Subtask[]
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

export interface CreateTaskRequest {
  title: string
  details?: string
  priority: Priority
  status: TaskStatus
  dueDate?: string
  userId: number
  subtasks: CreateSubtaskRequest[]
}

export interface CreateSubtaskRequest {
  name: string
  status: SubtaskStatus
}

export interface UpdateSubtaskRequest {
  id?: number
  name: string
  status: SubtaskStatus
}

export interface UpdateTaskRequest {
  title: string
  details?: string
  priority: Priority
  status: TaskStatus
  dueDate?: string
  subtasks: UpdateSubtaskRequest[]
  deleteSubtaskIds: number[]
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