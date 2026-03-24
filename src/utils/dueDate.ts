const parseDateOnly = (value: string): Date | null => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

export const isDueToday = (dueDate: string | null): boolean => {
  if (!dueDate) return false;

  const due = parseDateOnly(dueDate);
  if (!due) return false;

  const today = new Date();
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return due.getTime() === todayDateOnly.getTime();
};

export const getDueDateColor = (dueDate: string | null): string => {
  if (!dueDate) return "text.secondary";

  const due = parseDateOnly(dueDate);
  if (!due) return "text.secondary";

  const today = new Date();
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const diffMs = due.getTime() - todayDateOnly.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "error.main";
  if (diffDays === 0) return "#0591a1";
  if (diffDays === 1) return "success.main";

  return "text.secondary";
};
