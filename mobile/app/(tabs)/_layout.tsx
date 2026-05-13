import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../../src/state/cartStore";
import { colors } from "../../src/theme";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        color: focused ? colors.accent : colors.muted,
        fontSize: 11,
        letterSpacing: 1.2,
        fontWeight: focused ? "700" : "500",
        textTransform: "uppercase",
      }}
    >
      {label}
    </Text>
  );
}

function CartBadge() {
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  if (count === 0) return null;
  return (
    <View
      accessibilityLabel={`${count} items in cart`}
      style={{
        position: "absolute",
        top: -4,
        right: -14,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.accent,
        paddingHorizontal: 5,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
        {count}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  // Bar visual height is constant; we add bottom inset as padding so the
  // home indicator never crowds the touch targets.
  const BAR_HEIGHT = 64;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          borderTopWidth: 0,
          backgroundColor: "transparent",
          elevation: 0,
          height: BAR_HEIGHT + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom,
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
          tabBarIcon: ({ focused }) => <TabIcon label="Menu" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarAccessibilityLabel: "Assistant tab",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Assistant" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarAccessibilityLabel: "Cart tab",
          tabBarIcon: ({ focused }) => (
            <View>
              <TabIcon label="Cart" focused={focused} />
              <CartBadge />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
