import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { DepthButton } from "@/components/primitives";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { appTheme as theme } from "@/src/design-system/theme";

interface WalletPathPickerProps {
  onCreateNew: () => void;
  onConnect: () => void;
}

export function WalletPathPicker({ onCreateNew, onConnect }: WalletPathPickerProps) {
  const isMwaAvailable = Platform.OS === "android";

  return (
    <GlassSurface variant="regular" style={styles.card}>
      <Text style={styles.label}>WALLET</Text>
      <View style={styles.buttons}>
        <DepthButton
          label="Create New"
          variant="primary"
          tone="cyan"
          size="md"
          onPress={onCreateNew}
        />
        <DepthButton
          label="Connect (MWA)"
          variant="secondary"
          tone="cyan"
          size="md"
          disabled={!isMwaAvailable}
          onPress={onConnect}
        />
      </View>
      {!isMwaAvailable && (
        <Text style={styles.hint}>Mobile Wallet Adapter is Android-only.</Text>
      )}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 0.8,
  },
  buttons: {
    gap: theme.spacing.sm,
  },
  hint: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    marginTop: theme.spacing.xs,
  },
});
