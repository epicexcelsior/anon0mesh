import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { PressSurface } from "@/components/primitives/PressSurface";
import type { WalletMode } from "@/src/domain/services/WalletService";
import * as sound from "@/src/design-system/sound";
import { appTheme as theme } from "@/src/design-system/theme";
import type { ConnectionState } from "@/src/hooks/useMesh";

interface IdentityCardProps {
  address: string | null;
  alias: string | null;
  connectionState: ConnectionState;
  displayName: string;
  mode: WalletMode;
  onPress?: () => void;
  peerCount: number;
}

function shortenAddress(address: string) {
  if (address.length <= 18) return address;
  return `${address.slice(0, 10)}...${address.slice(-6)}`;
}

function compactLabel(displayName: string, alias: string | null) {
  if (!displayName) return "Anonymous";
  if (alias && displayName === alias) {
    return shortenAddress(displayName);
  }
  return displayName;
}

function getInitial(name: string | null) {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

function modeLabel(mode: WalletMode) {
  switch (mode) {
    case "local":
      return "Local vault";
    case "mwa":
      return "External wallet";
    case "fixture":
      return "Fixture lane";
  }
}

function modeTone(mode: WalletMode) {
  switch (mode) {
    case "local":
      return "cyan" as const;
    case "mwa":
      return "amber" as const;
    case "fixture":
      return "neutral" as const;
  }
}

function connectionTone(state: ConnectionState) {
  switch (state) {
    case "Live":
      return "green" as const;
    case "Silent":
      return "amber" as const;
    case "Offline":
      return "neutral" as const;
  }
}

export function IdentityCard({
  address,
  alias,
  connectionState,
  displayName,
  mode,
  onPress,
  peerCount,
}: IdentityCardProps) {
  const label = compactLabel(displayName, alias);
  const helper =
    alias && alias !== displayName
      ? `Mesh alias ${shortenAddress(alias)}`
      : "Wallet identity derived from current key";

  function handlePress() {
    if (!onPress) return;
    sound.buttonTap();
    onPress();
  }

  return (
    <PressSurface onPress={onPress ? handlePress : undefined} style={styles.wrapper} variant="card">
      <GlassSurface variant="strong" style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial(label)}</Text>
          </View>

          <View style={styles.info}>
            <Text numberOfLines={1} style={styles.name}>
              {label}
            </Text>
            <Text numberOfLines={2} style={styles.helper}>
              {helper}
            </Text>
          </View>

          <View style={styles.actionBubble}>
            <Icon color={theme.colors.cyan} name="identity-chip" size={18} />
          </View>
        </View>

        {address ? (
          <Text numberOfLines={1} style={styles.address}>
            {`Address ${shortenAddress(address)}`}
          </Text>
        ) : null}

        <View style={styles.pills}>
          <Pill label={modeLabel(mode)} tone={modeTone(mode)} />
          <Pill label={connectionState} tone={connectionTone(connectionState)} />
          <Pill label={`${peerCount} ${peerCount === 1 ? "peer" : "peers"}`} tone="neutral" />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Open label, QR, and export tools</Text>
          <Icon color={theme.colors.textMuted} name="arrow-up-right" size={16} />
        </View>
      </GlassSurface>
    </PressSurface>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.radius.xl,
  },
  card: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.cyanGlowStrong,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.bodyLg,
  },
  info: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.bodyLg,
    letterSpacing: -0.2,
  },
  helper: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.4,
  },
  actionBubble: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  address: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.35,
  },
});
