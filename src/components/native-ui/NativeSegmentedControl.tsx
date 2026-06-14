import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/design/theme";
import type { NativeSegmentedControlProps } from "./NativeSegmentedControl.types";

export function NativeSegmentedControl<T extends string>({ value, options, onChange }: NativeSegmentedControlProps<T>) {
  const theme = useAppTheme();
  return (
    <View style={styles.root}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable key={option.value} onPress={() => onChange(option.value)} style={styles.item}>
            <Text
              style={[
                styles.label,
                { color: active ? theme.colors.primary : theme.colors.textMuted },
                active && styles.labelActive
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: 4
  },
  item: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8
  },
  label: {
    fontSize: 13,
    fontWeight: "700"
  },
  labelActive: {
    fontWeight: "900"
  }
});
