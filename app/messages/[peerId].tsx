import React from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ThreadHeaderCard } from "@/components/messages/ThreadHeaderCard";
import { Backdrop } from "@/components/primitives/Backdrop";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { IconButton } from "@/components/primitives/IconButton";
import { Pill } from "@/components/primitives/Pill";
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
      <Backdrop animated preset="messages" />

      <View style={[styles.content, { paddingTop: insets.top + theme.spacing.sm }]}>
        <View style={styles.header}>
          <IconButton
            accessibilityLabel="Back"
            name="arrow-left"
            onPress={() => router.back()}
            size="md"
            tone="neutral"
            variant="contained"
          />

          <Pill label="Thread" tone="neutral" />
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>Secure thread</Text>
          <Text numberOfLines={1} style={styles.title}>
            {displayName}
          </Text>
          <Text style={styles.subtitle}>
            Conversation chrome is rebuilt, but message delivery in this branch is still
            fixture-backed while the LXMF runtime lands.
          </Text>
        </View>

        <ThreadHeaderCard peer={peer} title={displayName} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent messages</Text>
          <Text style={styles.sectionMeta}>
            New sends queue locally first, then settle through the current fixture adapter.
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.body}
          keyboardVerticalOffset={Platform.OS === "ios" ? theme.spacing.lg : 0}
        >
          <FlatList
            data={reversed}
            inverted
            keyExtractor={(item: Message) => item.id}
            renderItem={({ item }: { item: Message }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <GlassSurface style={styles.emptyMessages} variant="strong">
                <Icon name="lock-mesh" size={28} color={theme.colors.textMuted} />
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptyText}>
                  Start the thread here. The message shell is real; runtime delivery is still
                  fixture-backed in this recovery build.
                </Text>
              </GlassSurface>
            }
          />

          <ComposerBar onSend={send} sending={sending} />
          <View style={{ height: insets.bottom }} />
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
  },
  intro: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.display,
    fontSize: theme.type.title,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.55,
  },
  sectionHeader: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  sectionMeta: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.55,
  },
  body: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  emptyMessages: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: "center",
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxxl,
    paddingVertical: theme.spacing.huge,
    transform: [{ scaleY: -1 }],
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
    textAlign: "center",
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
    textAlign: "center",
  },
});
