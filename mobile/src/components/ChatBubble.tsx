import { Text, View } from "react-native";
import type { ChatTurn } from "../state/chatStore";
import { colors } from "../theme";
import { ActionPill } from "./ActionPill";

export function ChatBubble({ turn }: { turn: ChatTurn }) {
  const isUser = turn.role === "user";
  const isError = turn.status === "error";

  return (
    <View
      style={{
        marginBottom: 14,
        alignItems: isUser ? "flex-end" : "flex-start",
      }}
    >
      {turn.text.length > 0 || !isUser ? (
        <View
          style={{
            maxWidth: "85%",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 18,
            backgroundColor: isUser ? colors.accent : colors.card,
            borderWidth: isUser ? 0 : 1,
            borderColor: colors.border,
            borderTopRightRadius: isUser ? 6 : 18,
            borderTopLeftRadius: isUser ? 18 : 6,
          }}
        >
          <Text
            selectable
            style={{
              color: isUser ? "#fff" : colors.text,
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            {turn.text || (isError ? "" : "…")}
          </Text>
        </View>
      ) : null}

      {isError && turn.errorMessage ? (
        <View
          style={{
            marginTop: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.danger,
            backgroundColor: "rgba(210,100,100,0.08)",
          }}
        >
          <Text style={{ color: colors.danger, fontSize: 12 }}>
            {turn.errorMessage}
          </Text>
        </View>
      ) : null}

      {turn.actions.length > 0 ? (
        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {turn.actions.map((a, i) => (
            <ActionPill key={i} action={a} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
