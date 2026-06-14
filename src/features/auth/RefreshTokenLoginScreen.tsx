import { useState } from "react";
import { Button, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "@/components/Screen";
import { useAppTheme } from "@/design/theme";
import { useAuthStore } from "@/stores/authStore";

export function RefreshTokenLoginScreen() {
  const theme = useAppTheme();
  const [refreshToken, setRefreshToken] = useState("");
  const login = useAuthStore((state) => state.login);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const error = useAuthStore((state) => state.error);
  const canSubmit = refreshToken.trim().length > 0 && !isAuthenticating;

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.root}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Refresh Token</Text>
          <Text style={[styles.description, { color: theme.colors.textMuted }]}>
            Pixiv の refresh token を入力してログインします。
          </Text>
          <TextInput
            value={refreshToken}
            onChangeText={setRefreshToken}
            placeholder="pixiv refresh token"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            multiline
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderColor: theme.colors.border
              }
            ]}
          />
          {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
          <Button
            title={isAuthenticating ? "接続中..." : "ログイン"}
            onPress={() => void login(refreshToken)}
            disabled={!canSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center"
  },
  content: {
    gap: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0
  },
  description: {
    fontSize: 15,
    lineHeight: 22
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 15,
    textAlignVertical: "top"
  },
  error: {
    fontSize: 13,
    lineHeight: 19
  }
});
