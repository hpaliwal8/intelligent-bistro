import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  interpolateColor,
  FadeIn,
  FadeOutLeft,
  LinearTransition,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { CartLine } from "../../../shared";
import { findItem } from "../../../shared";
import { colors, fonts } from "../theme";
import { unitPrice, formatPrice } from "../utils/price";
import { MENU_IMAGE_PLACEHOLDER, menuImageSource } from "../utils/menuImages";
import { QuantityStepper } from "./QuantityStepper";
import { TrashIcon } from "./Icons";
import { useCart } from "../state/cartStore";

export function CartLineRow({ line }: { line: CartLine }) {
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeLine = useCart((s) => s.removeLine);
  const lastAiTouched = useCart((s) => s.lastAiTouched);
  const item = findItem(line.itemId);

  // Pulse this line whenever the AI most-recently-touched lineId matches us.
  // `nonce` bumps even on repeat touches, so the effect re-fires correctly.
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (lastAiTouched.lineId === line.lineId) {
      pulse.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 700 })
      );
    }
  }, [lastAiTouched.lineId, lastAiTouched.nonce, line.lineId, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      pulse.value,
      [0, 1],
      [colors.border, colors.accent]
    ),
    transform: [{ scale: 1 + pulse.value * 0.015 }],
  }));

  const onEdit = () => {
    void Haptics.selectionAsync();
    if (item) {
      router.push(`/item/${item.id}?lineId=${line.lineId}`);
    }
  };

  if (!item) return null;

  const modifierLabels = line.modifiers
    .map((sel) => {
      const group = item.modifiers.find((g) => g.id === sel.groupId);
      const opt = group?.options.find((o) => o.id === sel.optionId);
      return opt?.label;
    })
    .filter(Boolean)
    .join(" • ");

  const unit = unitPrice(item, line.modifiers);
  const total = unit * line.quantity;

  // Outer Animated.View — layout / enter / exit transitions only.
  // Inner Animated.View — pulse (border + scale). Splitting avoids
  // Reanimated's transform-overwrite warning when both layout and pulse
  // animations target the same node.
  return (
    <Animated.View
      entering={FadeIn.duration(260).springify().damping(16)}
      exiting={FadeOutLeft.duration(180)}
      layout={LinearTransition.springify().damping(18).stiffness(180)}
      style={{ marginBottom: 12 }}
    >
      <Animated.View
        style={[
          {
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            overflow: "hidden",
          },
          pulseStyle,
        ]}
      >
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${item.name}`}
          accessibilityHint="Opens modifier picker for this line"
          style={({ pressed }) => ({
            flexDirection: "row",
            padding: 12,
            gap: 12,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Image
            source={menuImageSource(item.id, item.image)}
            placeholder={{ blurhash: MENU_IMAGE_PLACEHOLDER }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              backgroundColor: colors.surface,
            }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.text,
                    fontFamily: fonts.bold,
                    fontWeight: "700",
                    fontSize: 15,
                    flex: 1,
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    color: colors.accentSoft,
                    fontFamily: fonts.bold,
                    fontWeight: "700",
                    fontSize: 14,
                    marginLeft: 8,
                  }}
                >
                  {formatPrice(total)}
                </Text>
              </View>
              {modifierLabels ? (
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.muted,
                    fontSize: 12,
                    marginTop: 2,
                    fontFamily: fonts.regular,
                  }}
                >
                  {modifierLabels}
                </Text>
              ) : null}
              {line.notes ? (
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.muted,
                    fontSize: 12,
                    fontStyle: "italic",
                    marginTop: 2,
                    fontFamily: fonts.regular,
                  }}
                >
                  “{line.notes}”
                </Text>
              ) : null}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <QuantityStepper
                value={line.quantity}
                onChange={(q) => updateQuantity(line.lineId, q)}
                size="sm"
                label={item.name}
              />
              <Pressable
                onPress={() => {
                  void Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Warning
                  );
                  removeLine(line.lineId);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.name} from cart`}
                hitSlop={16}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                })}
              >
                <TrashIcon size={18} />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
