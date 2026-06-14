import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { LogOut, Trash2 } from "lucide-react-native";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { SegmentedControl } from "@/components/SegmentedControl";
import { NativeSwitch } from "@/components/native-ui/NativeSwitch";
import { NativeTextInput } from "@/components/native-ui/NativeTextInput";
import { useAppTheme } from "@/design/theme";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { ImageQuality, ThemePreference } from "@/types/pixiv";

export function SettingsScreen() {
  const theme = useAppTheme();
  const logout = useAuthStore((state) => state.logout);
  const allowR18 = useSettingsStore((state) => state.allowR18);
  const setAllowR18 = useSettingsStore((state) => state.setAllowR18);
  const appTheme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const imageQuality = useSettingsStore((state) => state.imageQuality);
  const setImageQuality = useSettingsStore((state) => state.setImageQuality);
  const bookmarkUserId = useSettingsStore((state) => state.bookmarkUserId);
  const setBookmarkUserId = useSettingsStore((state) => state.setBookmarkUserId);
  const clearPreferences = useSettingsStore((state) => state.clearPreferences);

  const clearCache = async () => {
    try {
      FileSystem.Paths.cache.delete();
      Alert.alert("完了", "Expo のキャッシュディレクトリを削除しました。画像キャッシュは OS により再構築されます。");
    } catch (error) {
      Alert.alert("削除に失敗", error instanceof Error ? error.message : "キャッシュを削除できませんでした。");
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>設定</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>トークン、表示、キャッシュ、アプリ情報</Text>
        </View>

        <Section title="アカウント">
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>
            refresh token は SecureStore に保存されています。ログアウトすると端末から削除します。
          </Text>
          <Button
            label="ログアウト / トークン削除"
            variant="danger"
            icon={<LogOut size={18} color="#fff" />}
            onPress={() => void logout()}
          />
          <NativeTextInput
            value={bookmarkUserId ? String(bookmarkUserId) : ""}
            onChangeText={(value) => void setBookmarkUserId(Number(value) || undefined)}
            keyboardType="number-pad"
            placeholder="自分の Pixiv User ID"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { color: theme.colors.text }]}
          />
        </Section>

        <Section title="表示">
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: theme.colors.text }]}>R-18表示</Text>
              <Text style={[styles.note, { color: theme.colors.textMuted }]}>検索時に個別トグルも必要です。</Text>
            </View>
            <NativeSwitch value={allowR18} onValueChange={(value) => void setAllowR18(value)} />
          </View>
          <SegmentedControl<ThemePreference>
            value={appTheme}
            onChange={(value) => void setTheme(value)}
            options={[
              { label: "自動", value: "system" },
              { label: "ライト", value: "light" },
              { label: "ダーク", value: "dark" }
            ]}
          />
          <SegmentedControl<ImageQuality>
            value={imageQuality}
            onChange={(value) => void setImageQuality(value)}
            options={[
              { label: "標準", value: "medium" },
              { label: "高画質", value: "large" },
              { label: "原寸", value: "original" }
            ]}
          />
        </Section>

        <Section title="データ">
          <Button label="キャッシュ削除" variant="secondary" icon={<Trash2 size={18} color={theme.colors.text} />} onPress={clearCache} />
          <Button label="ローカル設定を初期化" variant="secondary" onPress={() => void clearPreferences()} />
        </Section>

        <Section title="アプリ情報">
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>
            Illustia 1.0.0 / React Native + Expo + vendored pixiv.ts SDK。Pixiv公式アプリではありません。
          </Text>
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingTop: 6,
    paddingBottom: 110
  },
  header: {
    gap: 5,
    marginBottom: 4
  },
  title: {
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600"
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  note: {
    fontSize: 13,
    lineHeight: 20
  },
  row: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16
  },
  rowText: {
    flex: 1
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "800"
  },
  input: {
    minHeight: 48,
    fontSize: 15
  }
});
