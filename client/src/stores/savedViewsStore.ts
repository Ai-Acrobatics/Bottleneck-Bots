import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedView {
  id: string;
  name: string;
  filters: {
    status?: string;
    automationType?: string;
    scheduleType?: string;
    dateRange?: { from?: Date; to?: Date };
  };
  createdAt: Date;
}

interface SavedViewsState {
  views: SavedView[];
  addView: (view: Omit<SavedView, 'id' | 'createdAt'>) => void;
  removeView: (id: string) => void;
  updateView: (id: string, updates: Partial<SavedView>) => void;
}

export const useSavedViewsStore = create<SavedViewsState>()(
  persist(
    (set) => ({
      views: [],
      addView: (view) =>
        set((state) => ({
          views: [
            ...state.views,
            {
              ...view,
              id: crypto.randomUUID(),
              createdAt: new Date(),
            },
          ],
        })),
      removeView: (id) =>
        set((state) => ({
          views: state.views.filter((v) => v.id !== id),
        })),
      updateView: (id, updates) =>
        set((state) => ({
          views: state.views.map((v) => (v.id === id ? { ...v, ...updates } : v)),
        })),
    }),
    {
      name: 'saved-views-storage',
    }
  )
);
