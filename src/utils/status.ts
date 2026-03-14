export interface StatusCardData {
  total: number;
  done: number;
  highCount: number;
  progress: number;
}

export const getStatusCards = ({
  total,
  done,
  highCount,
  progress,
}: StatusCardData) => {
  return [
    {
      label: "Total Tasks",
      value: total,
      color: "#2563EB",
      bg: "rgba(37,99,235,0.08)",
    },
    {
      label: "Completed",
      value: done,
      color: "#059669",
      bg: "rgba(16,185,129,0.08)",
    },
    {
      label: "High Priority",
      value: highCount,
      color: "#DC2626",
      bg: "rgba(239,68,68,0.08)",
    },
    {
      label: "Progress",
      value: `${progress}%`,
      color: "#D97706",
      bg: "rgba(245,158,11,0.08)",
    },
  ];
};
