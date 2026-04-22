import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Backdrop } from "@/components/primitives/Backdrop";
import type { BackdropPreset } from "@/components/primitives/Backdrop";
import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { appTheme as theme } from "@/src/design-system/theme";

interface SendScaffoldProps {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  eyebrow?: string;
  footer?: React.ReactNode;
  onBack?: () => void;
  preset?: BackdropPreset;
  showBack?: boolean;
  step?: number;
  subtitle?: string;
  title: string;
  totalSteps?: number;
  trailing?: React.ReactNode;
}

function formatStep(step: number, totalSteps: number) {
  return `${String(step).padStart(2, "0")} / ${String(totalSteps).padStart(2, "0")}`;
}

export function SendScaffold({
  children,
  contentStyle,
  eyebrow,
  footer,
  onBack,
  preset = "send",
  showBack = true,
  step,
  subtitle,
  title,
  totalSteps = 3,
  trailing,
}: SendScaffoldProps) {
  const resolvedEyebrow =
    eyebrow ?? (step ? `Transfer ${formatStep(step, totalSteps)}` : "Transfer receipt");

  return (
    <View style={styles.root}>
      <Backdrop animated preset={preset} />

      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.header}>
          {showBack ? (
            <TouchableOpacity
              accessibilityLabel="Back"
              accessibilityRole="button"
              activeOpacity={0.8}
              hitSlop={8}
              onPress={onBack}
              style={styles.navButton}
            >
              <Icon color={theme.colors.textPrimary} name="arrow-left" size={18} />
            </TouchableOpacity>
          ) : (
            <View style={styles.navSpacer} />
          )}

          {trailing ?? (step ? <Pill label={formatStep(step, totalSteps)} tone="neutral" /> : <View style={styles.navSpacer} />)}
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>{resolvedEyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={[styles.content, contentStyle]}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },
  navButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  navSpacer: {
    height: 40,
    width: 40,
  },
  intro: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.display,
    fontSize: theme.type.title,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.55,
    maxWidth: 360,
    paddingTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  footer: {
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
});
