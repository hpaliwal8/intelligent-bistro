import { Fragment } from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";
import type { ChatTurn } from "../state/chatStore";
import { colors, fonts } from "../theme";
import { ActionPill } from "./ActionPill";

// Render inline Markdown emphasis. Handles **bold** and *italic*. Bold is
// matched first (more chars → wins the regex alternation), so `**foo**` is
// never accidentally parsed as italic. Content inside a marker can't contain
// asterisks or newlines, which is fine for everything the model emits.
function renderInlineMarkdown(input: string): React.ReactNode[] {
  const parts = input.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);
  return parts.map((part, i) => {
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={i} style={{ fontFamily: fonts.bold, fontWeight: "700" }}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
      return (
        <Text key={i} style={{ fontStyle: "italic" }}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function ChatBubble({ turn }: { turn: ChatTurn }) {
  const isUser = turn.role === "user";
  const isError = turn.status === "error";

  // Skip rendering an empty assistant bubble — the chat screen's
  // TypingIndicator handles that state. We still render error rows below
  // even when text is empty, so they're not gated on text length.
  const showBubble = turn.text.length > 0 || isUser;

  return (
    <Animated.View
      entering={FadeInDown.duration(240).springify().damping(15)}
      layout={LinearTransition.springify().damping(18).stiffness(200)}
      style={{
        marginBottom: 14,
        alignItems: isUser ? "flex-end" : "flex-start",
      }}
    >
      {showBubble ? (
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
            accessibilityLiveRegion={
              !isUser && turn.status === "streaming" ? "polite" : "none"
            }
            style={{
              color: isUser ? "#fff" : colors.text,
              fontSize: 15,
              lineHeight: 22,
              fontFamily: fonts.regular,
            }}
          >
            {isUser ? turn.text : renderInlineMarkdown(turn.text)}
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
    </Animated.View>
  );
}
