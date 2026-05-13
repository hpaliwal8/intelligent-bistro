import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { colors } from "../theme";

function Dot({ delay }: { delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 400 })
        )
      ),
      -1,
      false
    );
  }, [delay, t]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + t.value * 0.7,
    transform: [{ translateY: -2 * t.value }],
  }));
  return (
    <Animated.View
      style={[
        {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.muted,
        },
        style,
      ]}
    />
  );
}

export function TypingIndicator() {
  return (
    <View
      accessibilityLabel="Assistant is typing"
      style={{
        flexDirection: "row",
        gap: 4,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: colors.card,
        borderRadius: 16,
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}
