import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { PeerDetail } from "@/components/mesh/PeerDetail";
import { DepthButton } from "@/components/primitives/DepthButton";
import { Backdrop } from "@/components/primitives/Backdrop";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { appTheme as theme } from "@/src/design-system/theme";
import { usePeers } from "@/src/hooks/usePeers";

export default function PeerDetailScreen() {
  const router = useRouter();
  const { peerId } = useLocalSearchParams<{ peerId: string }>();
  const { peers, trust, block } = usePeers();

  const peer = peers.find((p) => p.id === peerId);

  return (
    <View style={styles.root}>
      <Backdrop animated preset="peers" />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Back"
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Icon name="arrow-left" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <Pill label="Peer" tone="neutral" />
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>Mesh peer detail</Text>
          <Text numberOfLines={1} style={styles.title}>
            {peer?.alias ?? "Peer"}
          </Text>
          <Text style={styles.subtitle}>
            This view stays honest to the current runtime: trust, signal, and discovery are live;
            relay and beacon detail remain explicitly staged.
          </Text>
        </View>

        {peer ? (
          <PeerDetail
            peer={peer}
            onTrust={() => trust(peer.id)}
            onBlock={async () => {
              await block(peer.id);
              router.back();
            }}
          />
        ) : (
          <GlassSurface style={styles.notFound} variant="strong">
            <Icon name="user-x" size={32} color={theme.colors.textMuted} />
            <Text style={styles.notFoundText}>Peer not found</Text>
            <Text style={styles.notFoundSub}>
              This peer may have gone out of range or been blocked from the current graph.
            </Text>
            <DepthButton
              icon={<Icon name="arrow-left" size={16} color={theme.colors.textPrimary} />}
              label="Return to peer graph"
              onPress={() => router.back()}
              size="md"
              tone="cyan"
              variant="secondary"
            />
          </GlassSurface>
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
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },
  backBtn: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
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
  notFound: {
    alignItems: "center",
    gap: theme.spacing.md,
    justifyContent: "center",
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xxxl,
    paddingVertical: theme.spacing.xxxl,
  },
  notFoundText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
  },
  notFoundSub: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.55,
    textAlign: "center",
  },
});
