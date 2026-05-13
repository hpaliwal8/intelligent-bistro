import { useRef, useState } from "react";
import {
  Alert,
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
import { SendIcon } from "../../src/components/Icons";
import { useChat } from "../../src/state/chatStore";
import { colors, fonts } from "../../src/theme";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const turns = useChat((s) => s.turns);
  const inflight = useChat((s) => s.inflight);
  const send = useChat((s) => s.send);
  const reset = useChat((s) => s.reset);
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList>(null);

  const onClear = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Clear conversation?",
      "This removes the chat history. Your cart is not affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => reset(),
        },
      ]
    );
  };

  const lastTurn = turns[turns.length - 1];
  const showTypingIndicator =
    inflight &&
    lastTurn?.role === "assistant" &&
    lastTurn.text.length === 0 &&
    lastTurn.actions.length === 0;

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
          rightSlot={
            turns.length > 0 ? (
              <Pressable
                onPress={onClear}
                accessibilityRole="button"
                accessibilityLabel="Clear conversation"
                hitSlop={10}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text
                  style={{
                    color: colors.muted,
                    fontSize: 11,
                    fontFamily: fonts.bold,
                    fontWeight: "700",
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                  }}
                >
                  Clear
                </Text>
              </Pressable>
            ) : null
          }
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
                fontFamily: fonts.regular,
              }}
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
              <SendIcon size={18} color={canSend ? "#fff" : colors.muted} />
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
