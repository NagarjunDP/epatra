"use client";

import { create } from "zustand";

interface CardState {
  currentPage: number;
  activePage: number | null;
  progress: number;
  direction: 1 | -1;
  setDrag: (page: number, progress: number, direction: 1 | -1) => void;
  clearDrag: () => void;
  setPage: (page: number) => void;
}

export const useCardState = create<CardState>((set) => ({
  currentPage: 0,
  activePage: null,
  progress: 0,
  direction: 1,
  setDrag: (page, progress, direction) => set({ activePage: page, progress, direction }),
  clearDrag: () => set({ activePage: null, progress: 0 }),
  setPage: (page) => set({ currentPage: page, activePage: null, progress: 0 }),
}));
