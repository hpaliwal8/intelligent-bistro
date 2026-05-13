import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-bistro-bg px-6"
      style={{ paddingTop: insets.top + 16 }}
    >
      <Text className="text-bistro-muted text-xs uppercase tracking-[2px]">
        Assistant
      </Text>
      <Text className="text-bistro-text text-3xl font-bold mt-1">
        How can I help?
      </Text>
      <Text className="text-bistro-muted mt-4">
        Chat UI coming on Day 4.
      </Text>
    </View>
  );
}
