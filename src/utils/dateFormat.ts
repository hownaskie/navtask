/**
 * Format ISO date string to readable format
 * @param iso - ISO date string (e.g., "2025-04-10")
 * @returns Formatted date (e.g., "Apr 10, 2025")
 */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/**
 * Format ISO date as dd MMM YYYY (e.g., "10 Apr 2025")
 */
export const formatDateDdMmmYyyy = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
