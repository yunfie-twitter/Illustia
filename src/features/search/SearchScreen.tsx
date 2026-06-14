import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Search } from "lucide-react-native";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { IllustGrid } from "@/components/IllustGrid";
import { SegmentedControl } from "@/components/SegmentedControl";
import { NativeSwitch } from "@/components/native-ui/NativeSwitch";
import { NativeTextInput } from "@/components/native-ui/NativeTextInput";
import { ErrorView, EmptyView } from "@/components/StateViews";
import { SkeletonGrid } from "@/components/Skeleton";
import { useAppTheme } from "@/design/theme";
import { useIllustSearch } from "@/features/search/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import type { SearchSort, SearchTarget } from "@/types/pixiv";

export function SearchScreen() {
  const theme = useAppTheme();
  const allowR18 = useSettingsStore((state) => state.allowR18);
  const history = useSettingsStore((state) => state.searchHistory);
  const addHistory = useSettingsStore((state) => state.addSearchHistory);
  const clearHistory = useSettingsStore((state) => state.clearSearchHistory);
  const [draft, setDraft] = useState("");
  const [word, setWord] = useState("");
  const [sort, setSort] = useState<SearchSort>("date_desc");
  const [searchTarget, setSearchTarget] = useState<SearchTarget>("partial_match_for_tags");
  const [includeR18, setIncludeR18] = useState(false);

  const query = useIllustSearch(word, { sort, searchTarget, r18: allowR18 && includeR18 });
  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);

  const submit = async (nextWord = draft) => {
    const normalized = nextWord.trim();
    if (!normalized) return;
    setDraft(normalized);
    setWord(normalized);
    await addHistory(normalized);
  };

  const header = (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.colors.text }]}>検索</Text>
      <View style={styles.searchBox}>
        <Search size={18} color={theme.colors.textMuted} />
        <NativeTextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="タグ、タイトル、作者の手がかり"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => void submit()}
          style={[styles.input, { color: theme.colors.text }]}
        />
      </View>
      <Button label="検索" onPress={() => void submit()} disabled={!draft.trim()} />
      <SegmentedControl
        value={sort}
        onChange={setSort}
        options={[
          { label: "新着順", value: "date_desc" },
          { label: "古い順", value: "date_asc" },
          { label: "人気順", value: "popular_desc" }
        ]}
      />
      <SegmentedControl
        value={searchTarget}
        onChange={setSearchTarget}
        options={[
          { label: "タグ", value: "partial_match_for_tags" },
          { label: "完全一致", value: "exact_match_for_tags" },
          { label: "本文", value: "title_and_caption" }
        ]}
      />
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>R-18を検索に含める</Text>
        <NativeSwitch value={allowR18 && includeR18} disabled={!allowR18} onValueChange={setIncludeR18} />
      </View>
      {!word ? (
        <View style={styles.history}>
          <View style={styles.historyHead}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>検索履歴</Text>
            {history.length ? (
              <Pressable onPress={() => void clearHistory()}>
                <Text style={[styles.clear, { color: theme.colors.primary }]}>消去</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.chips}>
            {history.map((item) => (
              <Pressable key={item} onPress={() => void submit(item)}>
                <Text style={[styles.chip, { color: theme.colors.primary }]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );

  if (!word) {
    return (
      <Screen>
        {header}
        <EmptyView label="キーワードを入力して検索できます" />
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
  searchBox: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  input: {
    flex: 1,
    fontSize: 15
  },
  toggleRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "700"
  },
  history: {
    gap: 8
  },
  historyHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900"
  },
  clear: {
    fontSize: 13,
    fontWeight: "800"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 6,
    paddingHorizontal: 4
  }
});
