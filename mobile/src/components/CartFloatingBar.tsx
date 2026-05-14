import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCart } from "../state/cartStore";
import { cartTotal, formatPrice } from "../utils/price";
import { fonts } from "../theme";
import { ChevronRight } from "./Icons";

/**
 * The visual cart pill — no positioning, no animations. Kept as a separate
 * internal component to keep `CartFloatingBar` readable. Returns null when
 * the cart is empty so the wrapper can render it unconditionally.
 */
function CartPill() {
  const lines = useCart((s) => s.lines);
  if (lines.length === 0) return null;

  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const { total } = cartTotal(lines);

  const goToCart = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/cart");
  };

  return (
    <Pressable
      onPress={goToCart}
      accessibilityRole="button"
      accessibilityLabel={`View cart, ${count} item${count === 1 ? "" : "s"}, ${formatPrice(total)}`}
      style={({ pressed }) => ({
        borderRadius: 999,
        overflow: "hidden",
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <BlurView
        tint="dark"
        intensity={70}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 18,
          backgroundColor: "rgba(224, 122, 59, 0.85)",
          borderRadius: 999,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            minWidth: 26,
            height: 26,
            borderRadius: 13,
            paddingHorizontal: 6,
            backgroundColor: "rgba(255,255,255,0.22)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              color: "#fff",
              fontSize: 12,
              fontFamily: fonts.extrabold,
              fontWeight: "800",
            }}
          >
            {count}
          </Text>
        </View>
        <Text
          style={{
            color: "#fff",
            fontSize: 15,
            fontFamily: fonts.bold,
            fontWeight: "700",
            flex: 1,
          }}
        >
          View cart
        </Text>
        <Text
          style={{
            color: "#fff",
            fontSize: 15,
            fontFamily: fonts.extrabold,
            fontWeight: "800",
          }}
        >
          {formatPrice(total)}
        </Text>
        <ChevronRight color="#fff" size={16} />
      </BlurView>
    </Pressable>
  );
}

/**
 * Floating cart pill anchored above the tab bar — used on the menu screen
 * where it can sit alone over the content. Screens with their own bottom UI
 * (e.g. the chat input bar) surface cart access via <CartHeaderButton /> in
 * the screen header instead.
 */
export function CartFloatingBar() {
  const lines = useCart((s) => s.lines);
  const tabBarHeight = useBottomTabBarHeight();

  if (lines.length === 0) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      entering={FadeInDown.duration(220).springify().damping(16)}
      exiting={FadeOutDown.duration(160)}
      layout={LinearTransition.duration(180)}
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: tabBarHeight + 8,
      }}
    >
      <CartPill />
    </Animated.View>
  );
}
