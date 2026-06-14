import { Switch } from "react-native";
import type { NativeSwitchProps } from "./NativeSwitch.types";

export function NativeSwitch({ value, disabled, onValueChange }: NativeSwitchProps) {
  return <Switch value={value} disabled={disabled} onValueChange={onValueChange} />;
}
