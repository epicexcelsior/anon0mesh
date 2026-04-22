import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { DepthButton } from "@/components/primitives";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { appTheme as theme } from "@/src/design-system/theme";

interface WalletPathPickerProps {
  canConnect?: boolean;
  canCreate?: boolean;
  connectHint?: string | null;
  createHint?: string | null;
  intent?: "new" | "existing";
  loading?: boolean;
  onCreateNew: () => void;
  onConnect: () => void;
}

export function WalletPathPicker({
  canConnect,
  canCreate,
  connectHint,
  createHint,
  intent = "new",
  loading,
  onCreateNew,
  onConnect,
}: WalletPathPickerProps) {
  const isMwaAvailable = Platform.OS === "android";
  const allowCreate = canCreate ?? true;
  const allowConnect = canConnect ?? isMwaAvailable;
  const createLabel = intent === "existing" ? "Use local identity" : "Create local";
  const connectLabel = intent === "existing" ? "Connect existing" : "Connect (MWA)";
  const sectionLabel = intent === "existing" ? "IDENTITY PATH" : "WALLET PATH";

  return (
    <GlassSurface variant="regular" style={styles.card}>
      <Text style={styles.label}>{sectionLabel}</Text>
      <View style={styles.buttons}>
        <DepthButton
          label={createLabel}
          variant="primary"
          tone="cyan"
          size="md"
          disabled={loading || !allowCreate}
          onPress={onCreateNew}
        />
        {!allowCreate && createHint ? (
          <Text style={styles.hint}>{createHint}</Text>
        ) : null}
        <DepthButton
          label={connectLabel}
          variant="secondary"
          tone="cyan"
          size="md"
          disabled={loading || !allowConnect}
          onPress={onConnect}
        />
        {!allowConnect && connectHint ? (
          <Text style={styles.hint}>{connectHint}</Text>
        ) : null}
      </View>
      {!isMwaAvailable && !connectHint && (
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
