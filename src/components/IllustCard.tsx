import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Heart } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "@/design/theme";
import type { RootStackParamList } from "@/types/navigation";
import type { PixivIllust } from "@/types/pixiv";
import { useSettingsStore } from "@/stores/settingsStore";
import { formatCount } from "@/utils/format";
import { getIllustImageUrl, PIXIV_IMAGE_HEADERS } from "@/utils/images";

interface Props {
  illust: PixivIllust;
}

export function IllustCard({ illust }: Props) {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const quality = useSettingsStore((state) => state.imageQuality);
  const aspectRatio = illust.width && illust.height ? illust.width / illust.height : 0.78;

  return (
    <Pressable
      onPress={() => navigation.navigate("IllustDetail", { illustId: illust.id, title: illust.title })}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.86 : 1 }]}
    >
      <Image
        source={{ uri: getIllustImageUrl(illust, quality), headers: PIXIV_IMAGE_HEADERS }}
        style={[styles.image, { aspectRatio }]}
        resizeMode="cover"
      />
      {illust.page_count > 1 ? (
        <View style={[styles.pageBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.pageText}>{illust.page_count}</Text>
        </View>
      ) : null}
      <View style={styles.meta}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
          {illust.title}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.author, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {illust.user.name}
          </Text>
          <View style={styles.likes}>
            <Heart size={13} color={illust.is_bookmarked ? theme.colors.danger : theme.colors.textMuted} />
            <Text style={[styles.count, { color: theme.colors.textMuted }]}>{formatCount(illust.total_bookmarks)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginBottom: 14,
    overflow: "hidden"
  },
  image: {
    width: "100%",
    minHeight: 150
  },
  pageBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 26,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6
  },
  pageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800"
  },
  meta: {
    paddingTop: 8,
    paddingHorizontal: 2,
    gap: 6
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  author: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600"
  },
  likes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  count: {
    fontSize: 12,
    fontWeight: "700"
  }
});
