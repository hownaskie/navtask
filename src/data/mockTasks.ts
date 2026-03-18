type Priority = "Low" | "High" | "Critical";
type Status   = "All" | "Not Started" | "In Progress" | "Completed" | "Cancelled";

export interface Task {
  id: number;
  done: boolean;
  title: string;
  dueDate: string; // ISO date string e.g. "2025-04-10"
  priority: Priority;
  status: Status;
}

export const SEED_TASKS: Task[] = [
  {
    id: 1,
    done: false,
    title: "Review design mockups",
    dueDate: "2025-04-05",
    priority: "High",
    status: "In Progress",
  },
  {
    id: 2,
    done: false,
    title: "Team standup at 10am",
    dueDate: "2025-04-01",
    priority: "Low",
    status: "Not Started",
  },
  {
    id: 3,
    done: true,
    title: "Write unit tests for API",
    dueDate: "2025-03-28",
    priority: "High",
    status: "Completed",
  },
  {
    id: 4,
    done: false,
    title: "Update project roadmap",
    dueDate: "2025-04-10",
    priority: "Low",
    status: "Not Started",
  },
  {
    id: 5,
    done: false,
    title: "Fix login page bug",
    dueDate: "2025-04-03",
    priority: "High",
    status: "In Progress",
  },
  {
    id: 6,
    done: true,
    title: "Deploy staging environment",
    dueDate: "2025-03-25",
    priority: "Critical",
    status: "Completed",
  },
  {
    id: 7,
    done: false,
    title: "Sync with design team",
    dueDate: "2025-04-08",
    priority: "Low",
    status: "Not Started",
  },
];
