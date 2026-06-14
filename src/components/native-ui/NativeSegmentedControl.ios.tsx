import { StyleSheet } from "react-native";
import { Host, Picker } from "@expo/ui/swift-ui";
import type { NativeSegmentedControlProps } from "./NativeSegmentedControl.types";

export function NativeSegmentedControl<T extends string>({ value, options, onChange }: NativeSegmentedControlProps<T>) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  return (
    <Host matchContents style={styles.host}>
      <Picker
        options={options.map((option) => option.label)}
        selectedIndex={selectedIndex}
        variant="segmented"
        onOptionSelected={({ nativeEvent }) => {
          const next = options[nativeEvent.index];
          if (next) onChange(next.value);
        }}
      />
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    minHeight: 38,
    alignSelf: "stretch"
  }
});
