import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { SegmentedControl } from "@/components/SegmentedControl";
import { IllustGrid } from "@/components/IllustGrid";
import { ErrorView } from "@/components/StateViews";
import { SkeletonGrid } from "@/components/Skeleton";
import { useAppTheme } from "@/design/theme";
import { useHomeFeed } from "@/features/home/hooks";
import type { HomeFeedConfig, HomeFeedKind } from "@/types/navigation";

const feedConfigs: Record<HomeFeedKind, HomeFeedConfig> = {
  recommended: { kind: "recommended", title: "おすすめ" },
  ranking: { kind: "ranking", title: "ランキング", rankingMode: "day" },
  new: { kind: "new", title: "新着" }
};

export function HomeScreen() {
  const theme = useAppTheme();
  const [kind, setKind] = useState<HomeFeedKind>("recommended");
  const config = feedConfigs[kind];
  const query = useHomeFeed(config);
  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);

  if (query.isLoading) {
    return (
      <Screen>
        <Header title="今日の巡回" subtitle="軽く、速く、気持ちよく眺めるフィード" />
        <SegmentedControl
          value={kind}
          onChange={setKind}
          options={[
            { label: "おすすめ", value: "recommended" },
            { label: "ランキング", value: "ranking" },
            { label: "新着", value: "new" }
          ]}
        />
        <SkeletonGrid />
      </Screen>
    );
  }

  if (query.isError) {
    return (
      <Screen>
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
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Header title="今日の巡回" subtitle={`${config.title}を表示中`} />
            <SegmentedControl
              value={kind}
              onChange={setKind}
              options={[
                { label: "おすすめ", value: "recommended" },
                { label: "ランキング", value: "ranking" },
                { label: "新着", value: "new" }
              ]}
            />
            {query.isFetchingNextPage ? <Text style={{ color: theme.colors.textMuted }}>続きを読み込み中...</Text> : null}
          </View>
        }
      />
    </Screen>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    gap: 14,
    marginBottom: 14
  },
  header: {
    paddingTop: 6,
    gap: 5
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600"
  }
});
