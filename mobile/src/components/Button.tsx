import { Pressable, Text, View, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../theme";

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
  return (
    <Pressable
      onPress={() => {
        if (haptic) void fireHaptic(variant);
        onPress();
      }}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => ({
        opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        backgroundColor:
          variant === "primary"
            ? colors.accent
            : variant === "destructive"
              ? "transparent"
              : variant === "secondary"
                ? colors.card
                : "transparent",
        borderWidth: variant === "secondary" || variant === "destructive" ? 1 : 0,
        borderColor: variant === "destructive" ? colors.danger : colors.border,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        alignSelf: fullWidth ? "stretch" : "auto",
      })}
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
              fontWeight: "700",
              fontSize: 16,
              letterSpacing: 0.3,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
