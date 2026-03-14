import type { Task } from "../data/mockTasks";
import type { Priority, Status, SortKey, SortDir } from "../types/dashboard";
import { compareValues } from "./sort";

export interface FilterCriteria {
  title: string;
  priority: Set<Priority>;
  status: Set<Status>;
}

/**
 * Filter tasks by title, priority, and status
 * @param tasks - Array of tasks to filter
 * @param filters - Filter criteria (title, priority, status)
 * @returns Filtered array of tasks
 */
export const filterTasks = (tasks: Task[], filters: FilterCriteria): Task[] => {
  return tasks.filter((t) => {
    const titleMatch = filters.title.trim()
      ? t.title.toLowerCase().includes(filters.title.trim().toLowerCase())
      : true;
    const priorityMatch =
      filters.priority.size > 0
        ? filters.priority.has(t.priority as Priority)
        : true;
    const statusMatch =
      filters.status.size > 0 ? filters.status.has(t.status as Status) : true;
    return titleMatch && priorityMatch && statusMatch;
  });
};

/**
 * Sort tasks by a given key and direction
 * @param tasks - Array of tasks to sort
 * @param sortKey - Sort key (title, dueDate, priority, status)
 * @param sortDir - Sort direction (asc, desc)
 * @returns Sorted array of tasks
 */
export const sortTasks = (
  tasks: Task[],
  sortKey: SortKey,
  sortDir: SortDir,
): Task[] => {
  return [...tasks].sort((a, b) => {
    const cmp = compareValues(a, b, sortKey);
    return sortDir === "asc" ? cmp : -cmp;
  });
};

/**
 * Filter and sort tasks in one operation
 * @param tasks - Array of tasks
 * @param filters - Filter criteria
 * @param sortKey - Sort key
 * @param sortDir - Sort direction
 * @returns Filtered and sorted array of tasks
 */
export const filterAndSortTasks = (
  tasks: Task[],
  filters: FilterCriteria,
  sortKey: SortKey,
  sortDir: SortDir,
): Task[] => {
  const filtered = filterTasks(tasks, filters);
  return sortTasks(filtered, sortKey, sortDir);
};
