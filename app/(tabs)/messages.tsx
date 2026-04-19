import React, { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type BottomSheet from "@gorhom/bottom-sheet";

import { Backdrop } from "@/components/primitives/Backdrop";
import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";
import { useMessages, usePeers } from "@/src/hooks";
import { ConversationList } from "@/components/messages/ConversationList";
import { NewConversationSheet } from "@/components/messages/NewConversationSheet";

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { threads } = useMessages();
  const { peers } = usePeers();
  const sheetRef = useRef<BottomSheet>(null);

  // Build alias lookup from peers
  const aliases: Record<string, string> = {};
  for (const peer of peers) {
    aliases[peer.id] = peer.alias;
  }

  function openNewConversation() {
    sheetRef.current?.expand();
  }

  function handleSelectPeer(peerId: string) {
    sheetRef.current?.close();
    router.push((`/messages/${peerId}`) as Parameters<typeof router.push>[0]);
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="messages" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity
          accessibilityLabel="New conversation"
          accessibilityRole="button"
          activeOpacity={0.7}
          hitSlop={8}
          onPress={openNewConversation}
          style={styles.addBtn}
        >
          <Icon name="plus" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Conversation list */}
      <View style={styles.listWrap}>
        <ConversationList
          threads={threads}
          aliases={aliases}
          onSelect={(peerId) =>
            router.push((`/messages/${peerId}`) as Parameters<typeof router.push>[0])
          }
        />
      </View>

      {/* New conversation sheet */}
      <NewConversationSheet
        ref={sheetRef}
        onSelectPeer={handleSelectPeer}
      />
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
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  addBtn: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  separator: {
    backgroundColor: theme.colors.line,
    height: StyleSheet.hairlineWidth,
    marginHorizontal: theme.spacing.lg,
  },
  listWrap: {
    flex: 1,
  },
});
