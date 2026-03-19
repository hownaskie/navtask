const parseDateOnly = (value: string): Date | null => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
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
  if (diffDays === 0) return "warning.main";
  if (diffDays === 1) return "success.main";

  return "text.secondary";
};
