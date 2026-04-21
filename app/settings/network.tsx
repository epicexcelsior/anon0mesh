import React from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { DepthButton } from "@/components/primitives/DepthButton";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import {
  SettingsRow,
  SettingsScaffold,
  SettingsSection,
} from "@/components/settings";
import { LxmfNodeMode, useLxmf, useMesh, usePreferences } from "@/src/hooks";
import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
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

function connectionTone(state: "Live" | "Silent" | "Offline", error?: string | null) {
  if (error) return "red" as const;
  switch (state) {
    case "Live":
      return "green" as const;
    case "Silent":
      return "amber" as const;
    case "Offline":
      return "neutral" as const;
  }
}

export default function NetworkScreen() {
  const router = useRouter();
  const {
    bleError,
    connectionState,
    enabled,
    iface,
    nodeCount,
    refresh,
    scanning,
    setEnabled,
  } = useMesh();
  const { isNativeAvailable } = useLxmf();
  const { loading, network, updateNetwork } = usePreferences();

  const bleEnabled = loading ? enabled : network.bleEnabled;
  const statusSublabel = !bleEnabled
    ? "Mesh scanning paused on this device"
    : scanning
      ? `${nodeCount} ${nodeCount === 1 ? "peer" : "peers"} visible right now`
      : "Waiting for next BLE scan cycle";

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
    <SettingsScaffold
      eyebrow="Mesh transport"
      onBack={() => router.back()}
      showBack
      subtitle="BLE controls are live. LXMF mode saves as local config while deeper runtime work continues in the next phase."
      title="Network"
      tone="cyan"
      trailing={<Pill label={bleError ? "BLE error" : connectionState} tone={connectionTone(connectionState, bleError)} />}
    >
      <GlassSurface variant="strong" style={styles.hero}>
        <View style={styles.traceRow}>
          <View style={styles.traceDot} />
          <View style={styles.traceLine} />
        </View>

        <View style={styles.heroTop}>
          <View style={styles.heroIconWrap}>
            <Icon color={theme.colors.cyan} name="radio" size={18} />
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Direct radio, honest transport.</Text>
            <Text style={styles.heroBody}>
              This lane owns BLE scan state today. LXMF choices persist locally, but native message runtime remains staged until backend truth pass.
            </Text>
          </View>
        </View>

        <View style={styles.heroPills}>
          <Pill label={`${nodeCount} ${nodeCount === 1 ? "peer" : "peers"}`} tone="cyan" />
          <Pill label={iface} tone="neutral" />
          <Pill label={LXMF_MODE_LABEL[network.lxmfMode]} tone="neutral" />
        </View>
      </GlassSurface>

      <View style={styles.actionsRow}>
        <DepthButton
          icon={<Icon color={theme.colors.textPrimary} name="refresh-cw" size={16} />}
          label={scanning ? "Scanning" : "Refresh scan"}
          onPress={refresh}
          size="md"
          style={styles.actionButton}
          tone="cyan"
          variant="secondary"
        />

        {bleError ? (
          <DepthButton
            icon={<Icon color={theme.colors.textPrimary} name="settings" size={16} />}
            label="System settings"
            onPress={() => {
              void Linking.openSettings();
            }}
            size="md"
            style={styles.actionButton}
            tone="cyan"
            variant="secondary"
          />
        ) : !bleEnabled ? (
          <DepthButton
            icon={<Icon color={theme.colors.textOnAccent} name="bluetooth" size={16} />}
            label="Enable BLE"
            onPress={() => handleBleToggle(true)}
            size="md"
            style={styles.actionButton}
            tone="cyan"
          />
        ) : null}
      </View>

      <SettingsSection
        title="Bluetooth mesh"
        description="This toggle drives live scan state on the device. Status copy stays tied to real peer discovery, not mocked transport claims."
      >
        <View style={[styles.controlRow, styles.controlRowBordered]}>
          <View style={[styles.controlIconWrap, { backgroundColor: theme.colors.cyanSoft }]}>
            <Icon color={theme.colors.cyan} name="bluetooth" size={18} />
          </View>

          <View style={styles.controlCopy}>
            <Text style={styles.controlLabel}>Bluetooth mesh</Text>
            <Text style={styles.controlBody}>Directly enables or pauses local BLE peer scanning.</Text>
          </View>

          <Switch
            disabled={loading}
            onValueChange={handleBleToggle}
            thumbColor={bleEnabled ? theme.colors.cyan : theme.colors.textMuted}
            trackColor={{ false: theme.colors.surfaceMuted, true: theme.colors.cyanGlowStrong }}
            value={bleEnabled}
          />
        </View>

        <SettingsRow
          iconName="activity"
          iconTone="neutral"
          label="Current status"
          right={
            loading ? (
              <ActivityIndicator color={theme.colors.cyan} size="small" />
            ) : (
              <Pill label={bleError ? "Error" : connectionState} tone={connectionTone(connectionState, bleError)} />
            )
          }
          sublabel={statusSublabel}
          value={bleError ? undefined : iface}
        />

        {bleError ? (
          <View style={styles.errorBanner}>
            <Icon color={theme.colors.red} name="alert-circle" size={14} />
            <Text style={styles.errorBannerText}>{bleError}</Text>
          </View>
        ) : null}
      </SettingsSection>

      <SettingsSection
        title="LXMF mode"
        description="Selection persists in local preferences today. Runtime shape is preserved, but this branch still runs the stub adapter."
      >
        <View style={styles.segmentBlock}>
          <View style={styles.segmentHeader}>
            <Text style={styles.segmentLabel}>Current route</Text>
            <Text style={styles.segmentValue}>{LXMF_MODE_LABEL[network.lxmfMode]}</Text>
          </View>

          <SegmentedControl
            onSelect={handleLxmfModeSelect}
            segments={LXMF_SEGMENTS}
            selected={String(network.lxmfMode)}
          />

          <Text style={styles.segmentNote}>
            Native LXMF runtime is {isNativeAvailable ? "available" : "still stubbed"} in this recovery lane.
          </Text>
        </View>
      </SettingsSection>

      <SettingsSection
        title="Connectivity defaults"
        description="Local behavior switches live now. Longer-range relay still stays explicitly marked as future work."
      >
        <View style={[styles.controlRow, styles.controlRowBordered]}>
          <View style={[styles.controlIconWrap, { backgroundColor: theme.colors.cyanSoft }]}>
            <Icon color={theme.colors.cyan} name="zap" size={18} />
          </View>

          <View style={styles.controlCopy}>
            <Text style={styles.controlLabel}>Auto-connect</Text>
            <Text style={styles.controlBody}>Reconnect to visible nearby peers without manual tap-through.</Text>
          </View>

          <Switch
            disabled={loading}
            onValueChange={handleAutoConnectToggle}
            thumbColor={network.autoConnect ? theme.colors.cyan : theme.colors.textMuted}
            trackColor={{ false: theme.colors.surfaceMuted, true: theme.colors.cyanGlowStrong }}
            value={network.autoConnect}
          />
        </View>

        <SettingsRow
          iconName="radio"
          iconTone="neutral"
          label="LoRa bridge"
          right={<Pill label="Soon" tone="neutral" />}
          showSeparator={false}
          sublabel="Hardware-backed long-range relay stays out of scope for this pass."
        />
      </SettingsSection>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  traceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  traceDot: {
    backgroundColor: theme.colors.cyan,
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  traceLine: {
    backgroundColor: theme.colors.cyanGlow,
    borderRadius: theme.radius.pill,
    height: 1,
    width: 88,
  },
  heroTop: {
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
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  controlRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: 72,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  controlRowBordered: {
    borderBottomColor: theme.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  controlIconWrap: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  controlCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  controlLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.bodyLg,
  },
  controlBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.45,
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: theme.colors.errorContainer,
    borderTopColor: theme.colors.errorOutline,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  errorBannerText: {
    color: theme.colors.red,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.45,
  },
  segmentBlock: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  segmentHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  segmentLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  segmentValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  segmentNote: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.5,
  },
});
