import type { TaskResponse } from "../types/task";

export interface DashboardStats {
  total: number;
  done: number;
  progress: number;
  highCount: number;
}

/**
 * Calculate dashboard statistics from tasks
 */
export const calculateDashboardStats = (tasks: TaskResponse[]): DashboardStats => {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "COMPLETED").length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const highCount = tasks.filter(
    (t) => t.priority === "High" && t.status !== "COMPLETED",
  ).length;

  return {
    total,
    done,
    progress,
    highCount,
  };
};
