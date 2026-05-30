"use client";

import { useEffect } from "react";

export function useAutoDismiss(
  value: string,
  onClear: () => void,
  durationMs = 4000
) {
  useEffect(() => {
    if (!value) return;
    const timer = setTimeout(onClear, durationMs);
    return () => clearTimeout(timer);
  }, [value, onClear, durationMs]);
}
