import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { colors } from "../../src/theme";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 12 }}
    >
      <ScreenHeader
        eyebrow="Assistant"
        title="How can I help?"
        subtitle="Tell me what you're craving — I'll add it to your cart."
      />
      <View style={{ paddingHorizontal: 24 }}>
        <Text style={{ color: colors.muted, fontSize: 13 }}>
          Chat UI coming on Day 4.
        </Text>
      </View>
    </View>
  );
}
