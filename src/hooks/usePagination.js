import { useEffect, useState } from 'react';
import { TABLE_PAGE_SIZE } from '../constants/pagination';

export default function usePagination(items, resetKey) {
  const [requestedPage, setPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / TABLE_PAGE_SIZE);
  const page = Math.min(requestedPage, Math.max(1, totalPages));
  useEffect(() => { setPage(current => Math.min(current, Math.max(1, totalPages))); }, [totalPages]);
  useEffect(() => { setPage(1); }, [resetKey]);
  return {
    page, setPage, pageSize: TABLE_PAGE_SIZE, totalItems, totalPages,
    displayedItems: items.slice((page - 1) * TABLE_PAGE_SIZE, page * TABLE_PAGE_SIZE),
  };
}
