import { create } from "zustand";
import type { ImageQuality, ThemePreference } from "@/types/pixiv";
import {
  clearLocalPreferences,
  defaultSettings,
  loadSearchHistory,
  loadSettings,
  saveSearchHistory,
  saveSettings
} from "@/lib/storage/preferences";

interface SettingsState {
  hydrated: boolean;
  allowR18: boolean;
  theme: ThemePreference;
  imageQuality: ImageQuality;
  bookmarkUserId?: number;
  searchHistory: string[];
  hydrate: () => Promise<void>;
  setAllowR18: (value: boolean) => Promise<void>;
  setTheme: (value: ThemePreference) => Promise<void>;
  setImageQuality: (value: ImageQuality) => Promise<void>;
  setBookmarkUserId: (value?: number) => Promise<void>;
  addSearchHistory: (word: string) => Promise<void>;
  clearSearchHistory: () => Promise<void>;
  clearPreferences: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  hydrated: false,
  ...defaultSettings,
  searchHistory: [],
  async hydrate() {
    const [settings, history] = await Promise.all([loadSettings(), loadSearchHistory()]);
    set({ ...settings, searchHistory: history, hydrated: true });
  },
  async setAllowR18(value) {
    const next = { ...defaultSettings, ...get(), allowR18: value };
    set({ allowR18: value });
    await saveSettings({
      allowR18: next.allowR18,
      theme: next.theme,
      imageQuality: next.imageQuality,
      bookmarkUserId: next.bookmarkUserId
    });
  },
  async setTheme(value) {
    const next = { ...defaultSettings, ...get(), theme: value };
    set({ theme: value });
    await saveSettings({
      allowR18: next.allowR18,
      theme: next.theme,
      imageQuality: next.imageQuality,
      bookmarkUserId: next.bookmarkUserId
    });
  },
  async setImageQuality(value) {
    const next = { ...defaultSettings, ...get(), imageQuality: value };
    set({ imageQuality: value });
    await saveSettings({
      allowR18: next.allowR18,
      theme: next.theme,
      imageQuality: next.imageQuality,
      bookmarkUserId: next.bookmarkUserId
    });
  },
  async setBookmarkUserId(value) {
    const next = { ...defaultSettings, ...get(), bookmarkUserId: value };
    set({ bookmarkUserId: value });
    await saveSettings({
      allowR18: next.allowR18,
      theme: next.theme,
      imageQuality: next.imageQuality,
      bookmarkUserId: next.bookmarkUserId
    });
  },
  async addSearchHistory(word) {
    const normalized = word.trim();
    if (!normalized) return;
    const next = [normalized, ...get().searchHistory.filter((item) => item !== normalized)].slice(0, 20);
    set({ searchHistory: next });
    await saveSearchHistory(next);
  },
  async clearSearchHistory() {
    set({ searchHistory: [] });
    await saveSearchHistory([]);
  },
  async clearPreferences() {
    await clearLocalPreferences();
    set({ ...defaultSettings, searchHistory: [], hydrated: true });
  }
}));
