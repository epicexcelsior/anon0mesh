import React, { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type BottomSheet from "@gorhom/bottom-sheet";

import { Backdrop } from "@/components/primitives/Backdrop";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { IconButton } from "@/components/primitives/IconButton";
import { Pill } from "@/components/primitives/Pill";
import { appTheme as theme } from "@/src/design-system/theme";
import { useMessages, usePeers } from "@/src/hooks";
import { ConversationList } from "@/components/messages/ConversationList";
import { NewConversationSheet } from "@/components/messages/NewConversationSheet";

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { threads, loading } = useMessages();
  const { peers } = usePeers();
  const sheetRef = useRef<BottomSheet>(null);

  const peerMap: Record<string, (typeof peers)[number]> = {};
  for (const peer of peers) {
    peerMap[peer.id] = peer;
  }

  const livePeers = peers.filter((peer) => Date.now() - peer.lastSeen < 5 * 60 * 1000).length;
  const trustedPeers = peers.filter((peer) => peer.isTrusted).length;

  function openNewConversation() {
    sheetRef.current?.expand();
  }

  function handleSelectPeer(peerId: string) {
    sheetRef.current?.close();
    router.push((`/messages/${peerId}`) as Parameters<typeof router.push>[0]);
  }

  return (
    <View style={styles.root}>
      <Backdrop animated preset="messages" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <Text style={styles.title}>Messages</Text>
        <IconButton
          accessibilityLabel="New conversation"
          name="plus"
          onPress={openNewConversation}
          size="md"
          tone="neutral"
          variant="contained"
        />
      </View>

      <GlassSurface style={styles.hero} variant="strong">
<View style={styles.heroTop}>
          <View style={styles.heroIconWrap}>
            <Icon color={theme.colors.cyan} name="lock-mesh" size={20} />
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Private mesh inbox</Text>
            <Text style={styles.heroTitle}>Secure threads.</Text>
            <Text style={styles.heroBody}>
              Peer discovery is live. Delivery stays fixture-backed until LXMF lands.
            </Text>
          </View>
        </View>

        <View style={styles.heroPills}>
          <Pill label={`${threads.length} threads`} tone="cyan" />
          <Pill label={`${livePeers} peers live`} tone="neutral" />
          <Pill label={`${trustedPeers} trusted`} tone="green" />
        </View>
      </GlassSurface>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active threads</Text>
        <Text style={styles.sectionMeta}>
          New conversations come from the live peer graph.
        </Text>
      </View>

      <View style={styles.listWrap}>
        <ConversationList
          threads={threads}
          loading={loading}
          peers={peerMap}
          onSelect={(peerId) =>
            router.push((`/messages/${peerId}`) as Parameters<typeof router.push>[0])
          }
        />
      </View>

      <NewConversationSheet ref={sheetRef} onSelectPeer={handleSelectPeer} />
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
    paddingBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.display,
    fontSize: theme.type.title,
    letterSpacing: -0.7,
  },
  hero: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  heroTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  heroIconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.pill,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  heroEyebrow: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.bodyLg,
  },
  heroBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.55,
  },
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  sectionHeader: {
    gap: theme.spacing.xs,
    marginHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
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
    lineHeight: theme.type.caption * 1.4,
  },
  listWrap: {
    flex: 1,
  },
});
