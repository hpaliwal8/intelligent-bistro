import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../../src/state/cartStore";
import { colors, fonts } from "../../src/theme";

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      numberOfLines={1}
      allowFontScaling={false}
      style={{
        color: focused ? colors.accent : colors.muted,
        fontSize: 11,
        letterSpacing: 1.4,
        fontFamily: focused ? fonts.bold : fonts.medium,
        fontWeight: focused ? "700" : "500",
        textTransform: "uppercase",
        textAlign: "center",
        paddingHorizontal: 4,
      }}
    >
      {label}
    </Text>
  );
}

function CartBadge() {
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const scale = useSharedValue(1);

  useEffect(() => {
    if (count > 0) {
      scale.value = withSequence(
        withTiming(1.35, { duration: 130 }),
        withSpring(1, { damping: 9, stiffness: 240 })
      );
    }
  }, [count, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (count === 0) return null;
  return (
    <Animated.View
      accessibilityLabel={`${count} items in cart`}
      style={[
        {
          position: "absolute",
          top: -6,
          right: -4,
          minWidth: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: colors.accent,
          paddingHorizontal: 4,
          alignItems: "center",
          justifyContent: "center",
        },
        animatedStyle,
      ]}
    >
      <Text
        allowFontScaling={false}
        style={{
          color: "#fff",
          fontSize: 9,
          fontFamily: fonts.bold,
          fontWeight: "700",
        }}
      >
        {count}
      </Text>
    </Animated.View>
  );
}

function CartTabLabel({ focused }: { focused: boolean }) {
  return (
    <View style={{ position: "relative" }}>
      <TabLabel label="Cart" focused={focused} />
      <CartBadge />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const BAR_HEIGHT = 56;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          borderTopWidth: 0,
          backgroundColor: "transparent",
          elevation: 0,
          height: BAR_HEIGHT + insets.bottom,
          paddingTop: 14,
          paddingBottom: insets.bottom,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={60}
            style={{
              ...({ position: "absolute" } as const),
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: "rgba(14,11,8,0.7)",
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarAccessibilityLabel: "Menu tab",
          tabBarIcon: () => null,
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Menu" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarAccessibilityLabel: "Assistant tab",
          tabBarIcon: () => null,
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Assistant" focused={focused} />
          ),
        }}
      />
      {/*
       * Cart screen is reachable via the CartFloatingBar pill on every
       * screen — no need for a dedicated tab. `href: null` keeps the route
       * registered but hides it from the bottom bar.
       */}
      <Tabs.Screen
        name="cart"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
