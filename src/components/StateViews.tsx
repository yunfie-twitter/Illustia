import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AlertCircle, ImageOff } from "lucide-react-native";
import { useAppTheme } from "@/design/theme";
import { Button } from "@/components/Button";

export function LoadingView({ label = "読み込み中" }: { label?: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={theme.colors.primary} />
      <Text style={[styles.text, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const theme = useAppTheme();
  return (
    <View style={styles.center}>
      <AlertCircle color={theme.colors.danger} size={30} />
      <Text style={[styles.title, { color: theme.colors.text }]}>読み込みに失敗しました</Text>
      <Text style={[styles.text, { color: theme.colors.textMuted }]}>{message}</Text>
      {onRetry ? <Button label="再試行" onPress={onRetry} variant="secondary" style={{ marginTop: 12 }} /> : null}
    </View>
  );
}

export function EmptyView({ label = "まだ表示できる作品がありません" }: { label?: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.center}>
      <ImageOff color={theme.colors.textMuted} size={30} />
      <Text style={[styles.text, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8
  },
  title: {
    fontSize: 17,
    fontWeight: "800"
  },
  text: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20
  }
});
