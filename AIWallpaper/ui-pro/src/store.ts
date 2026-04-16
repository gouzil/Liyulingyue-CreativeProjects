import { create } from 'zustand';

interface AppState {
  apiKey: string;
  isGenerating: boolean;
  currentWallpaper: string | null;
  history: string[];
  setApiKey: (key: string) => void;
  setGenerating: (generating: boolean) => void;
  setCurrentWallpaper: (url: string) => void;
  addToHistory: (url: string) => void;
}

export const useStore = create<AppState>((set) => ({
  apiKey: '',
  isGenerating: false,
  currentWallpaper: null,
  history: [],
  setApiKey: (key) => set({ apiKey: key }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  setCurrentWallpaper: (url) => set({ currentWallpaper: url }),
  addToHistory: (url) => set((state) => ({ history: [url, ...state.history] })),
}));
