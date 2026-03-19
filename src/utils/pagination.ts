/**
 * Calculate the highest valid page index after deleting items.
 */
export const getMaxPageAfterDelete = (
  totalCount: number,
  deletedCount: number,
  rowsPerPage: number,
): number => {
  const remainingCount = Math.max(0, totalCount - deletedCount);
  return Math.max(0, Math.ceil(remainingCount / rowsPerPage) - 1);
};

export interface PageSelectionState {
  pageIds: number[];
  allPageSelected: boolean;
  somePageSelected: boolean;
}

/**
 * Derive per-page selection state for select-all behavior.
 */
export const getPageSelectionState = <T extends { id: number }>(
  rows: T[],
  selectedIds: Set<number>,
): PageSelectionState => {
  const pageIds = rows.map((row) => row.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected =
    pageIds.some((id) => selectedIds.has(id)) && !allPageSelected;

  return { pageIds, allPageSelected, somePageSelected };
};
