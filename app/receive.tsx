import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Backdrop } from "@/components/primitives/Backdrop";
import { Icon } from "@/components/primitives/Icon";
import { ReceiveCard } from "@/components/shared/ReceiveCard";
import { useWallet } from "@/src/hooks";
import { appTheme as theme } from "@/src/design-system/theme";

export default function ReceiveScreen() {
  const router = useRouter();
  const { wallet, loading } = useWallet();

  return (
    <View style={styles.root}>
      <Backdrop preset="settings" />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Icon name="arrow-left" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Receive</Text>

          {/* Spacer to center title */}
          <View style={styles.backBtn} />
        </View>

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color={theme.colors.cyan} />
          ) : wallet ? (
            <ReceiveCard address={wallet.address} />
          ) : (
            <Text style={styles.errorText}>Wallet unavailable</Text>
          )}
        </View>
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
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  backBtn: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingBottom: theme.spacing.xxxl,
  },
  errorText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
});
