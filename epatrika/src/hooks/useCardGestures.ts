"use client";

import { useCallback, useEffect, useRef } from "react";

interface GestureOptions {
  pageCount: number;
  currentPage: number;
  onPreviewTurn: (payload: { page: number; progress: number; direction: 1 | -1 }) => void;
  onCommitTurn: (direction: 1 | -1) => void;
  onCancelTurn: () => void;
}

export function useCardGestures({
  pageCount,
  currentPage,
  onPreviewTurn,
  onCommitTurn,
  onCancelTurn,
}: GestureOptions) {
  const startXRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const directionRef = useRef<1 | -1>(1);

  const handlePointerDown = useCallback((clientX: number) => {
    startXRef.current = clientX;
    draggingRef.current = true;
  }, []);

  const handlePointerMove = useCallback((clientX: number, width: number) => {
    if (!draggingRef.current || startXRef.current === null) return;

    const delta = clientX - startXRef.current;
    const direction: 1 | -1 = delta < 0 ? 1 : -1;
    directionRef.current = direction;

    if ((direction === 1 && currentPage >= pageCount - 1) || (direction === -1 && currentPage <= 0)) {
      return;
    }

    const progress = Math.min(Math.max(Math.abs(delta) / width, 0), 1);
    const page = direction === 1 ? currentPage : currentPage - 1;
    onPreviewTurn({ page, progress, direction });
  }, [currentPage, onPreviewTurn, pageCount]);

  const handlePointerUp = useCallback((clientX: number, width: number) => {
    if (!draggingRef.current || startXRef.current === null) return;

    const delta = clientX - startXRef.current;
    const progress = Math.min(Math.max(Math.abs(delta) / width, 0), 1);
    draggingRef.current = false;
    startXRef.current = null;

    if (progress >= 0.3) onCommitTurn(directionRef.current);
    else onCancelTurn();
  }, [onCancelTurn, onCommitTurn]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && currentPage < pageCount - 1) onCommitTurn(1);
      if (event.key === "ArrowLeft" && currentPage > 0) onCommitTurn(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentPage, onCommitTurn, pageCount]);

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
