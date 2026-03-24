export const MAX_SUBTASK_ITEMS = 10;
export const MAX_ATTACHMENT_ITEMS = 5;

export const SUBTASK_STATUS_OPTIONS: Array<"NOT_STARTED" | "COMPLETED"> = [
  "NOT_STARTED",
  "COMPLETED",
];

export const SUBTASK_STATUS_LABELS: Record<"NOT_STARTED" | "COMPLETED", "Not Done" | "Done"> = {
  NOT_STARTED: "Not Done",
  COMPLETED: "Done",
};
