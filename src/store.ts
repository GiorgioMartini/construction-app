import { create } from "zustand";
import type { RxDatabase } from "rxdb";

interface AppState {
  user?: string;
  db?: RxDatabase;
  setUser: (user: string, db: RxDatabase) => void;
}

export const useAppStore = create<AppState>((set) => ({
  setUser: (user, db) => set({ user, db }),
}));
