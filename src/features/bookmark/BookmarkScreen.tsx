import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { IllustGrid } from "@/components/IllustGrid";
import { SegmentedControl } from "@/components/SegmentedControl";
import { NativeTextInput } from "@/components/native-ui/NativeTextInput";
import { EmptyView, ErrorView } from "@/components/StateViews";
import { SkeletonGrid } from "@/components/Skeleton";
import { useAppTheme } from "@/design/theme";
import { useBookmarks } from "@/features/bookmark/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import type { Restrict } from "@/types/pixiv";

export function BookmarkScreen() {
  const theme = useAppTheme();
  const bookmarkUserId = useSettingsStore((state) => state.bookmarkUserId);
  const setBookmarkUserId = useSettingsStore((state) => state.setBookmarkUserId);
  const [draftUserId, setDraftUserId] = useState(bookmarkUserId ? String(bookmarkUserId) : "");
  const [restrict, setRestrict] = useState<Restrict>("public");
  const [tag, setTag] = useState("");
  const query = useBookmarks(bookmarkUserId, restrict, tag.trim());
  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);

  const header = (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.colors.text }]}>ブックマーク</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
        自分の Pixiv User ID を設定すると公開/非公開ブックマークを取得できます。
      </Text>
      <View style={styles.inputRow}>
        <NativeTextInput
          value={draftUserId}
          onChangeText={setDraftUserId}
          keyboardType="number-pad"
          placeholder="User ID"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, { color: theme.colors.text }]}
        />
        <Button
          label="保存"
          onPress={() => void setBookmarkUserId(Number(draftUserId) || undefined)}
          disabled={!draftUserId.trim()}
          style={styles.smallButton}
        />
      </View>
      <SegmentedControl
        value={restrict}
        onChange={setRestrict}
        options={[
          { label: "公開", value: "public" },
          { label: "非公開", value: "private" }
        ]}
      />
      <NativeTextInput
        value={tag}
        onChangeText={setTag}
        placeholder="タグで絞り込み"
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.tagInput, { color: theme.colors.text }]}
      />
    </View>
  );

  if (!bookmarkUserId) {
    return (
      <Screen>
        {header}
        <EmptyView label="ブックマーク取得用の User ID を保存してください" />
      </Screen>
    );
  }

  if (query.isLoading) {
    return (
      <Screen>
        {header}
        <SkeletonGrid />
      </Screen>
    );
  }

  if (query.isError) {
    return (
      <Screen>
        {header}
        <ErrorView message={query.error.message} onRetry={() => void query.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <IllustGrid
        items={items}
        refreshing={query.isRefetching}
        onRefresh={() => void query.refetch()}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        ListHeaderComponent={header}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 12,
    paddingTop: 6,
    paddingBottom: 14
  },
  title: {
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20
  },
  inputRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  input: {
    flex: 1,
    fontSize: 15,
    minHeight: 44
  },
  smallButton: {
    minHeight: 38
  },
  tagInput: {
    minHeight: 48,
    fontSize: 15
  }
});
