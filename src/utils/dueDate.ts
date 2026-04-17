import type { TaskPriority, TaskStatus } from "../types/auth";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_PREFIX_PATTERN = /^\d{4}-\d{2}-\d{2}/;

const extractDateKey = (value: string): string | null => {
  if (DATE_ONLY_PATTERN.test(value)) {
    // Pure date input should stay date-only and never shift by timezone.
    return value;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    // Datetime inputs should follow local-date interpretation used in UI formatting.
    return toDateKey(parsed);
  }

  const datePartMatch = value.match(DATE_PREFIX_PATTERN);
  return datePartMatch ? datePartMatch[0] : null;
};

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type DueDateLabel = "Overdue" | "Today" | null;

export interface DueDateMeta {
  isDueToday: boolean;
  isOverdue: boolean;
  color: string;
  label: DueDateLabel;
  labelColor: string;
}

const getTodayDateKey = (): string => toDateKey(new Date());

const getTomorrowDateKey = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateKey(tomorrow);
};

const getDayAfterTomorrowDateKey = (): string => {
  const dat = new Date();
  dat.setDate(dat.getDate() + 2);
  return toDateKey(dat);
};

const getDateKeyContext = (): { todayKey: string; tomorrowKey: string; dayAfterTomorrowKey: string } => ({
  todayKey: getTodayDateKey(),
  tomorrowKey: getTomorrowDateKey(),
  dayAfterTomorrowKey: getDayAfterTomorrowDateKey(),
});

const DEFAULT_DUE_DATE_META: DueDateMeta = {
  isDueToday: false,
  isOverdue: false,
  color: "text.secondary",
  label: null,
  labelColor: "text.secondary",
};

const isIncomplete = (status?: TaskStatus): boolean => {
  const normalizedStatus = (status ?? "").toUpperCase();
  return (
    normalizedStatus !== "COMPLETE" &&
    normalizedStatus !== "COMPLETED" &&
    normalizedStatus !== "CANCELLED"
  );
};

export const getDueDateMeta = (
  dueDate: string | null,
  priority?: TaskPriority,
  status?: TaskStatus,
): DueDateMeta => {
  if (!dueDate) {
    return DEFAULT_DUE_DATE_META;
  }

  const dueKey = extractDateKey(dueDate);
  if (!dueKey) {
    return DEFAULT_DUE_DATE_META;
  }

  const { todayKey, tomorrowKey, dayAfterTomorrowKey } = getDateKeyContext();

  if (dueKey < todayKey) {
    return {
      isDueToday: false,
      isOverdue: true,
      color: "error.main",
      label: "Overdue",
      labelColor: "error.main",
    };
  }

  if (dueKey === todayKey) {
    if (isIncomplete(status)) {
      return {
        isDueToday: true,
        isOverdue: false,
        color: "#0591a1",
        label: "Today",
        labelColor: "#0591a1",
      };
    }
    return { ...DEFAULT_DUE_DATE_META, isDueToday: true };
  }

  if (dueKey === tomorrowKey) {
    if (isIncomplete(status)) {
      return {
        isDueToday: false,
        isOverdue: false,
        color: "#0591a1",
        label: null,
        labelColor: "text.secondary",
      };
    }
    return {
      isDueToday: false,
      isOverdue: false,
      color: "success.main",
      label: null,
      labelColor: "text.secondary",
    };
  }

  if (dueKey === dayAfterTomorrowKey) {
    if (priority === "CRITICAL" && isIncomplete(status)) {
      return {
        isDueToday: false,
        isOverdue: false,
        color: "#0591a1",
        label: null,
        labelColor: "#0591a1",
      };
    }
    return {
      isDueToday: false,
      isOverdue: false,
      color: "success.main",
      label: null,
      labelColor: "text.secondary",
    };
  }

  return DEFAULT_DUE_DATE_META;
};

export const isDueToday = (dueDate: string | null): boolean => {
  return getDueDateMeta(dueDate).isDueToday;
};

export const isOverdue = (dueDate: string | null): boolean => {
  return getDueDateMeta(dueDate).isOverdue;
};

export const getDueDateColor = (dueDate: string | null): string => {
  return getDueDateMeta(dueDate).color;
};
