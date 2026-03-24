import type { SubtaskStatus, TaskPriority, TaskStatus } from "../types/auth";

// ── Task API Types ────────────────────────────────────────────────────────────
export interface Attachment {
  id: number;
  attachmentUrl: string;
}

export interface Subtask {
  id: number;
  name: string;
  status: SubtaskStatus;
  createdDate: string;
  completedDate: string | null;
}

export interface TaskResponse {
  id: number;
  title: string;
  details: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  userId: number;
  createdDate: string; // ISO date
  dueDate: string | null; // ISO date
  completedDate: string | null; // ISO date
  updatedDate: string; // ISO datetime
  attachments: Attachment[];
  subtasks: Subtask[];
}

export interface CreateTaskRequest {
  title: string;
  details?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  userId: number;
  subtasks: CreateSubtaskRequest[];
}

export interface CreateSubtaskRequest {
  name: string;
  status: SubtaskStatus;
}

export interface UpdateSubtaskRequest {
  id?: number;
  name: string;
  status: SubtaskStatus;
}

export interface UpdateTaskRequest {
  title: string;
  details?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  subtasks: UpdateSubtaskRequest[];
  deleteSubtaskIds: number[];
}
