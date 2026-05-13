import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts } from "../theme";

const SUGGESTIONS = [
  "Two spicy chicken sandwiches, extra spicy",
  "Surprise me with a vegetarian main",
  "Smash burger with bacon and an iced latte",
  "What's on the menu tonight?",
];

export function SuggestedPrompts({
  onPick,
}: {
  onPick: (prompt: string) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: colors.muted,
          fontSize: 11,
          letterSpacing: 2,
          fontFamily: fonts.semibold,
          fontWeight: "600",
          textTransform: "uppercase",
          marginBottom: 2,
        }}
      >
        Try asking
      </Text>
      {SUGGESTIONS.map((s) => (
        <Pressable
          key={s}
          onPress={() => {
            void Haptics.selectionAsync();
            onPick(s);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Suggested prompt: ${s}`}
          style={({ pressed }) => ({
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 14,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              lineHeight: 20,
              fontFamily: fonts.regular,
            }}
          >
            {s}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
