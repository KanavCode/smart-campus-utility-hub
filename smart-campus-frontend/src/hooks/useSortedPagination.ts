import { useMemo, useState } from 'react';

interface UseSortedPaginationOptions<T extends Record<string, any>> {
  items: T[];
  initialSortField: keyof T | string;
  itemsPerPage?: number;
}

export function useSortedPagination<T extends Record<string, any>>({
  items,
  initialSortField,
  itemsPerPage = 10,
}: UseSortedPaginationOptions<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>(String(initialSortField));
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }

      return aVal < bVal ? 1 : -1;
    });
  }, [items, sortDirection, sortField]);

  const paginatedItems = useMemo(() => {
    return sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [currentPage, itemsPerPage, sortedItems]);

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  return {
    currentPage,
    setCurrentPage,
    sortField,
    sortDirection,
    handleSort,
    paginatedItems,
    totalPages,
  };
}
