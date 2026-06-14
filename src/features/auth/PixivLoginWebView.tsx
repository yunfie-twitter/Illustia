import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/design/theme";
import {
  createPixivLoginRequest,
  exchangePixivAuthCode,
  readPixivCallbackCode,
  type PixivLoginRequest
} from "@/lib/pixiv/oauth";

interface PixivLoginWebViewProps {
  visible: boolean;
  onClose: () => void;
  onRefreshToken: (refreshToken: string) => Promise<void>;
}

export function PixivLoginWebView({ visible, onClose, onRefreshToken }: PixivLoginWebViewProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [request, setRequest] = useState<PixivLoginRequest | null>(null);
  const [error, setError] = useState<string>();
  const [isExchanging, setIsExchanging] = useState(false);
  const consumedCodeRef = useRef(false);

  useEffect(() => {
    if (!visible) return;

    consumedCodeRef.current = false;
    setRequest(null);
    setError(undefined);
    setIsExchanging(false);

    void createPixivLoginRequest()
      .then(setRequest)
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "ログイン URL の生成に失敗しました。");
      });
  }, [visible]);

  async function consumeUrl(url: string) {
    if (!request || consumedCodeRef.current) return false;

    let code: string | undefined;
    try {
      code = readPixivCallbackCode(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "pixiv ログインがキャンセルされました。");
      return true;
    }

    if (!code) return false;

    consumedCodeRef.current = true;
    setIsExchanging(true);
    setError(undefined);

    try {
      const token = await exchangePixivAuthCode(code, request.codeVerifier);
      await onRefreshToken(token.refreshToken);
      onClose();
    } catch (cause) {
      consumedCodeRef.current = false;
      setError(cause instanceof Error ? cause.message : "refresh token の取得に失敗しました。");
    } finally {
      setIsExchanging(false);
    }

    return true;
  }

  function handleNavigation(navState: WebViewNavigation) {
    void consumeUrl(navState.url);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>pixiv ログイン</Text>
            <Text style={[styles.caption, { color: theme.colors.textMuted }]}>内部 WebView で認証しています</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="閉じる"
            onPress={onClose}
            style={({ pressed }) => [
              styles.close,
              { backgroundColor: theme.colors.surfaceMuted, opacity: pressed ? 0.72 : 1 }
            ]}
          >
            <X color={theme.colors.text} size={22} />
          </Pressable>
        </View>

        <View style={styles.webviewWrap}>
          {request ? (
            <WebView
              source={{ uri: request.loginUrl }}
              onNavigationStateChange={handleNavigation}
              onShouldStartLoadWithRequest={(event) => {
                void consumeUrl(event.url);
                return !event.url.startsWith("https://app-api.pixiv.net/web/v1/users/auth/pixiv/callback");
              }}
              sharedCookiesEnabled
              thirdPartyCookiesEnabled
              startInLoadingState
              userAgent="PixivAndroidApp/5.0.234 (Android 11; Pixel 5)"
              renderLoading={() => (
                <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                  <ActivityIndicator color={theme.colors.primary} />
                </View>
              )}
            />
          ) : (
            <View style={styles.center}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          )}

          {isExchanging ? (
            <View style={[styles.overlay, { backgroundColor: theme.colors.background }]}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={[styles.overlayText, { color: theme.colors.text }]}>refresh token を取得中</Text>
            </View>
          ) : null}
        </View>

        {error ? (
          <View style={[styles.errorBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
            <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  title: {
    fontSize: 18,
    fontWeight: "900"
  },
  caption: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700"
  },
  close: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  webviewWrap: {
    flex: 1
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    opacity: 0.96
  },
  overlayText: {
    fontSize: 14,
    fontWeight: "800"
  },
  errorBar: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  error: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  }
});
