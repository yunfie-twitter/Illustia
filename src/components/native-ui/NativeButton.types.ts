import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";

export interface NativeButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
}
