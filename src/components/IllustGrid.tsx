import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { IllustCard } from "@/components/IllustCard";
import type { PixivIllust } from "@/types/pixiv";
import { useAppTheme } from "@/design/theme";
import { EmptyView } from "@/components/StateViews";

interface Props {
  items: PixivIllust[];
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export function IllustGrid({ items, refreshing, onRefresh, onEndReached, ListHeaderComponent }: Props) {
  const theme = useAppTheme();

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <IllustCard illust={item} />
        </View>
      )}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.7}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={<EmptyView />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 12,
    paddingBottom: 110
  },
  row: {
    gap: 12
  },
  cell: {
    flex: 1,
    maxWidth: "50%"
  }
});
