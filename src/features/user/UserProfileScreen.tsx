import { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { IllustGrid } from "@/components/IllustGrid";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { useAppTheme } from "@/design/theme";
import { useFollowMutation, useUserDetail, useUserIllusts } from "@/features/user/hooks";
import type { RootStackParamList } from "@/types/navigation";
import { PIXIV_IMAGE_HEADERS } from "@/utils/images";
import { formatCount, stripHtml } from "@/utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "UserProfile">;

export function UserProfileScreen({ route }: Props) {
  const theme = useAppTheme();
  const userId = route.params.userId;
  const userQuery = useUserDetail(userId);
  const illustQuery = useUserIllusts(userId);
  const follow = useFollowMutation(userId);
  const items = useMemo(() => illustQuery.data?.pages.flatMap((page) => page.items) ?? [], [illustQuery.data]);

  if (userQuery.isLoading) {
    return (
      <Screen>
        <LoadingView label="作者情報を読み込み中" />
      </Screen>
    );
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <Screen>
        <ErrorView message={userQuery.error?.message ?? "作者が見つかりません。"} onRetry={() => void userQuery.refetch()} />
      </Screen>
    );
  }

  const detail = userQuery.data;
  const profileHeader = (
    <View style={styles.header}>
      {detail.profile.background_image_url ? (
        <Image
          source={{ uri: detail.profile.background_image_url, headers: PIXIV_IMAGE_HEADERS }}
          style={styles.cover}
          resizeMode="cover"
        />
      ) : null}
      <View style={styles.profileRow}>
        <Image
          source={{ uri: detail.user.profile_image_urls.medium, headers: PIXIV_IMAGE_HEADERS }}
          style={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.profileText}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{detail.user.name}</Text>
          <Text style={[styles.id, { color: theme.colors.textMuted }]}>User ID: {detail.user.id}</Text>
        </View>
      </View>
      {detail.user.comment ? (
        <Text style={[styles.comment, { color: theme.colors.text }]}>{stripHtml(detail.user.comment)}</Text>
      ) : null}
      <View style={styles.stats}>
        <Text style={[styles.stat, { color: theme.colors.textMuted }]}>{formatCount(detail.profile.total_illusts)} illusts</Text>
        <Text style={[styles.stat, { color: theme.colors.textMuted }]}>{formatCount(detail.profile.total_follow_users)} follows</Text>
        <Text style={[styles.stat, { color: theme.colors.textMuted }]}>
          {formatCount(detail.profile.total_illust_bookmarks_public)} bookmarks
        </Text>
      </View>
      <Button
        label={detail.user.is_followed ? "フォロー解除" : "フォロー"}
        variant={detail.user.is_followed ? "secondary" : "primary"}
        loading={follow.follow.isPending || follow.unfollow.isPending}
        onPress={() => {
          if (detail.user.is_followed) void follow.unfollow.mutate();
          else void follow.follow.mutate();
        }}
      />
      {illustQuery.isError ? (
        <Text style={{ color: theme.colors.danger }}>{illustQuery.error.message}</Text>
      ) : null}
    </View>
  );

  return (
    <Screen>
      <IllustGrid
        items={items}
        refreshing={illustQuery.isRefetching}
        onRefresh={() => void illustQuery.refetch()}
        onEndReached={() => {
          if (illustQuery.hasNextPage && !illustQuery.isFetchingNextPage) void illustQuery.fetchNextPage();
        }}
        ListHeaderComponent={profileHeader}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 14,
    paddingTop: 4,
    paddingBottom: 18
  },
  cover: {
    width: "100%",
    height: 128
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: {
    width: 72,
    height: 72
  },
  profileText: {
    flex: 1
  },
  name: {
    fontSize: 24,
    fontWeight: "900"
  },
  id: {
    fontSize: 13,
    fontWeight: "700"
  },
  comment: {
    fontSize: 14,
    lineHeight: 22
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  stat: {
    fontSize: 12,
    fontWeight: "800"
  }
});
