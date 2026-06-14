import { useColorScheme } from "react-native";
import { useSettingsStore } from "@/stores/settingsStore";

export const lightTheme = {
  dark: false,
  colors: {
    background: "#f7f9fc",
    surface: "#ffffff",
    surfaceMuted: "#eef4ff",
    text: "#162033",
    textMuted: "#657189",
    border: "#dce6f5",
    primary: "#1d7ff2",
    primarySoft: "#d8ebff",
    danger: "#d8465f",
    shadow: "rgba(21, 44, 92, 0.14)"
  }
};

export const darkTheme = {
  dark: true,
  colors: {
    background: "#0d1118",
    surface: "#151b25",
    surfaceMuted: "#1e2a3a",
    text: "#eef5ff",
    textMuted: "#9ba9bd",
    border: "#273446",
    primary: "#5aa7ff",
    primarySoft: "#15375c",
    danger: "#ff6b81",
    shadow: "rgba(0, 0, 0, 0.35)"
  }
};

export type AppTheme = typeof lightTheme;

export function useAppTheme(): AppTheme {
  const system = useColorScheme();
  const preference = useSettingsStore((state) => state.theme);
  if (preference === "dark") return darkTheme;
  if (preference === "light") return lightTheme;
  return system === "dark" ? darkTheme : lightTheme;
}
