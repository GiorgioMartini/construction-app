import { create } from "zustand";
import type { RxDatabase } from "rxdb";
import { initDB } from "./db";

interface AppState {
  user?: string | undefined;
  db?: RxDatabase | undefined;
  isInitialized: boolean;
  isInitializing: boolean;
  setUser: (user: string, db: RxDatabase) => void;
  logout: () => void;
  initializeFromStorage: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isInitialized: false,
  isInitializing: false,
  setUser: (user, db) =>
    set({ user, db, isInitialized: true, isInitializing: false }),

  logout: () => {
    localStorage.removeItem("username");
    set((state) => ({
      ...state,
      user: undefined,
      db: undefined,
      isInitialized: true,
      isInitializing: false,
    }));
  },

  initializeFromStorage: async () => {
    const state = get();

    // Prevent double initialization
    if (state.isInitialized || state.isInitializing) return;

    set({ isInitializing: true });

    const username = localStorage.getItem("username");
    if (!username) {
      set({ isInitialized: true, isInitializing: false });
      return;
    }

    try {
      const db = await initDB(`construction_${username}`);

      // Ensure the user doc exists
      await db.users!.upsert({ id: username, createdAt: Date.now() });

      set({ user: username, db, isInitialized: true, isInitializing: false });
    } catch (err) {
      console.error("Failed to restore user session:", err);
      localStorage.removeItem("username");
      set({
        user: undefined,
        db: undefined,
        isInitialized: true,
        isInitializing: false,
      });
    }
  },
}));
