import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Backdrop } from "@/components/primitives/Backdrop";
import { Icon } from "@/components/primitives/Icon";
import { PeerDetail } from "@/components/mesh/PeerDetail";
import { usePeers } from "@/src/hooks/usePeers";
import { appTheme as theme } from "@/src/design-system/theme";

export default function PeerDetailScreen() {
  const router = useRouter();
  const { peerId } = useLocalSearchParams<{ peerId: string }>();
  const { peers } = usePeers();

  const peer = peers.find((p) => p.id === peerId);

  return (
    <View style={styles.root}>
      <Backdrop preset="settings" />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Icon name="arrow-left" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {peer?.alias ?? "Peer"}
          </Text>

          {/* Spacer to balance layout */}
          <View style={styles.backBtn} />
        </View>

        {/* Content */}
        {peer ? (
          <PeerDetail peer={peer} />
        ) : (
          <View style={styles.notFound}>
            <Icon name="user-x" size={32} color={theme.colors.textMuted} />
            <Text style={styles.notFoundText}>Peer not found</Text>
            <Text style={styles.notFoundSub}>
              This peer may have gone out of range.
            </Text>
          </View>
        )}
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
    gap: theme.spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
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
  headerTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
    textAlign: "center",
  },
  notFound: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xxxl,
  },
  notFoundText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  notFoundSub: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    textAlign: "center",
  },
});
