import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { Button as SwiftButton, Host } from "@expo/ui/swift-ui";
import { useAppTheme } from "@/design/theme";
import type { NativeButtonProps } from "./NativeButton.types";

function FallbackButton({ label, onPress, variant = "primary", disabled, loading, icon, style }: NativeButtonProps) {
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
        styles.fallbackButton,
        { backgroundColor: background, opacity: disabled ? 0.5 : pressed ? 0.82 : 1 },
        style
      ]}
    >
      {loading ? <ActivityIndicator color={color} /> : icon}
      <Text style={[styles.fallbackLabel, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function NativeButton(props: NativeButtonProps) {
  if (props.loading || props.icon) {
    return <FallbackButton {...props} />;
  }

  const swiftVariant = props.variant === "primary" ? "borderedProminent" : props.variant === "danger" ? "borderedProminent" : "bordered";

  return (
    <Host matchContents style={[styles.host, props.style]}>
      <SwiftButton
        color={props.variant === "danger" ? "#d8465f" : undefined}
        disabled={props.disabled}
        onPress={props.onPress}
        variant={swiftVariant}
      >
        {props.label}
      </SwiftButton>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    minHeight: 48,
    justifyContent: "center"
  },
  fallbackButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  fallbackLabel: {
    fontSize: 15,
    fontWeight: "700"
  }
});
