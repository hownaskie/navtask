import type { SortKey } from "../types/dashboard";
import { PRIORITY_RANK, STATUS_RANK } from "../constants/rank";

type SortableTask = {
  title: string;
  dueDate: string | null;
  priority: string;
  status: string;
};

const normalizePriority = (priority: string): keyof typeof PRIORITY_RANK => {
  const key = priority.toUpperCase();
  if (key === "LOW") return "Low";
  if (key === "HIGH") return "High";
  return "Critical";
};

const normalizeStatus = (status: string): keyof typeof STATUS_RANK => {
  const key = status.toUpperCase();
  if (key === "NOT_STARTED") return "Not Started";
  if (key === "IN_PROGRESS") return "In Progress";
  if (key === "COMPLETED") return "Completed";
  if (key === "CANCELLED") return "Cancelled";
  if (key === "ALL") return "All";

  // Also support already-humanized labels.
  if (status === "Not Started") return "Not Started";
  if (status === "In Progress") return "In Progress";
  if (status === "Completed") return "Completed";
  if (status === "Cancelled") return "Cancelled";
  return "All";
};

/**
 * Compare two tasks by a given sort key
 * @param a - First task
 * @param b - Second task
 * @param key - Sort key (title, dueDate, priority, status)
 * @returns Comparison result (-1, 0, 1)
 */
export const compareValues = (
  a: SortableTask,
  b: SortableTask,
  key: SortKey,
): number => {
  switch (key) {
    case "title":
      return a.title.localeCompare(b.title);
    case "dueDate":
      return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
    case "priority":
      return (
        PRIORITY_RANK[normalizePriority(a.priority)] -
        PRIORITY_RANK[normalizePriority(b.priority)]
      );
    case "status":
      return (
        STATUS_RANK[normalizeStatus(a.status)] -
        STATUS_RANK[normalizeStatus(b.status)]
      );
  }
};
