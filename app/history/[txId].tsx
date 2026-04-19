import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Backdrop } from "@/components/primitives/Backdrop";
import { Icon } from "@/components/primitives/Icon";
import { TxDetail } from "@/components/shared/TxDetail";
import { useTransaction } from "@/src/hooks";
import { appTheme as theme } from "@/src/design-system/theme";

export default function TxDetailScreen() {
  const router = useRouter();
  const { txId } = useLocalSearchParams<{ txId: string }>();
  const { transactions } = useTransaction();

  const tx = transactions.find((t) => t.id === txId);

  const preset = tx?.status === "Settled" ? "success" : "send";
  const directionTitle = tx?.direction === "send" ? "Sent" : "Received";

  return (
    <View style={styles.root}>
      <Backdrop preset={preset} />

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

          <Text style={styles.headerTitle}>{tx ? directionTitle : "Transaction"}</Text>

          {/* Spacer */}
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {tx ? (
            <TxDetail tx={tx} />
          ) : (
            <View style={styles.notFound}>
              <Icon name="alert-circle" size={28} color={theme.colors.textMuted} />
              <Text style={styles.notFoundText}>Transaction not found</Text>
            </View>
          )}
        </ScrollView>
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
    paddingBottom: theme.spacing.xxxl,
    paddingTop: theme.spacing.lg,
  },
  notFound: {
    alignItems: "center",
    gap: theme.spacing.sm,
    justifyContent: "center",
    paddingVertical: theme.spacing.huge,
  },
  notFoundText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
});
