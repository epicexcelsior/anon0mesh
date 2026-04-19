import React from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Backdrop } from "@/components/primitives/Backdrop";
import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";
import { useConversation, usePeers } from "@/src/hooks";
import type { Message } from "@/src/domain/entities/Message";
import { MessageBubble } from "@/components/messages/MessageBubble";
import { ComposerBar } from "@/components/messages/ComposerBar";

export default function ConversationScreen() {
  const { peerId } = useLocalSearchParams<{ peerId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { messages, sending, send } = useConversation(peerId);
  const { peers } = usePeers();

  const peer = peers.find((p) => p.id === peerId);
  const displayName = peer?.alias ?? peerId;

  // Newest at bottom — use inverted FlatList with reversed data
  const reversed = [...messages].reverse();

  return (
    <View style={styles.root}>
      <Backdrop preset="messages" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={8}
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerAlias} numberOfLines={1}>
            {displayName}
          </Text>
          <Icon name="lock" size={12} color={theme.colors.textMuted} />
        </View>

        {/* Spacer to balance header */}
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.separator} />

      {/* Messages + composer */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.body}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={reversed}
          inverted
          keyExtractor={(item: Message) => item.id}
          renderItem={({ item }: { item: Message }) => (
            <MessageBubble message={item} />
          )}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: theme.spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Icon name="lock-mesh" size={28} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>
                Messages are end-to-end encrypted
              </Text>
            </View>
          }
        />

        <ComposerBar onSend={send} sending={sending} />
        <View style={{ height: insets.bottom }} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  backBtn: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    justifyContent: "center",
  },
  headerAlias: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.body,
    maxWidth: "80%",
  },
  headerSpacer: {
    width: 36,
  },
  separator: {
    backgroundColor: theme.colors.line,
    height: StyleSheet.hairlineWidth,
  },
  body: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    paddingTop: theme.spacing.md,
  },
  emptyMessages: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xxxl,
    paddingVertical: theme.spacing.huge,
    transform: [{ scaleY: -1 }],
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    textAlign: "center",
  },
});
