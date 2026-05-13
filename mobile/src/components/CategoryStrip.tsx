import { Pressable, ScrollView, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts } from "../theme";
import type { Category } from "../../../shared";

const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mains", label: "Mains" },
  { id: "sides", label: "Sides" },
  { id: "drinks", label: "Drinks" },
  { id: "desserts", label: "Desserts" },
];

interface Props {
  active: Category | "all";
  onChange: (c: Category | "all") => void;
}

export function CategoryStrip({ active, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
    >
      {CATEGORIES.map((c) => {
        const isActive = c.id === active;
        return (
          <Pressable
            key={c.id}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(c.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${c.label} category`}
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => ({
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: isActive ? colors.accent : colors.card,
              borderWidth: 1,
              borderColor: isActive ? colors.accent : colors.border,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text
              style={{
                color: isActive ? "#fff" : colors.text,
                fontFamily: isActive ? fonts.bold : fonts.medium,
                fontWeight: isActive ? "700" : "500",
                fontSize: 13,
                letterSpacing: 0.5,
              }}
            >
              {c.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
