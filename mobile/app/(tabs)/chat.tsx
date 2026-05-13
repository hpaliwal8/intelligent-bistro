import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { ChatBubble } from "../../src/components/ChatBubble";
import { TypingIndicator } from "../../src/components/TypingIndicator";
import { SuggestedPrompts } from "../../src/components/SuggestedPrompts";
import { useChat } from "../../src/state/chatStore";
import { colors } from "../../src/theme";

function SendIcon({ disabled }: { disabled: boolean }) {
  return (
    <Text
      style={{
        fontSize: 18,
        color: disabled ? colors.muted : "#fff",
        fontWeight: "700",
        transform: [{ rotate: "-45deg" }, { translateX: 1 }],
      }}
    >
      ➤
    </Text>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const turns = useChat((s) => s.turns);
  const inflight = useChat((s) => s.inflight);
  const send = useChat((s) => s.send);
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList>(null);

  const lastTurn = turns[turns.length - 1];
  const showTypingIndicator =
    inflight &&
    lastTurn?.role === "assistant" &&
    lastTurn.text.length === 0 &&
    lastTurn.actions.length === 0;

  useEffect(() => {
    if (turns.length > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [turns]);

  const onSend = (overrideText?: string) => {
    const text = (overrideText ?? draft).trim();
    if (!text || inflight) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft("");
    send(text);
  };

  const canSend = draft.trim().length > 0 && !inflight;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <View style={{ flex: 1, paddingTop: insets.top + 12 }}>
        <ScreenHeader
          eyebrow="Assistant"
          title="How can I help?"
          subtitle="Tell me what you're craving — I'll add it to your cart."
        />

        {turns.length === 0 ? (
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
            <SuggestedPrompts onPick={(p) => onSend(p)} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={turns}
            keyExtractor={(t) => t.id}
            renderItem={({ item }) => <ChatBubble turn={item} />}
            ListFooterComponent={
              showTypingIndicator ? (
                <View style={{ paddingTop: 4, paddingBottom: 8 }}>
                  <TypingIndicator />
                </View>
              ) : null
            }
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 8,
              paddingBottom: 16,
            }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: tabBarHeight + 8,
            backgroundColor: colors.bg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              backgroundColor: colors.card,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: colors.border,
              paddingLeft: 16,
              paddingRight: 6,
              paddingVertical: 6,
              gap: 8,
            }}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask the assistant…"
              placeholderTextColor={colors.muted}
              multiline
              accessibilityLabel="Message the assistant"
              style={{
                flex: 1,
                color: colors.text,
                fontSize: 15,
                lineHeight: 20,
                paddingTop: 8,
                paddingBottom: 8,
                maxHeight: 120,
              }}
              onSubmitEditing={() => onSend()}
              blurOnSubmit={false}
              returnKeyType="send"
            />
            <Pressable
              onPress={() => onSend()}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              accessibilityState={{ disabled: !canSend }}
              hitSlop={6}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: canSend ? colors.accent : colors.border,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <SendIcon disabled={!canSend} />
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
