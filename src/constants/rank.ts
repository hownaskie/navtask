import type { Priority, Status } from "../types/dashboard";

/**
 * Rank mappings for sorting by priority
 */
export const PRIORITY_RANK: Record<Priority, number> = {
  Low: 0,
  High: 1,
  Critical: 2,
};

/**
 * Rank mappings for sorting by status
 */
export const STATUS_RANK: Record<Status, number> = {
  All: 0,
  "Not Started": 1,
  "In Progress": 2,
  Completed: 3,
  Cancelled: 4
};
