import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/components/Screen";
import { useAppTheme } from "@/design/theme";
import { useAuthStore } from "@/stores/authStore";
import { PixivLoginWebView } from "@/features/auth/PixivLoginWebView";
import type { RootStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Setup">;

export function SetupScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const login = useAuthStore((state) => state.login);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const error = useAuthStore((state) => state.error);

  return (
    <Screen>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Illustia</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Pixiv にログインします。Refresh token は端末の SecureStore に保存します。
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title={isAuthenticating ? "ログイン中..." : "pixiv でログイン"}
            onPress={() => setIsWebViewVisible(true)}
            disabled={isAuthenticating}
          />
          <Button title="Reflesh Tokenでログイン" onPress={() => navigation.navigate("RefreshTokenLogin")} />
          {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
        </View>

        <PixivLoginWebView
          visible={isWebViewVisible}
          onClose={() => setIsWebViewVisible(false)}
          onRefreshToken={login}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    gap: 24
  },
  header: {
    gap: 12
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 0
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23
  },
  actions: {
    gap: 12
  },
  error: {
    fontSize: 13,
    lineHeight: 19
  }
});
