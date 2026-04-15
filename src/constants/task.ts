import type { TaskPriority, TaskStatus } from "../types/auth";
import type { Priority, Status } from "../types/dashboard";

export const PRIORITY_OPTIONS: Priority[] = ["Low", "High", "Critical"];
export const STATUS_OPTIONS: Status[] = [
  "All",
  "Not Started",
  "In Progress",
  "Complete",
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
  COMPLETE: "Complete",
  CANCELLED: "Cancelled",
};

export const statusValueMap: Record<Exclude<Status, "All">, TaskStatus> = {
  "Not Started": "NOT_STARTED",
  "In Progress": "IN_PROGRESS",
  Complete: "COMPLETE",
  Cancelled: "CANCELLED",
};

type StatusInput = TaskStatus | "COMPLETED";

export const getStatusLabel = (status: StatusInput): Exclude<Status, "All"> => {
  if (status === "NOT_STARTED") return "Not Started";
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "COMPLETE" || status === "COMPLETED") return "Complete";
  return "Cancelled";
};

export const isCompletedStatus = (status: string): boolean =>
  status === "COMPLETE" || status === "COMPLETED";
