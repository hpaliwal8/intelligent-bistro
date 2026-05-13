import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      className="flex-1 bg-bistro-bg"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120 }}
    >
      <View className="px-6 pb-4">
        <Text className="text-bistro-muted text-xs uppercase tracking-[2px]">
          Tonight at
        </Text>
        <Text className="text-bistro-text text-4xl font-bold mt-1">
          The Intelligent Bistro
        </Text>
        <Text className="text-bistro-muted mt-2 text-base">
          Browse the menu, or ask the assistant for recommendations.
        </Text>
      </View>
      <View className="px-6 mt-8">
        <Text className="text-bistro-text text-lg">Menu coming on Day 2.</Text>
      </View>
    </ScrollView>
  );
}
