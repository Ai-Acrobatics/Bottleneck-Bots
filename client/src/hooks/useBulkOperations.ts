import { useState, useCallback } from 'react';

export function useBulkOperations<T extends { id: number | string }>() {
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());

  const toggleSelection = useCallback((id: number | string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: number | string) => selectedIds.has(id),
    [selectedIds]
  );

  const isAllSelected = useCallback(
    (items: T[]) => items.length > 0 && items.every((item) => selectedIds.has(item.id)),
    [selectedIds]
  );

  const isSomeSelected = useCallback(
    (items: T[]) =>
      items.length > 0 && items.some((item) => selectedIds.has(item.id)) && !isAllSelected(items),
    [selectedIds, isAllSelected]
  );

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
    isAllSelected,
    isSomeSelected,
  };
}
