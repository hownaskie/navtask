import type { Priority, Status } from "../types/dashboard";

interface Task {
  id: number;
  done: boolean;
  title: string;
  dueDate: string;
  priority: Priority;
  status: Status;
}

export interface DashboardStats {
  total: number;
  done: number;
  progress: number;
  highCount: number;
}

/**
 * Calculate dashboard statistics from tasks
 */
export const calculateDashboardStats = (tasks: Task[]): DashboardStats => {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const highCount = tasks.filter(
    (t) => t.priority === "High" && !t.done,
  ).length;

  return {
    total,
    done,
    progress,
    highCount,
  };
};
