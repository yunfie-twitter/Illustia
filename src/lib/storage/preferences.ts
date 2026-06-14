import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ImageQuality, ThemePreference } from "@/types/pixiv";

const SETTINGS_KEY = "illustia.settings";
const SEARCH_HISTORY_KEY = "illustia.searchHistory";

export interface PersistedSettings {
  allowR18: boolean;
  theme: ThemePreference;
  imageQuality: ImageQuality;
  bookmarkUserId?: number;
}

export const defaultSettings: PersistedSettings = {
  allowR18: false,
  theme: "system",
  imageQuality: "large"
};

export async function loadSettings(): Promise<PersistedSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  return { ...defaultSettings, ...JSON.parse(raw) };
}

export async function saveSettings(settings: PersistedSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function loadSearchHistory(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveSearchHistory(history: string[]) {
  await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

export async function clearLocalPreferences() {
  await AsyncStorage.multiRemove([SETTINGS_KEY, SEARCH_HISTORY_KEY]);
}
