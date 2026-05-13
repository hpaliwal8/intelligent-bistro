import { Pressable, Text, View, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, fonts } from "../theme";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  fullWidth?: boolean;
  leftSlot?: React.ReactNode;
  accessibilityHint?: string;
}

function fireHaptic(variant: Variant) {
  switch (variant) {
    case "primary":
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case "destructive":
      return Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning
      );
    case "secondary":
    case "ghost":
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  haptic = true,
  fullWidth = true,
  leftSlot,
  accessibilityHint,
}: Props) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 18, stiffness: 320 });
        opacity.value = withTiming(0.85, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
        opacity.value = withTiming(1, { duration: 120 });
      }}
      onPress={() => {
        if (haptic) void fireHaptic(variant);
        onPress();
      }}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        {
          opacity: isDisabled ? 0.5 : 1,
          backgroundColor:
            variant === "primary"
              ? colors.accent
              : variant === "destructive"
                ? "transparent"
                : variant === "secondary"
                  ? colors.card
                  : "transparent",
          borderWidth:
            variant === "secondary" || variant === "destructive" ? 1 : 0,
          borderColor: variant === "destructive" ? colors.danger : colors.border,
          borderRadius: 14,
          paddingVertical: 16,
          paddingHorizontal: 24,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          alignSelf: fullWidth ? "stretch" : "auto",
        },
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : colors.text} />
      ) : (
        <>
          {leftSlot ? <View>{leftSlot}</View> : null}
          <Text
            style={{
              color:
                variant === "primary"
                  ? "#fff"
                  : variant === "destructive"
                    ? colors.danger
                    : colors.text,
              fontFamily: fonts.bold,
              fontWeight: "700",
              fontSize: 16,
              letterSpacing: 0.3,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}
