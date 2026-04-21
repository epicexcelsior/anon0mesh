import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import { Backdrop } from "@/components/primitives/Backdrop";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Pill } from "@/components/primitives/Pill";
import { Icon } from "@/components/primitives/Icon";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { useLxmf, LxmfNodeMode } from "@/src/hooks/useLxmf";
import { useMesh } from "@/src/hooks/useMesh";
import { usePreferences } from "@/src/hooks/usePreferences";
import { appTheme as theme } from "@/src/design-system/theme";

const LXMF_SEGMENTS = [
  { id: String(LxmfNodeMode.BleOnly), label: "BLE Only" },
  { id: String(LxmfNodeMode.Reticulum), label: "Reticulum" },
];

const LXMF_MODE_LABEL: Record<LxmfNodeMode, string> = {
  [LxmfNodeMode.BleOnly]: "BLE Only",
  [LxmfNodeMode.TcpClient]: "TCP Client",
  [LxmfNodeMode.TcpServer]: "TCP Server",
  [LxmfNodeMode.Reticulum]: "Reticulum",
};

function connectionPillTone(state: string): "green" | "amber" | "neutral" {
  if (state === "Live") return "green";
  if (state === "Silent") return "amber";
  return "neutral";
}

export default function NetworkScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { connectionState, nodeCount, bleError, enabled, scanning, setEnabled } = useMesh();
  const { isNativeAvailable } = useLxmf();
  const { network, loading, updateNetwork } = usePreferences();

  const bleEnabled = loading ? enabled : network.bleEnabled;
  const statusSublabel = !enabled
    ? "Mesh scanning paused on this device"
    : scanning
      ? `${nodeCount} peer${nodeCount !== 1 ? "s" : ""} visible`
      : "Waiting for BLE scan";

  function handleBleToggle(value: boolean) {
    setEnabled(value);
    void updateNetwork({ bleEnabled: value });
    haptics.select();
    if (value) sound.toggleOn(); else sound.toggleOff();
  }

  function handleAutoConnectToggle(value: boolean) {
    void updateNetwork({ autoConnect: value });
    haptics.select();
    if (value) sound.toggleOn(); else sound.toggleOff();
  }

  function handleLxmfModeSelect(id: string) {
    const mode = Number(id) as LxmfNodeMode;
    void updateNetwork({ lxmfMode: mode });
    haptics.tap();
    sound.buttonTap();
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="settings" />

      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <TouchableOpacity accessibilityLabel="Back" accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Network</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <SectionLabel label="Bluetooth" />
          <GlassSurface variant="regular" style={styles.card}>
            <View style={[styles.row, styles.rowBordered]}>
              <View style={styles.iconWrap}>
                <Icon name="bluetooth" size={18} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.rowMid}>
                <Text style={styles.rowLabel}>Bluetooth Mesh</Text>
                <Text style={styles.rowSublabel}>Directly controls scan state on this device</Text>
              </View>
              <Switch
                disabled={loading}
                value={bleEnabled}
                onValueChange={handleBleToggle}
                trackColor={{ false: theme.colors.surfaceMuted, true: theme.colors.cyanSoft }}
                thumbColor={bleEnabled ? theme.colors.cyan : theme.colors.textMuted}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Icon name="activity" size={18} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.rowMid}>
                <Text style={styles.rowLabel}>Status</Text>
                <Text style={styles.rowSublabel}>{statusSublabel}</Text>
              </View>
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.cyan} />
              ) : (
                <Pill
                  label={bleError ? "Error" : connectionState}
                  tone={bleError ? "red" : connectionPillTone(connectionState)}
                />
              )}
            </View>

            {bleError ? (
              <View style={styles.errorBanner}>
                <Icon name="alert-circle" size={14} color={theme.colors.red} />
                <Text style={styles.errorBannerText}>{bleError}</Text>
              </View>
            ) : null}
          </GlassSurface>
        </View>

        <View style={styles.section}>
          <SectionLabel label="LXMF" />
          <GlassSurface variant="regular" style={styles.card}>
            <View style={[styles.row, styles.rowBordered]}>
              <View style={styles.iconWrap}>
                <Icon name="mesh-nodes" size={18} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.rowMid}>
                <Text style={styles.rowLabel}>LXMF Mode</Text>
                <Text style={styles.rowSublabel}>Current: {LXMF_MODE_LABEL[network.lxmfMode]}</Text>
              </View>
            </View>

            <View style={styles.segmentRow}>
              <SegmentedControl
                segments={LXMF_SEGMENTS}
                selected={String(network.lxmfMode)}
                onSelect={handleLxmfModeSelect}
              />
            </View>

            <View style={styles.noteRow}>
              <Text style={styles.noteText}>
                Saved on this device now. Native LXMF runtime is {isNativeAvailable ? "available" : "still stubbed"}.
              </Text>
            </View>
          </GlassSurface>
        </View>

        <View style={styles.section}>
          <SectionLabel label="Connectivity" />
          <GlassSurface variant="regular" style={styles.card}>
            <View style={[styles.row, styles.rowBordered]}>
              <View style={styles.iconWrap}>
                <Icon name="zap" size={18} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.rowMid}>
                <Text style={styles.rowLabel}>Auto-connect</Text>
                <Text style={styles.rowSublabel}>Automatically connect to nearby peers</Text>
              </View>
              <Switch
                disabled={loading}
                value={network.autoConnect}
                onValueChange={handleAutoConnectToggle}
                trackColor={{ false: theme.colors.surfaceMuted, true: theme.colors.cyanSoft }}
                thumbColor={network.autoConnect ? theme.colors.cyan : theme.colors.textMuted}
              />
            </View>

            <View style={[styles.row, styles.disabledRow]}>
              <View style={styles.iconWrap}>
                <Icon name="radio" size={18} color={theme.colors.textMuted} />
              </View>
              <View style={styles.rowMid}>
                <Text style={styles.rowLabelDisabled}>LoRa</Text>
                <Text style={styles.rowSublabel}>Coming soon</Text>
              </View>
              <Pill label="Soon" tone="neutral" />
            </View>
          </GlassSurface>
        </View>
      </ScrollView>
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
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.xs,
  },
  card: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  rowBordered: {
    borderBottomColor: theme.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  disabledRow: {
    opacity: 0.5,
  },
  iconWrap: {
    alignItems: "center",
    flexShrink: 0,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  rowMid: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  rowLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  rowLabelDisabled: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  rowSublabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  segmentRow: {
    borderBottomColor: theme.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  noteRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  noteText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
  },
  errorBanner: {
    alignItems: "center",
    borderTopColor: theme.colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  errorBannerText: {
    color: theme.colors.red,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.5,
  },
});
