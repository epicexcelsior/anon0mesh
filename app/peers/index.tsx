import React from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { PeersList } from "@/components/mesh/PeersList";
import { DepthButton } from "@/components/primitives/DepthButton";
import { Backdrop } from "@/components/primitives/Backdrop";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { IconButton } from "@/components/primitives/IconButton";
import { Pill } from "@/components/primitives/Pill";
import type { PillTone } from "@/components/primitives/Pill";
import { SignalBars } from "@/components/primitives/SignalBars";
import { appTheme as theme } from "@/src/design-system/theme";
import { useMesh } from "@/src/hooks/useMesh";
import { usePeers } from "@/src/hooks/usePeers";

function stateTone(
  state: "Live" | "Silent" | "Offline",
  bleError?: string | null,
): PillTone {
  if (bleError) return "red";
  switch (state) {
    case "Live":
      return "green";
    case "Silent":
      return "amber";
    case "Offline":
      return "neutral";
  }
}

export default function PeersScreen() {
  const router = useRouter();
  const { peers, loading } = usePeers();
  const {
    bleError,
    connectionState,
    enabled,
    iface,
    refresh,
    scanning,
    setEnabled,
  } = useMesh();

  const orderedPeers = [...peers].sort((left, right) => {
    if (left.isTrusted !== right.isTrusted) {
      return Number(right.isTrusted) - Number(left.isTrusted);
    }
    if (left.signalStrength !== right.signalStrength) {
      return right.signalStrength - left.signalStrength;
    }
    return right.lastSeen - left.lastSeen;
  });

  const firstPeer = orderedPeers[0];
  const signalStrength = firstPeer ? firstPeer.signalStrength : (0 as const);
  const nodeCount = orderedPeers.length;
  const trustedCount = orderedPeers.filter((peer) => peer.isTrusted).length;
  const activeCount = orderedPeers.filter(
    (peer) => Date.now() - peer.lastSeen < 5 * 60 * 1000,
  ).length;

  const refreshAction = {
    disabled: loading,
    icon: <Icon name="refresh-cw" size={16} color={theme.colors.textPrimary} />,
    label: scanning ? "Scanning" : "Refresh scan",
    onPress: refresh,
    tone: "cyan" as const,
    variant: "secondary" as const,
  };
  const enableAction = {
    icon: <Icon name="bluetooth" size={16} color={theme.colors.textOnAccent} />,
    label: "Enable BLE",
    onPress: () => setEnabled(true),
    tone: "cyan" as const,
    variant: "primary" as const,
  };
  const settingsAction = {
    icon: <Icon name="settings" size={16} color={theme.colors.textPrimary} />,
    label: "Open settings",
    onPress: () => {
      void Linking.openSettings();
    },
    tone: "cyan" as const,
    variant: "secondary" as const,
  };

  return (
    <View style={styles.root}>
      <Backdrop animated preset="peers" />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.header}>
          <Pill
            label={bleError ? "BLE error" : connectionState}
            tone={stateTone(connectionState, bleError)}
          />
          <IconButton
            accessibilityLabel="Close"
            name="x"
            onPress={() => router.back()}
            size="md"
            tone="neutral"
            variant="contained"
          />
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>Mesh peer graph</Text>
          <Text style={styles.title}>Nearby nodes, truthful runtime.</Text>
          <Text style={styles.subtitle}>
            Peer discovery is live on this branch. The rebuilt sheet focuses on trust, signal,
            and direct-route context while deeper relay metrics land later.
          </Text>
        </View>

        <GlassSurface style={styles.hero} variant="strong">
          <View style={styles.heroTraceRow}>
            <View style={styles.heroTraceDot} />
            <View style={styles.heroTraceLine} />
          </View>

          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Icon color={theme.colors.cyan} name="mesh-nodes" size={20} />
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Current mesh summary</Text>
              <Text style={styles.heroBody}>
                Direct BLE discovery is the live seam here. Peer cards route into messaging and
                on-chain send flows without pretending relay or beacon work is complete.
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <SignalBars strength={signalStrength} size={14} />
            <Text style={styles.summaryText}>
              {nodeCount} {nodeCount === 1 ? "node" : "nodes"} · {iface}
            </Text>
            <Pill
              label={bleError ? "BLE error" : connectionState}
              tone={stateTone(connectionState, bleError)}
            />
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Trusted</Text>
              <Text style={styles.metricValue}>{trustedCount}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Active now</Text>
              <Text style={styles.metricValue}>{activeCount}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Iface</Text>
              <Text style={styles.metricValue}>{iface}</Text>
            </View>
          </View>
        </GlassSurface>

        <View style={styles.actionsRow}>
          <DepthButton
            disabled={refreshAction.disabled}
            icon={refreshAction.icon}
            label={refreshAction.label}
            onPress={refreshAction.onPress}
            size="md"
            style={styles.actionBtn}
            tone={refreshAction.tone}
            variant={refreshAction.variant}
          />
          {bleError ? (
            <DepthButton
              icon={settingsAction.icon}
              label={settingsAction.label}
              onPress={settingsAction.onPress}
              size="md"
              style={styles.actionBtn}
              tone={settingsAction.tone}
              variant={settingsAction.variant}
            />
          ) : !enabled ? (
            <DepthButton
              icon={enableAction.icon}
              label={enableAction.label}
              onPress={enableAction.onPress}
              size="md"
              style={styles.actionBtn}
              tone={enableAction.tone}
              variant={enableAction.variant}
            />
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby peers</Text>
          <Text style={styles.sectionMeta}>
            Trust and signal are real. Deeper relay, distance, and beacon context stay explicit
            until those runtime seams exist.
          </Text>
        </View>

        <View style={styles.listWrap}>
          <PeersList
            peers={orderedPeers}
            loading={loading}
            error={bleError}
            emptyAction={enabled ? refreshAction : enableAction}
            errorAction={settingsAction}
            onPressPeer={(id) =>
              router.push((`/peers/${id}`) as Parameters<typeof router.push>[0])
            }
          />
        </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
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
  hero: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  heroTraceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  heroTraceDot: {
    backgroundColor: theme.colors.cyan,
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  heroTraceLine: {
    backgroundColor: theme.colors.cyanGlow,
    borderRadius: theme.radius.pill,
    height: 1,
    width: 88,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  heroIconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderRadius: theme.radius.pill,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  heroBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.55,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  summaryText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.micro,
    letterSpacing: 0.4,
  },
  metricRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  metricCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: theme.spacing.xs,
    minHeight: 72,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
  },
  actionsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
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
  listWrap: {
    flex: 1,
  },
});
