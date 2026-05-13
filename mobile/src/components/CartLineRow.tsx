import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import type { CartLine } from "../../../shared";
import { findItem } from "../../../shared";
import { colors } from "../theme";
import { unitPrice, formatPrice } from "../utils/price";
import { MENU_IMAGE_PLACEHOLDER } from "../utils/menuImages";
import { QuantityStepper } from "./QuantityStepper";
import { TrashIcon } from "./Icons";
import { useCart } from "../state/cartStore";

export function CartLineRow({ line }: { line: CartLine }) {
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeLine = useCart((s) => s.removeLine);
  const item = findItem(line.itemId);
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

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        marginBottom: 12,
        gap: 12,
      }}
    >
      <Image
        source={{ uri: item.image }}
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
              style={{ color: colors.text, fontWeight: "700", fontSize: 15, flex: 1 }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={{
                color: colors.accentSoft,
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
              style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}
              numberOfLines={1}
            >
              {modifierLabels}
            </Text>
          ) : null}
          {line.notes ? (
            <Text
              style={{
                color: colors.muted,
                fontSize: 12,
                fontStyle: "italic",
                marginTop: 2,
              }}
              numberOfLines={1}
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
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
    </View>
  );
}
