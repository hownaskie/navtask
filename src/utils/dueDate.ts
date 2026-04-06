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

const getDateKeyContext = (): { todayKey: string; tomorrowKey: string } => ({
  todayKey: getTodayDateKey(),
  tomorrowKey: getTomorrowDateKey(),
});

const DEFAULT_DUE_DATE_META: DueDateMeta = {
  isDueToday: false,
  isOverdue: false,
  color: "text.secondary",
  label: null,
  labelColor: "text.secondary",
};

export const getDueDateMeta = (dueDate: string | null): DueDateMeta => {
  if (!dueDate) {
    return DEFAULT_DUE_DATE_META;
  }

  const dueKey = extractDateKey(dueDate);
  if (!dueKey) {
    return DEFAULT_DUE_DATE_META;
  }

  const { todayKey, tomorrowKey } = getDateKeyContext();

  if (dueKey === todayKey) {
    return {
      isDueToday: true,
      isOverdue: false,
      color: "#0591a1",
      label: "Today",
      labelColor: "#0591a1",
    };
  }

  if (dueKey < todayKey) {
    return {
      isDueToday: false,
      isOverdue: true,
      color: "error.main",
      label: "Overdue",
      labelColor: "error.main",
    };
  }

  if (dueKey === tomorrowKey) {
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
