import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useAppTheme } from "@/design/theme";
import type { NativeButtonProps } from "./NativeButton.types";

export function NativeButton({ label, onPress, variant = "primary", disabled, loading, icon, style }: NativeButtonProps) {
  const theme = useAppTheme();
  const background =
    variant === "primary" ? theme.colors.primary : variant === "danger" ? theme.colors.danger : theme.colors.surfaceMuted;
  const color = variant === "secondary" ? theme.colors.text : "#ffffff";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.5 : pressed ? 0.82 : 1 },
        style
      ]}
    >
      {loading ? <ActivityIndicator color={color} /> : icon}
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  label: {
    fontSize: 15,
    fontWeight: "700"
  }
});
