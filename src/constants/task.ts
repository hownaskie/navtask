import type { TaskPriority, TaskStatus } from "../types/auth";
import type { Priority, Status } from "../types/dashboard";

export const PRIORITY_OPTIONS: Priority[] = ["Low", "High", "Critical"];
export const STATUS_OPTIONS: Status[] = [
  "All",
  "Not Started",
  "In Progress",
  "Completed",
  "Cancelled",
];

export const priorityLabelMap: Record<TaskPriority, Priority> = {
  LOW: "Low",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const priorityValueMap: Record<Priority, TaskPriority> = {
  Low: "LOW",
  High: "HIGH",
  Critical: "CRITICAL",
};

export const statusLabelMap: Record<TaskStatus, Exclude<Status, "All">> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const statusValueMap: Record<Exclude<Status, "All">, TaskStatus> = {
  "Not Started": "NOT_STARTED",
  "In Progress": "IN_PROGRESS",
  Completed: "COMPLETED",
  Cancelled: "CANCELLED",
};
