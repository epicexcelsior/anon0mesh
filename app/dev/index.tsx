// /dev catalog route — visible only in dev builds
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { appTheme as theme } from '@/src/design-system/theme';
import { resetOnboarding } from '@/src/utils/devReset';

const SCREENS = [
  { label: '🎨 Tokens & Primitives', route: '/dev/tokens' },
  { label: 'Home', route: '/(tabs)/home' },
  { label: 'Messages', route: '/(tabs)/messages' },
  { label: 'Settings', route: '/(tabs)/settings' },
  { label: 'Peers', route: '/peers' },
  { label: 'Send — Recipient', route: '/send/recipient' },
  { label: 'Send — Amount', route: '/send/amount' },
  { label: 'Send — Review', route: '/send/review' },
  { label: 'Send — Success', route: '/send/success' },
  { label: 'Receive', route: '/receive' },
  { label: 'History', route: '/history' },
  { label: 'Settings — Network', route: '/settings/network' },
  { label: 'Settings — Privacy', route: '/settings/privacy' },
  { label: 'Settings — Beacon', route: '/settings/beacon' },
  { label: 'Settings — About', route: '/settings/about' },
];

export default function DevCatalog() {
  const router = useRouter();
  if (!__DEV__) return null; // gate to dev builds only

  function handleReset() {
    Alert.alert(
      "Reset wallet?",
      "Clears local wallet keys, MWA token cache, and all display-name entries on this device. You'll land back at onboarding.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetOnboarding();
            router.replace("/" as Parameters<typeof router.replace>[0]);
          },
        },
      ],
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dev Catalog</Text>
      <Text style={styles.subtitle}>EXPO_PUBLIC_ADAPTERS=fixtures for fixture data</Text>

      <View style={styles.dangerZone}>
        <TouchableOpacity onPress={handleReset} style={styles.resetRow}>
          <Text style={styles.resetLabel}>🧹 Reset wallet & restart onboarding</Text>
          <Text style={styles.resetHint}>Clears local keys + display names, returns to Landing</Text>
        </TouchableOpacity>
      </View>

      {SCREENS.map(s => (
        <TouchableOpacity
          key={s.route}
          style={styles.row}
          onPress={() => router.push(s.route as any)}
        >
          <Text style={styles.label}>{s.label}</Text>
          <Text style={styles.route}>{s.route}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, gap: theme.spacing.sm },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    marginBottom: theme.spacing.lg,
  },
  dangerZone: {
    marginBottom: theme.spacing.md,
  },
  resetRow: {
    backgroundColor: theme.colors.redSoft,
    borderColor: theme.colors.redBorderSoft,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.xxs,
    padding: theme.spacing.md,
  },
  resetLabel: {
    color: theme.colors.red,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  resetHint: {
    color: theme.colors.red,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.micro,
    opacity: 0.72,
  },
  row: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: theme.spacing.md,
    gap: theme.spacing.xxs,
  },
  label: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  route: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.micro,
  },
});
