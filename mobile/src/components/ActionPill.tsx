import { Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import type { CartAction } from "../../../shared";
import { findItem } from "../../../shared";
import { colors, fonts } from "../theme";
import { PlusIcon, MinusIcon, TrashIcon, CheckIcon } from "./Icons";

function labelFor(action: CartAction): { icon: React.ReactNode; text: string } {
  switch (action.type) {
    case "add_item": {
      const item = findItem(action.itemId);
      const name = item?.name ?? action.itemId;
      return {
        icon: <PlusIcon size={12} color={colors.success} />,
        text: `Added ${action.quantity > 1 ? `${action.quantity}× ` : ""}${name}`,
      };
    }
    case "update_quantity":
      return {
        icon: <CheckIcon size={12} color={colors.accentSoft} />,
        text: `Updated quantity to ${action.quantity}`,
      };
    case "update_line":
      return {
        icon: <CheckIcon size={12} color={colors.accentSoft} />,
        text: `Updated item`,
      };
    case "remove_line":
      return {
        icon: <MinusIcon size={12} color={colors.danger} />,
        text: "Removed item",
      };
    case "clear_cart":
      return {
        icon: <TrashIcon size={12} color={colors.danger} />,
        text: "Cleared cart",
      };
  }
}

export function ActionPill({ action }: { action: CartAction }) {
  const { icon, text } = labelFor(action);
  return (
    <Animated.View
      entering={FadeIn.duration(220).springify().damping(14)}
      accessibilityLabel={text}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        alignSelf: "flex-start",
      }}
    >
      {icon}
      <Text
        style={{
          color: colors.text,
          fontSize: 12,
          fontFamily: fonts.semibold,
          fontWeight: "600",
        }}
      >
        {text}
      </Text>
    </Animated.View>
  );
}
