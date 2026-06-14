import { Switch as RNSwitch } from "react-native";
import { Host, Switch } from "@expo/ui/swift-ui";
import type { NativeSwitchProps } from "./NativeSwitch.types";

export function NativeSwitch({ value, disabled, onValueChange }: NativeSwitchProps) {
  if (disabled) {
    return <RNSwitch value={value} disabled={disabled} onValueChange={onValueChange} />;
  }

  return (
    <Host matchContents>
      <Switch value={value} onValueChange={onValueChange} />
    </Host>
  );
}
