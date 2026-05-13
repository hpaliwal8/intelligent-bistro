import { Text, View } from "react-native";
import { colors, fonts } from "../theme";

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

export function ScreenHeader({ eyebrow, title, subtitle, rightSlot }: Props) {
  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 18 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.muted,
              fontSize: 11,
              letterSpacing: 2,
              fontFamily: fonts.semibold,
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 34,
              fontFamily: fonts.extrabold,
              fontWeight: "800",
              marginTop: 4,
              letterSpacing: -0.5,
            }}
          >
            {title}
          </Text>
        </View>
        {rightSlot ? <View style={{ paddingTop: 12 }}>{rightSlot}</View> : null}
      </View>
      {subtitle ? (
        <Text
          style={{
            color: colors.muted,
            marginTop: 8,
            fontSize: 14,
            lineHeight: 20,
            fontFamily: fonts.regular,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
