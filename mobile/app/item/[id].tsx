import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  findItem,
  type ModifierGroup,
  type SelectedModifier,
} from "../../../shared";
import { colors, fonts } from "../../src/theme";
import { unitPrice, formatPrice } from "../../src/utils/price";
import { MENU_IMAGE_PLACEHOLDER, menuImageSource } from "../../src/utils/menuImages";
import { Button } from "../../src/components/Button";
import { QuantityStepper } from "../../src/components/QuantityStepper";
import { CloseIcon, CheckIcon } from "../../src/components/Icons";
import { useCart } from "../../src/state/cartStore";

export default function ItemDetail() {
  const { id, lineId } = useLocalSearchParams<{ id: string; lineId?: string }>();
  const insets = useSafeAreaInsets();
  const item = useMemo(() => (id ? findItem(id) : undefined), [id]);
  const addItem = useCart((s) => s.addItem);
  const updateLine = useCart((s) => s.updateLine);
  // The existing line we're editing, if `lineId` was passed in the route.
  const editingLine = useCart((s) =>
    lineId ? s.lines.find((l) => l.lineId === lineId) ?? null : null
  );
  const isEditing = editingLine !== null;

  const [quantity, setQuantity] = useState(() => editingLine?.quantity ?? 1);
  const [notes, setNotes] = useState(() => editingLine?.notes ?? "");
  const [selections, setSelections] = useState<SelectedModifier[]>(() => {
    if (editingLine) return editingLine.modifiers;
    if (!item) return [];
    return item.modifiers.flatMap((g) => {
      if (!g.required || g.multi) return [];
      const first = g.options[0];
      return first ? [{ groupId: g.id, optionId: first.id }] : [];
    });
  });

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, padding: 24 }}>
        <Text style={{ color: colors.text }}>Item not found.</Text>
      </View>
    );
  }

  const isSelected = (groupId: string, optionId: string) =>
    selections.some((s) => s.groupId === groupId && s.optionId === optionId);

  const toggle = (group: ModifierGroup, optionId: string) => {
    Haptics.selectionAsync();
    setSelections((prev) => {
      const others = prev.filter((s) => s.groupId !== group.id);
      if (group.multi) {
        const wasSelected = prev.some(
          (s) => s.groupId === group.id && s.optionId === optionId
        );
        if (wasSelected) {
          return prev.filter(
            (s) => !(s.groupId === group.id && s.optionId === optionId)
          );
        }
        return [...prev, { groupId: group.id, optionId }];
      }
      return [...others, { groupId: group.id, optionId }];
    });
  };

  const requiredOk = item.modifiers
    .filter((g) => g.required)
    .every((g) => selections.some((s) => s.groupId === g.id));

  const unit = unitPrice(item, selections);
  const total = unit * quantity;

  const onSubmit = () => {
    if (!requiredOk) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const trimmedNotes = notes.trim() || undefined;
    if (isEditing && editingLine) {
      updateLine(editingLine.lineId, {
        modifiers: selections,
        quantity,
        notes: trimmedNotes,
      });
    } else {
      addItem(item.id, quantity, selections, trimmedNotes);
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={menuImageSource(item.id, item.image)}
            placeholder={{ blurhash: MENU_IMAGE_PLACEHOLDER }}
            style={{
              width: "100%",
              height: 280,
              backgroundColor: colors.card,
            }}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={["rgba(26,22,18,0.7)", "transparent"]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 110,
            }}
          />
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close item details"
            hitSlop={12}
            style={({ pressed }) => ({
              position: "absolute",
              // iOS modal sheets already present below the safe area, so we use
              // a small fixed offset from the modal top rather than the screen
              // safe-area inset (which would push the button down into the image).
              top: 14,
              right: 14,
              width: 36,
              height: 36,
              borderRadius: 999,
              backgroundColor: "rgba(14,11,8,0.7)",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <CloseIcon size={18} />
          </Pressable>
        </View>

        <View style={{ padding: 24 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 26,
              fontFamily: fonts.extrabold,
              fontWeight: "800",
              letterSpacing: -0.4,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              color: colors.muted,
              marginTop: 8,
              fontSize: 14,
              lineHeight: 21,
              fontFamily: fonts.regular,
            }}
          >
            {item.description}
          </Text>
          <Text
            style={{
              color: colors.accentSoft,
              marginTop: 14,
              fontSize: 18,
              fontFamily: fonts.extrabold,
              fontWeight: "800",
            }}
          >
            {formatPrice(item.basePrice)}
          </Text>

          {item.modifiers.map((group) => (
            <View key={group.id} style={{ marginTop: 28 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontFamily: fonts.bold,
                    fontWeight: "700",
                    fontSize: 15,
                  }}
                >
                  {group.label}
                </Text>
                <Text
                  style={{
                    color: colors.muted,
                    fontSize: 11,
                    fontFamily: fonts.medium,
                  }}
                >
                  {group.required ? "Required" : "Optional"}
                  {group.multi ? " • Pick any" : ""}
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                {group.options.map((opt) => {
                  const selected = isSelected(group.id, opt.id);
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => toggle(group, opt.id)}
                      accessibilityRole={group.multi ? "checkbox" : "radio"}
                      accessibilityLabel={`${opt.label}${opt.priceDelta !== 0 ? `, plus ${formatPrice(opt.priceDelta)}` : ""}`}
                      accessibilityState={{ selected, checked: selected }}
                      style={({ pressed }) => ({
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor: selected ? colors.card : colors.surface,
                        borderWidth: 1,
                        borderColor: selected ? colors.accent : colors.border,
                        opacity: pressed ? 0.85 : 1,
                      })}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: group.multi ? 5 : 999,
                            borderWidth: 1.5,
                            borderColor: selected ? colors.accent : colors.border,
                            backgroundColor: selected ? colors.accent : "transparent",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {selected ? <CheckIcon size={12} /> : null}
                        </View>
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: 14,
                            fontFamily: selected ? fonts.bold : fonts.medium,
                            fontWeight: selected ? "700" : "500",
                          }}
                        >
                          {opt.label}
                        </Text>
                      </View>
                      {opt.priceDelta !== 0 ? (
                        <Text
                          style={{
                            color: colors.muted,
                            fontSize: 13,
                            fontFamily: fonts.semibold,
                            fontWeight: "600",
                          }}
                        >
                          +{formatPrice(opt.priceDelta)}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Notes field — fills the space when an item has few/no modifiers
              and gives the user a way to attach special instructions. */}
          <View style={{ marginTop: 28 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontFamily: fonts.bold,
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                Special instructions
              </Text>
              <Text
                style={{
                  color: colors.muted,
                  fontSize: 11,
                  fontFamily: fonts.medium,
                }}
              >
                Optional
              </Text>
            </View>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. extra crispy, no onions, allergic to nuts…"
              placeholderTextColor={colors.muted}
              multiline
              maxLength={200}
              accessibilityLabel="Special instructions for this item"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: colors.text,
                fontSize: 14,
                lineHeight: 20,
                fontFamily: fonts.regular,
                minHeight: 72,
                textAlignVertical: "top",
              }}
            />
            {notes.length > 0 ? (
              <Text
                style={{
                  color: colors.muted,
                  fontSize: 11,
                  marginTop: 6,
                  fontFamily: fonts.regular,
                  textAlign: "right",
                }}
              >
                {notes.length}/200
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <View style={{ flex: 1 }}>
          <Button
            label={`${isEditing ? "Save" : "Add"} • ${formatPrice(total)}`}
            onPress={onSubmit}
            disabled={!requiredOk}
          />
        </View>
      </View>
    </View>
  );
}
