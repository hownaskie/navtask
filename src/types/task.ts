import type { SubtaskStatus, TaskStatus } from "./auth";
import type { Priority } from "./dashboard";

// ── Task API Types ────────────────────────────────────────────────────────────
export interface Attachment {
  id: number;
  attachmentUrl: string;
}

export interface Subtask {
  id: number;
  name: string;
  status: SubtaskStatus;
}

export interface TaskResponse {
  id: number;
  title: string;
  details: string | null;
  priority: Priority;
  status: TaskStatus;
  userId: number;
  createdDate: string; // ISO date
  dueDate: string | null; // ISO date
  updatedDate: string; // ISO datetime
  attachments: Attachment[];
  subtasks: Subtask[];
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