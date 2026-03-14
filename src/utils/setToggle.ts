/**
 * Toggle an item in a Set
 * @param prev - Current Set
 * @param item - Item to toggle
 * @returns New Set with item toggled
 */
export const toggleSetItem = <T,>(prev: Set<T>, item: T): Set<T> => {
  const next = new Set(prev);
  if (next.has(item)) {
    next.delete(item);
  } else {
    next.add(item);
  }
  return next;
};
