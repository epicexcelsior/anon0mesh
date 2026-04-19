import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Backdrop } from "@/components/primitives/Backdrop";
import { Icon } from "@/components/primitives/Icon";
import { SignalBars } from "@/components/primitives/SignalBars";
import { PeersList } from "@/components/mesh/PeersList";
import { useMesh } from "@/src/hooks/useMesh";
import { usePeers } from "@/src/hooks/usePeers";
import { appTheme as theme } from "@/src/design-system/theme";

export default function PeersScreen() {
  const router = useRouter();
  const { peers, loading } = usePeers();
  const { bleError } = useMesh();

  const firstPeer = peers[0];
  const signalStrength = firstPeer ? firstPeer.signalStrength : (0 as const);
  const nodeCount = peers.length;

  return (
    <View style={styles.root}>
      <Backdrop preset="settings" />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Header row */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Peers</Text>
          <TouchableOpacity
            accessibilityLabel="Close"
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <Icon name="x" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Summary bar */}
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
          </Text>
          <View style={styles.summaryDot} />
          <Text style={styles.summaryText}>BLE</Text>
          <View style={styles.summaryDot} />
          <SignalBars strength={signalStrength} size={14} />
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Peers list */}
        <View style={styles.listWrap}>
          <PeersList
            peers={peers}
            loading={loading}
            error={bleError}
            onPressPeer={(id) => router.push((`/peers/${id}`) as Parameters<typeof router.push>[0])}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  closeBtn: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  summaryBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  summaryText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.micro,
    letterSpacing: 0.4,
  },
  summaryDot: {
    backgroundColor: theme.colors.textMuted,
    borderRadius: theme.radius.pill,
    height: 3,
    width: 3,
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
