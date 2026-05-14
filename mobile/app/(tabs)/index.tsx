import { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { MENU } from "../../../shared";
import type { Category, MenuItem } from "../../../shared";
import { MenuCard } from "../../src/components/MenuCard";
import { CategoryStrip } from "../../src/components/CategoryStrip";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { PopularStrip } from "../../src/components/PopularStrip";
import { CartFloatingBar } from "../../src/components/CartFloatingBar";
import { colors } from "../../src/theme";

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [active, setActive] = useState<Category | "all">("all");

  const items = useMemo<MenuItem[]>(() => {
    if (active === "all") return MENU;
    return MENU.filter((m) => m.category === active);
  }, [active]);

  return (
    <>
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => <MenuCard item={item} />}
      ListHeaderComponent={
        <View style={{ paddingTop: insets.top + 12 }}>
          <ScreenHeader
            eyebrow="Tonight at"
            title="The Intelligent Bistro"
            subtitle="Browse the menu, or ask the assistant for recommendations."
          />
          {active === "all" ? <PopularStrip /> : null}
          <View style={{ paddingBottom: 18 }}>
            <CategoryStrip active={active} onChange={setActive} />
          </View>
        </View>
      }
      ListEmptyComponent={
        <Text
          style={{ color: colors.muted, textAlign: "center", marginTop: 40 }}
        >
          Nothing here yet.
        </Text>
      }
      contentContainerStyle={{
        paddingBottom: tabBarHeight + 72,
        backgroundColor: colors.bg,
      }}
      style={{ backgroundColor: colors.bg }}
      showsVerticalScrollIndicator={false}
    />
    <CartFloatingBar />
    </>
  );
}
