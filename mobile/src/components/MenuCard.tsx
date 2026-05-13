import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import type { MenuItem } from "../../../shared";
import { colors, fonts } from "../theme";
import { formatPrice } from "../utils/price";
import { MENU_IMAGE_PLACEHOLDER, menuImageSource } from "../utils/menuImages";

export function MenuCard({ item }: { item: MenuItem }) {
  const onPress = () => {
    Haptics.selectionAsync();
    router.push(`/item/${item.id}`);
  };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${formatPrice(item.basePrice)}`}
      accessibilityHint={item.description}
      style={({ pressed }) => ({
        marginHorizontal: 24,
        marginBottom: 18,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={menuImageSource(item.id, item.image)}
          placeholder={{ blurhash: MENU_IMAGE_PLACEHOLDER }}
          style={{ width: "100%", height: 180, backgroundColor: colors.surface }}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
          accessibilityIgnoresInvertColors
        />
        <LinearGradient
          colors={["transparent", "rgba(14,11,8,0.85)"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 90,
          }}
        />
        {item.tags.length > 0 && (
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              flexDirection: "row",
              gap: 6,
            }}
          >
            {item.tags.slice(0, 2).map((tag) => (
              <View
                key={tag}
                style={{
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
                    color: tag === "spicy" ? colors.accentSoft : colors.text,
                    fontSize: 10,
                    letterSpacing: 1,
                    fontFamily: fonts.bold,
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={{ padding: 18, paddingTop: 14 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontFamily: fonts.bold,
              fontWeight: "700",
              flex: 1,
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={{
              color: colors.accentSoft,
              fontSize: 16,
              fontFamily: fonts.bold,
              fontWeight: "700",
            }}
          >
            {formatPrice(item.basePrice)}
          </Text>
        </View>
        <Text
          style={{
            color: colors.muted,
            fontSize: 13,
            marginTop: 4,
            lineHeight: 19,
            fontFamily: fonts.regular,
          }}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>
    </Pressable>
  );
}
