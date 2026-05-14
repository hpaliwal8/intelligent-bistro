import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useCart } from "../../src/state/cartStore";
import { useChat } from "../../src/state/chatStore";
import { CartLineRow } from "../../src/components/CartLineRow";
import { Button } from "../../src/components/Button";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { OrderSuccessOverlay } from "../../src/components/OrderSuccessOverlay";
import { cartTotal, formatPrice } from "../../src/utils/price";
import { colors, fonts } from "../../src/theme";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);

  const { subtotal, tax, total } = cartTotal(lines);
  const count = lines.reduce((n, l) => n + l.quantity, 0);

  // Order success overlay state — we snapshot the totals at order time so the
  // overlay can keep showing them after the cart is cleared on dismiss.
  const [successSnapshot, setSuccessSnapshot] = useState<{
    count: number;
    total: number;
  } | null>(null);

  const placeOrder = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSuccessSnapshot({ count, total });
  };

  const dismissSuccess = () => {
    // Fade overlay out first, then clear the cart so the line-exit animations
    // don't fight with the overlay fade. The overlay's `withTiming(0, 260)`
    // governs visual dismissal; we clear shortly after to let the lines
    // start unmounting just as the user can see them again.
    setSuccessSnapshot(null);
    setTimeout(() => {
      clear();
      // Order placed = conversational session over. Reset the chat so the
      // next interaction starts fresh. Otherwise the assistant anchors on
      // prior turns (where items WERE in the cart) and will hallucinate
      // re-adds after the user declines unrelated suggestions. The cart
      // and chat are sibling state, but checkout terminates BOTH.
      useChat.getState().reset();
    }, 220);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: insets.top + 12,
      }}
    >
      <ScreenHeader
        eyebrow="Your Order"
        title="Cart"
        subtitle={count > 0 ? `${count} item${count === 1 ? "" : "s"}` : undefined}
      />

      {lines.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
            paddingBottom: 100,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontFamily: fonts.bold,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            Your cart is empty.
          </Text>
          <Text
            style={{
              color: colors.muted,
              textAlign: "center",
              lineHeight: 20,
              fontFamily: fonts.regular,
            }}
          >
            Browse the menu, or ask the assistant for a recommendation.
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            style={{ flex: 1 }}
            data={lines}
            keyExtractor={(l) => l.lineId}
            renderItem={({ item }) => <CartLineRow line={item} />}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          />
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: tabBarHeight + 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: colors.bg,
            }}
          >
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            <Row label="Tax" value={formatPrice(tax)} variant="muted" />
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginVertical: 10,
              }}
            />
            <Row label="Total" value={formatPrice(total)} variant="total" />
            <View style={{ height: 16 }} />
            <Button
              label="Place Order"
              onPress={placeOrder}
              accessibilityHint="Submits your current order"
            />
            <View style={{ height: 10 }} />
            <Button
              label="Clear Cart"
              variant="destructive"
              onPress={clear}
              accessibilityHint="Removes all items from your cart"
            />
          </View>
        </>
      )}

      {/* Render LAST so it sits on top of header, list, AND the sticky bottom
          buttons. React Native paints sibling JSX in source order, so a
          position-absolute child won't cover later siblings on its own. */}
      <OrderSuccessOverlay
        visible={successSnapshot !== null}
        itemCount={successSnapshot?.count ?? 0}
        totalCents={successSnapshot?.total ?? 0}
        onDismiss={dismissSuccess}
      />
    </View>
  );
}

function Row({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "muted" | "total";
}) {
  const isTotal = variant === "total";
  const isMuted = variant === "muted";
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 3,
      }}
    >
      <Text
        style={{
          color: isMuted ? colors.muted : colors.text,
          fontSize: isTotal ? 16 : 14,
          fontFamily: isTotal ? fonts.bold : fonts.medium,
          fontWeight: isTotal ? "700" : "500",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: isTotal
            ? colors.accentSoft
            : isMuted
              ? colors.muted
              : colors.text,
          fontSize: isTotal ? 18 : 14,
          fontFamily: isTotal ? fonts.extrabold : fonts.semibold,
          fontWeight: isTotal ? "800" : "600",
        }}
      >
        {value}
      </Text>
    </View>
  );
}
