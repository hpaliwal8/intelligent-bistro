import { Text, View } from "react-native";
import { colors } from "../theme";

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function ScreenHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 18 }}>
      <Text
        style={{
          color: colors.muted,
          fontSize: 11,
          letterSpacing: 2,
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
          fontWeight: "800",
          marginTop: 4,
          letterSpacing: -0.5,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            color: colors.muted,
            marginTop: 8,
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
