import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Heart, UserRound } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { useAppTheme } from "@/design/theme";
import { useIllustDetail, useBookmarkMutation } from "@/features/illust/hooks";
import type { RootStackParamList } from "@/types/navigation";
import { useSettingsStore } from "@/stores/settingsStore";
import { formatCount, formatDate, stripHtml } from "@/utils/format";
import { getIllustPageUrls, PIXIV_IMAGE_HEADERS } from "@/utils/images";

type Props = NativeStackScreenProps<RootStackParamList, "IllustDetail">;

export function IllustDetailScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const quality = useSettingsStore((state) => state.imageQuality);
  const [page, setPage] = useState(0);
  const query = useIllustDetail(route.params.illustId);
  const bookmark = useBookmarkMutation(route.params.illustId);
  const illust = query.data;
  const pages = useMemo(() => (illust ? getIllustPageUrls(illust, quality) : []), [illust, quality]);

  if (query.isLoading) {
    return (
      <Screen>
        <LoadingView label="作品を読み込み中" />
      </Screen>
    );
  }

  if (query.isError || !illust) {
    return (
      <Screen>
        <ErrorView message={query.error?.message ?? "作品が見つかりません。"} onRetry={() => void query.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: pages[page], headers: PIXIV_IMAGE_HEADERS }}
          style={[styles.mainImage, { aspectRatio: illust.width / illust.height || 0.72 }]}
          resizeMode="contain"
        />
        {pages.length > 1 ? (
          <View style={styles.pageRail}>
            {pages.map((uri, index) => (
              <Pressable
                key={uri}
                onPress={() => setPage(index)}
                style={[
                  styles.thumbWrap,
                  index === page && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary }
                ]}
              >
                <Image
                  source={{ uri, headers: PIXIV_IMAGE_HEADERS }}
                  style={styles.thumb}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{illust.title}</Text>
          <Pressable
            onPress={() => navigation.navigate("UserProfile", { userId: illust.user.id, name: illust.user.name })}
            style={styles.author}
          >
            <Image
              source={{ uri: illust.user.profile_image_urls.medium, headers: PIXIV_IMAGE_HEADERS }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.authorText}>
              <Text style={[styles.authorName, { color: theme.colors.text }]}>{illust.user.name}</Text>
              <Text style={[styles.muted, { color: theme.colors.textMuted }]}>ID: {illust.user.id}</Text>
            </View>
            <UserRound color={theme.colors.primary} size={20} />
          </Pressable>

          <View style={styles.stats}>
            <Text style={[styles.stat, { color: theme.colors.textMuted }]}>{formatCount(illust.total_bookmarks)} bookmarks</Text>
            <Text style={[styles.stat, { color: theme.colors.textMuted }]}>{formatCount(illust.total_view)} views</Text>
            <Text style={[styles.stat, { color: theme.colors.textMuted }]}>{formatDate(illust.create_date)}</Text>
          </View>

          <View style={styles.actions}>
            <Button
              label={illust.is_bookmarked ? "ブックマーク解除" : "ブックマーク"}
              onPress={() => {
                if (illust.is_bookmarked) void bookmark.remove.mutate();
                else void bookmark.add.mutate("public");
              }}
              loading={bookmark.isPending}
              variant={illust.is_bookmarked ? "secondary" : "primary"}
              icon={<Heart color={illust.is_bookmarked ? theme.colors.danger : "#fff"} size={18} />}
              style={{ flex: 1 }}
            />
          </View>

          {illust.caption ? (
            <Text style={[styles.caption, { color: theme.colors.text }]}>{stripHtml(illust.caption)}</Text>
          ) : null}

          <View style={styles.tags}>
            {illust.tags.map((tag) => (
              <Text key={tag.name} style={[styles.tagText, { color: theme.colors.primary }]}>
                #{tag.name}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 110
  },
  mainImage: {
    width: "100%",
    minHeight: 360
  },
  pageRail: {
    flexDirection: "row",
    gap: 8,
    padding: 14
  },
  thumbWrap: {
    paddingBottom: 4
  },
  thumb: {
    width: 58,
    height: 58
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 16,
    gap: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  avatar: {
    width: 44,
    height: 44
  },
  authorText: {
    flex: 1
  },
  authorName: {
    fontSize: 15,
    fontWeight: "900"
  },
  muted: {
    fontSize: 12,
    fontWeight: "600"
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  stat: {
    fontSize: 12,
    fontWeight: "800"
  },
  actions: {
    flexDirection: "row"
  },
  caption: {
    fontSize: 14,
    lineHeight: 22
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  tagText: {
    fontSize: 13,
    fontWeight: "800"
  }
});
