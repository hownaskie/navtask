import type { TaskResponse } from "../interfaces/task";

type TaskProgress = {
  completed: number;
  total: number;
};

type ProgressStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETE"
  | "COMPLETED"
  | "CANCELLED"
  | "Not Started"
  | "In Progress"
  | "Complete"
  | "Completed"
  | "Cancelled";

export const getTaskProgressByStatus = (
  status: ProgressStatus,
  completedSubtasks: number,
  totalSubtasks: number,
): TaskProgress => {
  if (status === "COMPLETE" || status === "COMPLETED" || status === "Complete" || status === "Completed") {
    return { completed: 1, total: 1 };
  }

  if (status === "IN_PROGRESS" || status === "In Progress") {
    return { completed: 1, total: 4 };
  }

  return { completed: completedSubtasks, total: totalSubtasks };
};

export const getTaskProgress = (task: TaskResponse): TaskProgress => {
  const completedSubtasks = task.subtasks.filter(
    (subtask) => {
      const status = String(subtask.status).toUpperCase();
      return status === "COMPLETE" || status === "COMPLETED";
    },
  ).length;

  return getTaskProgressByStatus(
    task.status,
    completedSubtasks,
    task.subtasks.length,
  );
};