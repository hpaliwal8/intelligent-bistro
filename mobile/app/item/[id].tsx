import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 bg-bistro-surface px-6 pt-16">
      <Text className="text-bistro-muted text-xs uppercase tracking-[2px]">
        Item
      </Text>
      <Text className="text-bistro-text text-3xl font-bold mt-1">{id}</Text>
      <Text className="text-bistro-muted mt-4">Detail sheet on Day 2.</Text>
    </View>
  );
}
