import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors, fonts } from "../theme";
import { formatPrice } from "../utils/price";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  visible: boolean;
  itemCount: number;
  totalCents: number;
  onDismiss: () => void;
}

export function OrderSuccessOverlay({
  visible,
  itemCount,
  totalCents,
  onDismiss,
}: Props) {
  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.85);
  const cardOpacity = useSharedValue(0);
  const checkProgress = useSharedValue(0); // 0 → 1 reveal stroke
  const ringScale = useSharedValue(0.6);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 220 });
      cardScale.value = withSpring(1, { damping: 14, stiffness: 200 });
      cardOpacity.value = withTiming(1, { duration: 220 });
      ringScale.value = withDelay(
        80,
        withSpring(1, { damping: 11, stiffness: 180 })
      );
      checkProgress.value = withDelay(
        220,
        withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) })
      );
    } else {
      backdropOpacity.value = withTiming(0, { duration: 180 });
      cardScale.value = withTiming(0.92, { duration: 180 });
      cardOpacity.value = withTiming(0, { duration: 180 });
      // Reset for next time
      checkProgress.value = 0;
      ringScale.value = 0.6;
    }
  }, [visible, backdropOpacity, cardScale, cardOpacity, checkProgress, ringScale]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));
  // Animate the check stroke by tweening strokeDashoffset from full length → 0.
  // SVG path length for the check is ~24; we use 32 to give some over-draw.
  const checkAnimatedProps = useAnimatedStyle(() => ({
    // react-native-svg supports strokeDashoffset via animated props,
    // emulated here via opacity step in case Path animated props aren't honored.
    opacity: checkProgress.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(8,5,3,0.78)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 28,
        },
        backdropStyle,
      ]}
    >
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss order confirmation"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <Animated.View
        style={[
          {
            backgroundColor: colors.surface,
            borderRadius: 28,
            paddingTop: 36,
            paddingBottom: 28,
            paddingHorizontal: 28,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
            width: "100%",
            maxWidth: 340,
          },
          cardStyle,
        ]}
      >
        <Animated.View style={[ringStyle]}>
          <Svg width={88} height={88} viewBox="0 0 88 88">
            <Defs>
              <LinearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.success} stopOpacity="1" />
                <Stop offset="1" stopColor="#4F8141" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Path
              d="M 44 4 a 40 40 0 1 0 0.001 0"
              fill="url(#successGradient)"
            />
          </Svg>
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
              },
              checkAnimatedProps,
            ]}
          >
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
              <AnimatedPath
                d="M5 12.5 L10 17.5 L19.5 7"
                stroke="#fff"
                strokeWidth={3.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        </Animated.View>

        <Text
          style={{
            color: colors.text,
            fontSize: 24,
            fontFamily: fonts.extrabold,
            fontWeight: "800",
            marginTop: 22,
            letterSpacing: -0.4,
          }}
        >
          Order placed
        </Text>
        <Text
          style={{
            color: colors.muted,
            fontSize: 14,
            marginTop: 8,
            textAlign: "center",
            fontFamily: fonts.regular,
            lineHeight: 20,
          }}
        >
          {itemCount} item{itemCount === 1 ? "" : "s"} • {formatPrice(totalCents)}
          {"\n"}We'll have it ready shortly.
        </Text>

        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={({ pressed }) => ({
            marginTop: 22,
            paddingVertical: 14,
            paddingHorizontal: 28,
            borderRadius: 14,
            backgroundColor: colors.accent,
            alignSelf: "stretch",
            alignItems: "center",
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontFamily: fonts.bold,
              fontWeight: "700",
              letterSpacing: 0.3,
            }}
          >
            Done
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

