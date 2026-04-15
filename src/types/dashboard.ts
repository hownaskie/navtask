export type Priority = "Low" | "High" | "Critical";
export type Status =
  | "All"
  | "Not Started"
  | "In Progress"
  | "Complete"
  | "Cancelled";
export type SortKey = "dueDate" | "priority" | "status";
export type SortDir = "asc" | "desc";
