export const MAX_SUBTASK_ITEMS = 10;
export const MAX_ATTACHMENT_ITEMS = 5;
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 MB

export const DEFAULT_SUBTASK_STATUS = "NOT_STARTED" as const;

export const SUBTASK_STATUS_OPTIONS: Array<"NOT_STARTED" | "COMPLETE"> = [
  "NOT_STARTED",
  "COMPLETE",
];

export const SUBTASK_STATUS_LABELS: Record<"NOT_STARTED" | "COMPLETE", "Not Done" | "Done"> = {
  NOT_STARTED: "Not Done",
  COMPLETE: "Done",
};

export const getSubtaskStatusLabel = (status: string): "Not Done" | "Done" =>
  status === "COMPLETE" || status === "COMPLETED" ? "Done" : "Not Done";
