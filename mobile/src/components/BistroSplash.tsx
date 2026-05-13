import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors, fonts } from "../theme";

function FlameMark() {
  const flicker = useSharedValue(1);
  useEffect(() => {
    flicker.value = withSequence(
      withTiming(1.06, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      withTiming(0.97, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) })
    );
  }, [flicker]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: flicker.value }, { scaleX: 1 + (flicker.value - 1) * 0.4 }],
  }));

  return (
    <Animated.View style={style}>
      <Svg width={56} height={72} viewBox="0 0 24 32">
        <Defs>
          <LinearGradient id="flameFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accentSoft} />
            <Stop offset="0.55" stopColor={colors.accent} />
            <Stop offset="1" stopColor="#7A2E12" />
          </LinearGradient>
        </Defs>
        <Path
          d="M12 1.5 C 8.5 6, 5 9.5, 5 16 C 5 24, 8.5 30, 12 30 C 15.5 30, 19 26, 19 19 C 19 15, 16 13, 14.5 9 C 13.5 6.5, 13.5 4, 12 1.5 Z"
          fill="url(#flameFill)"
        />
        <Path
          d="M12 9 C 10.5 12, 9 14, 9 18 C 9 23, 10.5 27, 12 27 C 13.5 27, 15 24, 15 20 C 15 17, 13 15.5, 12 13 C 11.5 11.5, 11.5 10.5, 12 9 Z"
          fill={colors.accentSoft}
          opacity={0.7}
        />
      </Svg>
    </Animated.View>
  );
}

export function BistroSplash() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.94);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) });
    scale.value = withDelay(60, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
  }, [opacity, scale]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityLabel="Loading The Intelligent Bistro"
    >
      <Animated.View style={[{ alignItems: "center" }, containerStyle]}>
        <FlameMark />
        <View style={{ height: 24 }} />
        <Text
          style={{
            color: colors.text,
            fontFamily: fonts.extrabold,
            fontWeight: "800",
            fontSize: 16,
            letterSpacing: 4,
            textAlign: "center",
          }}
          allowFontScaling={false}
        >
          THE INTELLIGENT BISTRO
        </Text>
        <View
          style={{
            marginTop: 14,
            height: 1.5,
            width: 48,
            backgroundColor: colors.accent,
            opacity: 0.6,
            borderRadius: 999,
          }}
        />
      </Animated.View>
    </View>
  );
}
