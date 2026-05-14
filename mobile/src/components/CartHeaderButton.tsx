import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCart } from "../state/cartStore";
import { colors, fonts } from "../theme";

/**
 * Compact cart button for screen headers. Renders as "CART · 3" pill when
 * the cart has items; renders nothing when empty. Sized to match the Clear
 * button in chat.tsx so they read as siblings when both are present.
 */
export function CartHeaderButton() {
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  if (count === 0) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(160)}
      layout={LinearTransition.duration(180)}
    >
      <Pressable
        onPress={() => {
          void Haptics.selectionAsync();
          router.push("/cart");
        }}
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${count} item${count === 1 ? "" : "s"}`}
        hitSlop={10}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: colors.accent,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 11,
            fontFamily: fonts.bold,
            fontWeight: "700",
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          Cart
        </Text>
        <View
          style={{
            minWidth: 18,
            height: 18,
            paddingHorizontal: 5,
            borderRadius: 9,
            backgroundColor: "rgba(255,255,255,0.28)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              color: "#fff",
              fontSize: 11,
              fontFamily: fonts.extrabold,
              fontWeight: "800",
            }}
          >
            {count}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
