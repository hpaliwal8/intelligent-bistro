import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../../src/state/cartStore";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  return (
    <View
      className="flex-1 bg-bistro-bg px-6"
      style={{ paddingTop: insets.top + 16 }}
    >
      <Text className="text-bistro-muted text-xs uppercase tracking-[2px]">
        Your Order
      </Text>
      <Text className="text-bistro-text text-3xl font-bold mt-1">Cart</Text>
      <Text className="text-bistro-muted mt-4">
        {count === 0 ? "Empty for now." : `${count} item(s) — UI on Day 2.`}
      </Text>
    </View>
  );
}
