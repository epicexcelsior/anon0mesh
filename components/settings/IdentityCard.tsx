import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import type { WalletMode } from "@/src/domain/services/WalletService";
import * as haptics from "@/src/design-system/haptics";
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
  const label = displayName || alias || "Anonymous";
  const helper =
    alias && alias !== displayName
      ? `Mesh alias ${alias}`
      : "Wallet identity derived from current key";

  function handlePress() {
    if (!onPress) return;
    haptics.tap();
    sound.buttonTap();
    onPress();
  }

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [pressed && onPress ? styles.pressed : null]}>
      <GlassSurface variant="strong" style={styles.card}>
        <View style={styles.traceRow}>
          <View style={styles.traceDot} />
          <View style={styles.traceLine} />
        </View>

        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial(label)}</Text>
          </View>

          <View style={styles.info}>
            <Text numberOfLines={1} style={styles.name}>
              {label}
            </Text>
            <Text style={styles.helper}>{helper}</Text>
          </View>

          <View style={styles.actionBubble}>
            <Icon color={theme.colors.cyan} name="identity-chip" size={18} />
          </View>
        </View>

        {address ? (
          <Text numberOfLines={1} style={styles.address}>
            {shortenAddress(address)}
          </Text>
        ) : null}

        <View style={styles.pills}>
          <Pill label={modeLabel(mode)} tone={modeTone(mode)} />
          <Pill label={connectionState} tone={connectionTone(connectionState)} />
          <Pill label={`${peerCount} ${peerCount === 1 ? "peer" : "peers"}`} tone="neutral" />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Open label, QR, address, and export tools</Text>
          <Icon color={theme.colors.textMuted} name="arrow-up-right" size={16} />
        </View>
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  pressed: {
    opacity: 0.92,
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
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.cyanGlowStrong,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarText: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.section,
  },
  info: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  name: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.display,
    fontSize: theme.type.section,
    letterSpacing: -0.4,
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
    lineHeight: theme.type.caption * 1.45,
  },
});
