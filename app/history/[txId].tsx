import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Backdrop } from "@/components/primitives/Backdrop";
import { Icon } from "@/components/primitives/Icon";
import { IconButton } from "@/components/primitives/IconButton";
import { TxDetail } from "@/components/shared/TxDetail";
import { useTransaction } from "@/src/hooks";
import { appTheme as theme } from "@/src/design-system/theme";

export default function TxDetailScreen() {
  const router = useRouter();
  const { txId } = useLocalSearchParams<{ txId: string }>();
  const { selected: tx, loading } = useTransaction(txId);

  const preset = tx?.status === "Settled" ? "success" : "send";
  const directionTitle = tx?.direction === "send" ? "Sent" : "Received";

  return (
    <View style={styles.root}>
      <Backdrop preset={preset} />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            accessibilityLabel="Back"
            name="arrow-left"
            onPress={() => router.back()}
            size="md"
            tone="neutral"
            variant="contained"
          />

          <Text style={styles.headerTitle}>{tx ? directionTitle : "Transaction"}</Text>

          {/* Spacer */}
          <View style={styles.spacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.notFound}>
              <ActivityIndicator size="small" color={theme.colors.cyan} />
              <Text style={styles.notFoundText}>Loading transaction…</Text>
            </View>
          ) : tx ? (
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
  spacer: {
    height: 44,
    width: 44,
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
