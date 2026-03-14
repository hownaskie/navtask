import type { Task } from "../data/mockTasks";
import type { SortKey } from "../types/dashboard";
import { PRIORITY_RANK, STATUS_RANK } from "../constants/rank";

/**
 * Compare two tasks by a given sort key
 * @param a - First task
 * @param b - Second task
 * @param key - Sort key (title, dueDate, priority, status)
 * @returns Comparison result (-1, 0, 1)
 */
export const compareValues = (
  a: Task,
  b: Task,
  key: SortKey,
): number => {
  switch (key) {
    case "title":
      return a.title.localeCompare(b.title);
    case "dueDate":
      return a.dueDate.localeCompare(b.dueDate);
    case "priority":
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    case "status":
      return STATUS_RANK[a.status] - STATUS_RANK[b.status];
  }
};
