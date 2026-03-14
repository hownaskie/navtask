import type { Priority, Status } from "../types/dashboard";

/**
 * Color scheme for priority chips
 */
export const PRIORITY_COLORS: Record<
  Priority,
  { bg: string; color: string; dot: string }
> = {
  Low: { bg: "rgba(16,185,129,0.1)", color: "#059669", dot: "#059669" },
  High: { bg: "rgba(245,158,11,0.1)", color: "#D97706", dot: "#D97706" },
  Critical: { bg: "rgba(239,68,68,0.1)", color: "#DC2626", dot: "#DC2626" },
};


/**
 * Color scheme for status chips
 */
export const STATUS_COLORS: Record<Status, { bg: string; color: string; dot: string }> =
  {
    All: { bg: "rgba(100,116,139,0.1)", color: "#475569", dot: "#94A3B8" },
    "Not Started": {
      bg: "rgba(100,116,139,0.1)",
      color: "#475569",
      dot: "#94A3B8",
    },
    "In Progress": {
      bg: "rgba(37,99,235,0.1)",
      color: "#2563EB",
      dot: "#2563EB",
    },
    Complete: { bg: "rgba(16,185,129,0.1)", color: "#059669", dot: "#059669" },
    Cancelled: { bg: "rgba(239,68,68,0.1)", color: "#DC2626", dot: "#DC2626" },
  };
