import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { PlusIcon, MinusIcon } from "./Icons";
import { colors } from "../theme";

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  label,
}: Props) {
  const dim = size === "sm" ? 28 : 36;
  const fontSize = size === "sm" ? 14 : 16;
  const iconSize = size === "sm" ? 14 : 18;
  return (
    <View
      accessible={false}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 4,
      }}
    >
      <Pressable
        onPress={() => {
          if (value > min) {
            Haptics.selectionAsync();
            onChange(value - 1);
          }
        }}
        accessibilityRole="button"
        accessibilityLabel={`Decrease${label ? ` ${label}` : ""} quantity`}
        accessibilityState={{ disabled: value <= min }}
        hitSlop={6}
        style={({ pressed }) => ({
          width: dim,
          height: dim,
          alignItems: "center",
          justifyContent: "center",
          opacity: value <= min ? 0.35 : pressed ? 0.6 : 1,
        })}
      >
        <MinusIcon size={iconSize} />
      </Pressable>
      <Text
        accessibilityLiveRegion="polite"
        style={{
          color: colors.text,
          fontSize,
          fontWeight: "700",
          minWidth: 22,
          textAlign: "center",
        }}
      >
        {value}
      </Text>
      <Pressable
        onPress={() => {
          if (value < max) {
            Haptics.selectionAsync();
            onChange(value + 1);
          }
        }}
        accessibilityRole="button"
        accessibilityLabel={`Increase${label ? ` ${label}` : ""} quantity`}
        accessibilityState={{ disabled: value >= max }}
        hitSlop={6}
        style={({ pressed }) => ({
          width: dim,
          height: dim,
          alignItems: "center",
          justifyContent: "center",
          opacity: value >= max ? 0.35 : pressed ? 0.6 : 1,
        })}
      >
        <PlusIcon size={iconSize} />
      </Pressable>
    </View>
  );
}
