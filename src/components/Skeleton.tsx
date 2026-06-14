import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { useAppTheme } from "@/design/theme";

export function SkeletonGrid() {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 8 }).map((_, index) => (
        <SkeletonCard key={index} tall={index % 3 === 0} />
      ))}
    </View>
  );
}

function SkeletonCard({ tall }: { tall: boolean }) {
  const theme = useAppTheme();
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 720 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.card,
        animatedStyle,
        { height: tall ? 230 : 176, backgroundColor: theme.colors.surfaceMuted }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 12
  },
  card: {
    width: "48%",
    borderRadius: 8
  }
});
