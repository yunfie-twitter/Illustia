import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  padded?: boolean;
}

export function Screen({ children, padded = true }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.content, padded && styles.padded]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
  padded: { paddingHorizontal: 18 }
});
