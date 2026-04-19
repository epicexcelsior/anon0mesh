import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";

interface IdentityCardProps {
  address: string | null;
  alias: string | null;
  displayName: string | null;
}

function shortenAddress(addr: string): string {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-4)}`;
}

function getInitial(name: string | null): string {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

export function IdentityCard({ address, alias, displayName }: IdentityCardProps) {
  const router = useRouter();
  const label = displayName ?? alias ?? "Anonymous";
  const initial = getInitial(label);

  return (
    <GlassSurface variant="regular" style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{label}</Text>
          {address ? (
            <Text style={styles.address} numberOfLines={1}>
              {shortenAddress(address)}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/settings/identity" as Parameters<typeof router.push>[0])}
          hitSlop={8}
          style={styles.qrButton}
          activeOpacity={0.7}
        >
          <Icon name="maximize" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  avatarWrap: {
    flexShrink: 0,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.cyan,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarText: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  info: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  name: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
  },
  address: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
  },
  qrButton: {
    alignItems: "center",
    flexShrink: 0,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
});
