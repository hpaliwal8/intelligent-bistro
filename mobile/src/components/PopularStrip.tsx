import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import type { MenuItem } from "../../../shared";
import { MENU } from "../../../shared";
import { colors, fonts } from "../theme";
import { formatPrice } from "../utils/price";
import { MENU_IMAGE_PLACEHOLDER, menuImageSource } from "../utils/menuImages";

const POPULAR: MenuItem[] = MENU.filter((m) => m.tags.includes("popular"));

function HeroCard({ item }: { item: MenuItem }) {
  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        router.push(`/item/${item.id}`);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${formatPrice(item.basePrice)}`}
      style={({ pressed }) => ({
        width: 240,
        height: 280,
        marginRight: 14,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <Image
        source={menuImageSource(item.id, item.image)}
        placeholder={{ blurhash: MENU_IMAGE_PLACEHOLDER }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={["transparent", "rgba(14,11,8,0.95)"]}
        locations={[0.35, 1]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "70%",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: "rgba(14,11,8,0.75)",
          borderWidth: 1,
          borderColor: "rgba(245,239,230,0.15)",
        }}
      >
        <Text
          style={{
            color: colors.accentSoft,
            fontSize: 9,
            letterSpacing: 1.4,
            fontFamily: fonts.bold,
            fontWeight: "700",
            textTransform: "uppercase",
          }}
        >
          Chef's pick
        </Text>
      </View>
      <View
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontFamily: fonts.extrabold,
            fontWeight: "800",
            letterSpacing: -0.3,
          }}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text
          style={{
            color: colors.accentSoft,
            marginTop: 4,
            fontSize: 14,
            fontFamily: fonts.bold,
            fontWeight: "700",
          }}
        >
          {formatPrice(item.basePrice)}
        </Text>
      </View>
    </Pressable>
  );
}

export function PopularStrip() {
  if (POPULAR.length === 0) return null;
  return (
    <View style={{ marginBottom: 22 }}>
      <Text
        style={{
          color: colors.muted,
          fontSize: 11,
          letterSpacing: 2,
          fontFamily: fonts.semibold,
          fontWeight: "600",
          textTransform: "uppercase",
          paddingHorizontal: 24,
          marginBottom: 12,
        }}
      >
        Tonight's picks
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        decelerationRate="fast"
        snapToInterval={254}
      >
        {POPULAR.map((item) => (
          <HeroCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}
