"use client";

import { useCallback, useState } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export function usePagination({ initialPage = 1, initialLimit = 10 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const goPrevious = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const goNext = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  const resetPage = useCallback(() => setPage(initialPage), [initialPage]);

  return {
    page,
    setPage,
    limit,
    setLimit,
    goPrevious,
    goNext,
    resetPage,
  };
}
