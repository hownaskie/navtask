export type Priority = "Low" | "High" | "Critical";
export type Status =
  | "All"
  | "Not Started"
  | "In Progress"
  | "Completed"
  | "Cancelled";
export type SortKey = "title" | "dueDate" | "priority" | "status";
export type SortDir = "asc" | "desc";
