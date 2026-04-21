import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";

import { DepthButton } from "@/components/primitives/DepthButton";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import {
  SettingsRow,
  SettingsScaffold,
  SettingsSection,
} from "@/components/settings";
import { useWallet } from "@/src/hooks";
import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import { appTheme as theme } from "@/src/design-system/theme";

function modeLabel(mode: ReturnType<typeof useWallet>["mode"]) {
  switch (mode) {
    case "local":
      return "Local vault";
    case "mwa":
      return "External wallet";
    case "fixture":
      return "Fixture lane";
  }
}

function formatPrivateKey(privateKey: string) {
  const chunks = privateKey.match(/.{1,8}/g) ?? [privateKey];
  const lines: string[] = [];
  for (let index = 0; index < chunks.length; index += 4) {
    lines.push(chunks.slice(index, index + 4).join(" "));
  }
  return lines.join("\n");
}

export default function WalletExportScreen() {
  const router = useRouter();
  const { exportPrivateKey, exportState, mode } = useWallet();
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const isRevealed = privateKey.length > 0;
  const exportAvailable = exportState?.available ?? false;
  const formattedKey = isRevealed ? formatPrivateKey(privateKey) : "•••••••• •••••••• •••••••• ••••••••";

  async function handleReveal() {
    setLoading(true);
    setErrorMessage("");

    try {
      const nextKey = await exportPrivateKey();
      setPrivateKey(nextKey);
      haptics.confirm();
      sound.successResolve();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reveal private key.";
      setErrorMessage(message);
      haptics.error();
      sound.warning();
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!privateKey) return;
    await Clipboard.setStringAsync(privateKey);
    haptics.tap();
    sound.buttonTap();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <SettingsScaffold
      eyebrow="Custody warning"
      onBack={() => router.back()}
      showBack
      subtitle="Reveal raw private key material only for locally stored wallets. External wallets keep keys in their own app."
      title="Wallet Export"
      tone="amber"
      trailing={<Pill label={modeLabel(mode)} tone={mode === "local" ? "cyan" : mode === "mwa" ? "amber" : "neutral"} />}
    >
      <GlassSurface variant="strong" style={styles.warningCard}>
        <View style={styles.traceRow}>
          <View style={styles.traceDot} />
          <View style={styles.traceLine} />
        </View>

        <View style={styles.warningTop}>
          <View style={styles.warningIconWrap}>
            <Icon color={theme.colors.amber} name="shield" size={18} />
          </View>
          <View style={styles.warningCopy}>
            <Text style={styles.warningTitle}>Never share this key material</Text>
            <Text style={styles.warningBody}>
              Anyone who sees this private key can control your funds. Keep it offline and reveal it only when you are intentionally moving custody.
            </Text>
          </View>
        </View>

        <View style={styles.warningPills}>
          <Pill label={exportAvailable ? "Device-auth gate" : "Not available"} tone={exportAvailable ? "green" : "amber"} />
          <Pill label="Private key hex" tone="neutral" />
        </View>
      </GlassSurface>

      <SettingsSection
        title="Key material"
        description="Local wallet export uses the device security gate already wired into secure storage. No extra theater."
      >
        <View style={styles.secretBlock}>
          <GlassSurface variant="regular" style={styles.secretCard}>
            <Text style={styles.secretLabel}>{isRevealed ? "Revealed private key" : "Locked private key"}</Text>
            <Text selectable={isRevealed} style={[styles.secretValue, !isRevealed ? styles.secretValueMasked : null]}>
              {formattedKey}
            </Text>
          </GlassSurface>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.actions}>
            {!isRevealed ? (
              <DepthButton
                disabled={!exportAvailable || loading}
                icon={<Icon color={theme.colors.textOnAccent} name="lock" size={16} />}
                label={loading ? "Revealing..." : "Reveal private key"}
                onPress={handleReveal}
                size="md"
                style={styles.actionButton}
                tone="amber"
              />
            ) : (
              <>
                <DepthButton
                  icon={<Icon color={theme.colors.textOnAccent} name={copied ? "check" : "copy"} size={16} />}
                  label={copied ? "Copied" : "Copy private key"}
                  onPress={handleCopy}
                  size="md"
                  style={styles.actionButton}
                  tone="amber"
                />

                <TouchableOpacity
                  accessibilityLabel="Hide key material"
                  accessibilityRole="button"
                  activeOpacity={0.8}
                  onPress={() => {
                    setPrivateKey("");
                    setErrorMessage("");
                  }}
                  style={styles.hideButton}
                >
                  <Icon color={theme.colors.textPrimary} name="eye-off" size={16} />
                  <Text style={styles.hideButtonText}>Hide</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </SettingsSection>

      <SettingsSection
        title="Support state"
        description="Availability depends on custody model and whether the local secure-store export path exists."
      >
        <SettingsRow
          iconName="hard-drive"
          iconTone="cyan"
          label="Wallet source"
          sublabel="Current custody lane for this device"
          value={modeLabel(mode)}
        />
        <SettingsRow
          iconName="shield"
          iconTone="amber"
          label="Export status"
          pillLabel={exportAvailable ? "Ready" : "Blocked"}
          pillTone={exportAvailable ? "green" : "amber"}
          sublabel={exportState?.reason ?? "Local wallets can reveal raw private key hex after device auth."}
          value={exportAvailable ? "Available" : "Unavailable"}
        />
        <SettingsRow
          iconName="info"
          iconTone="neutral"
          label="Format"
          showSeparator={false}
          sublabel="This branch exports raw private key hex, not a mnemonic seed phrase."
          value="Hex"
        />
      </SettingsSection>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  warningCard: {
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
    backgroundColor: theme.colors.amber,
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  traceLine: {
    backgroundColor: theme.colors.amberGlow,
    borderRadius: theme.radius.pill,
    height: 1,
    width: 88,
  },
  warningTop: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  warningIconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.amberSoft,
    borderRadius: theme.radius.pill,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  warningCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  warningTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  warningBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.55,
  },
  warningPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  secretBlock: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  secretCard: {
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    minHeight: 144,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  secretLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  secretValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
    lineHeight: theme.type.body * 1.7,
  },
  secretValueMasked: {
    color: theme.colors.textMuted,
  },
  errorText: {
    color: theme.colors.red,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.45,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  hideButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: theme.spacing.lg,
  },
  hideButtonText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
});
