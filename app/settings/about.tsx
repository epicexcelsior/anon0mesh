import React from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Backdrop } from "@/components/primitives/Backdrop";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { appTheme as theme } from "@/src/design-system/theme";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  function handleGitHub() {
    Alert.alert("Coming Soon", "GitHub link coming soon.");
  }

  function handleLicenses() {
    Alert.alert("Coming Soon", "License viewer coming soon.");
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="settings" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <TouchableOpacity accessibilityLabel="Back" accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App info card */}
        <GlassSurface variant="regular" style={styles.appCard}>
          <Image
            source={require("@/assets/brand/anonmesh-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>AnonMesh</Text>
          <Text style={styles.versionText}>v3-full (dev)</Text>
          <Text style={styles.buildText}>Build: 2026-04-18</Text>
        </GlassSurface>

        {/* Tech description */}
        <View style={styles.section}>
          <SectionLabel label="Technology" />
          <GlassSurface variant="regular" style={styles.techCard}>
            <Text style={styles.techText}>
              AnonMesh uses LXMF/Reticulum for mesh messaging, Bluetooth LE for local peer
              discovery, and Solana for on-chain settlement with stealth addresses.
            </Text>
          </GlassSurface>
        </View>

        {/* Links section */}
        <View style={styles.section}>
          <SectionLabel label="Links" />
          <GlassSurface variant="regular" style={styles.linksCard}>
            <TouchableOpacity
              accessibilityLabel="View on GitHub"
              accessibilityRole="button"
              style={[styles.linkRow, styles.linkRowBordered]}
              onPress={handleGitHub}
              activeOpacity={0.7}
            >
              <View style={styles.linkIconWrap}>
                <Icon name="github" size={18} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.linkLabel}>View on GitHub</Text>
              <Icon name="external-link" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityLabel="Licenses"
              accessibilityRole="button"
              style={styles.linkRow}
              onPress={handleLicenses}
              activeOpacity={0.7}
            >
              <View style={styles.linkIconWrap}>
                <Icon name="file-text" size={18} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.linkLabel}>Licenses</Text>
              <Icon name="chevron-right" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </GlassSurface>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          AnonMesh — Private mesh payments on Solana
        </Text>
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
  appCard: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },
  logo: {
    height: 64,
    width: 64,
  },
  appName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.title,
  },
  versionText: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  buildText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  section: {
    gap: theme.spacing.xs,
  },
  techCard: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  techText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.6,
  },
  linksCard: {
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  linkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  linkRowBordered: {
    borderBottomColor: theme.colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  linkIconWrap: {
    alignItems: "center",
    flexShrink: 0,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  linkLabel: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  footer: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    paddingHorizontal: theme.spacing.xs,
    textAlign: "center",
  },
});
