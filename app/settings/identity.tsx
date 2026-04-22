import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";

import { AppTextInput } from "@/components/primitives/AppTextInput";
import { DepthButton } from "@/components/primitives/DepthButton";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import {
  SettingsRow,
  SettingsScaffold,
  SettingsSection,
} from "@/components/settings";
import { useLocalDisplayName, useWallet } from "@/src/hooks";
import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import { appTheme as theme } from "@/src/design-system/theme";

function shortAddress(address: string | null) {
  if (!address) return "Not connected";
  return `${address.slice(0, 10)}...${address.slice(-6)}`;
}

function shortIdentity(value: string | null) {
  if (!value) return "Anonymous";
  if (value.length <= 20) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

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

export default function IdentityScreen() {
  const router = useRouter();
  const { wallet, mode } = useWallet();
  const alias = wallet?.identity ?? "Anonymous";
  const address = wallet?.address ?? null;
  const {
    displayName,
    hasCustomDisplayName,
    loading,
    save,
    storedDisplayName,
  } = useLocalDisplayName(address, alias);

  const [draftName, setDraftName] = useState(storedDisplayName ?? "");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraftName(storedDisplayName ?? "");
  }, [storedDisplayName]);

  const trimmedDraft = draftName.trim();
  const storedValue = storedDisplayName ?? "";
  const isDirty = trimmedDraft !== storedValue;
  const heroLabel = hasCustomDisplayName ? displayName : shortIdentity(alias);
  const heroAlias = alias ? `Alias ${shortIdentity(alias)}` : "Alias unavailable";
  const heroAddress = address ? `Address ${shortAddress(address)}` : "No wallet connected";

  async function handleCopy() {
    if (!address) return;

    await Clipboard.setStringAsync(address);
    haptics.tap();
    sound.buttonTap();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleSave() {
    if (!address || !isDirty) return;

    if (trimmedDraft && trimmedDraft.length < 2) {
      Alert.alert("Invalid label", "Use at least 2 characters or clear it back to alias.");
      return;
    }

    if (trimmedDraft.length > 20) {
      Alert.alert("Invalid label", "Keep the local label at 20 characters or less.");
      return;
    }

    if (trimmedDraft && !/^[a-zA-Z0-9\s\-_.]+$/.test(trimmedDraft)) {
      Alert.alert("Invalid label", "Use letters, numbers, spaces, and basic punctuation only.");
      return;
    }

    await save(draftName);
    haptics.confirm();
    sound.successResolve();
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  async function handleReset() {
    if (!address || !hasCustomDisplayName) return;
    await save("");
    setDraftName("");
    haptics.confirm();
    sound.successResolve();
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <SettingsScaffold
      eyebrow="Identity surface"
      onBack={() => router.back()}
      showBack
      subtitle="Wallet alias stays key-derived. Device labels save locally on this phone."
      title="Identity"
      tone="cyan"
      trailing={<Pill label={hasCustomDisplayName ? "Local label" : "Alias only"} tone={hasCustomDisplayName ? "cyan" : "neutral"} />}
    >
      <GlassSurface variant="strong" style={styles.hero}>
        <View style={styles.traceRow}>
          <View style={styles.traceDot} />
          <View style={styles.traceLine} />
        </View>

        <View style={styles.qrFrame}>
          {address ? (
            <QRCode
              backgroundColor="transparent"
              color={theme.colors.textPrimary}
              size={148}
              value={address}
            />
          ) : (
            <View style={styles.qrPlaceholder} />
          )}
        </View>

        <Text numberOfLines={1} style={styles.displayName}>{heroLabel}</Text>
        <Text numberOfLines={1} style={styles.aliasText}>{heroAlias}</Text>
        <Text numberOfLines={1} style={styles.addressText}>{heroAddress}</Text>

        <View style={styles.heroPills}>
          <Pill label={modeLabel(mode)} tone={mode === "local" ? "cyan" : mode === "mwa" ? "amber" : "neutral"} />
          <Pill label={hasCustomDisplayName ? "Device label active" : "Alias direct"} tone={hasCustomDisplayName ? "green" : "neutral"} />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            accessibilityLabel="Copy wallet address"
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={handleCopy}
            style={styles.heroAction}
          >
            <Icon color={copied ? theme.colors.green : theme.colors.cyan} name={copied ? "check" : "copy"} size={16} />
            <Text style={[styles.heroActionText, copied ? styles.heroActionTextDone : null]}>
              {copied ? "Copied" : "Copy address"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Open wallet export"
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={() => {
              haptics.select();
              router.push("/settings/wallet-export" as Parameters<typeof router.push>[0]);
            }}
            style={styles.heroAction}
          >
            <Icon color={theme.colors.textPrimary} name="download-cloud" size={16} />
            <Text style={styles.heroActionText}>Export</Text>
          </TouchableOpacity>
        </View>
      </GlassSurface>

      <SettingsSection
        title="Device label"
        description="Saved on this device only."
      >
        <View style={styles.editorBlock}>
          <AppTextInput
            autoCorrect={false}
            containerStyle={styles.input}
            maxLength={20}
            label="Local display label"
            onChangeText={setDraftName}
            placeholder={shortIdentity(alias)}
            value={draftName}
          />

          {saved ? <Text style={styles.savedText}>Saved on this device.</Text> : null}

          <View style={styles.editorActions}>
            <DepthButton
              disabled={!address || !isDirty || loading}
              icon={<Icon color={theme.colors.textOnAccent} name="save" size={16} />}
              label="Save label"
              onPress={handleSave}
              size="md"
              style={styles.actionButton}
              tone="cyan"
            />
            <DepthButton
              disabled={!hasCustomDisplayName || loading}
              icon={<Icon color={theme.colors.textPrimary} name="rotate-ccw" size={16} />}
              label="Use alias"
              onPress={handleReset}
              size="md"
              style={styles.actionButton}
              tone="cyan"
              variant="secondary"
            />
          </View>
        </View>
      </SettingsSection>

      <SettingsSection
        title="Identity layers"
        description="Naming stays honest while richer identity metadata stays out of scope."
      >
        <SettingsRow
          iconName="user"
          iconTone="cyan"
          label="Displayed on this device"
          pillLabel={hasCustomDisplayName ? "Custom" : "Alias"}
          pillTone={hasCustomDisplayName ? "green" : "neutral"}
          sublabel={hasCustomDisplayName ? "Saved local label takes visual priority here" : "Using wallet alias directly"}
          value={displayName}
        />
        <SettingsRow
          iconName="hash"
          iconTone="neutral"
          label="Mesh alias"
          sublabel="Wallet-derived identity visible across current branch surfaces"
          value={alias}
        />
        <SettingsRow
          iconName="copy"
          iconTone="green"
          label="Wallet address"
          onPress={handleCopy}
          showSeparator={false}
          sublabel="Tap row to copy the full address"
          value={shortAddress(address)}
        />
      </SettingsSection>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  traceRow: {
    alignItems: "center",
    alignSelf: "stretch",
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
  qrFrame: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  qrPlaceholder: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    height: 148,
    width: 148,
  },
  displayName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.bodyLg,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  aliasText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    textAlign: "center",
  },
  addressText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.35,
    textAlign: "center",
  },
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    justifyContent: "center",
  },
  actionRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  heroAction: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: theme.spacing.md,
  },
  heroActionText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  heroActionTextDone: {
    color: theme.colors.green,
  },
  editorBlock: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  input: {
    marginTop: 0,
  },
  savedText: {
    color: theme.colors.green,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  editorActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
