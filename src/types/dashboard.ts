export type Priority = "Low" | "High" | "Critical";
export type Status   = "All" | "Not Started" | "In Progress" | "Complete" | "Cancelled";
export type SortKey = "title" | "dueDate" | "priority" | "status";
export type SortDir = "asc" | "desc";

export const PRIORITY_OPTIONS: Priority[] = ["Low", "High", "Critical"];
export const STATUS_OPTIONS: Status[] = ["All", "Not Started", "In Progress", "Complete", "Cancelled"];
