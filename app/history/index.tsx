import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Backdrop } from "@/components/primitives/Backdrop";
import { IconButton } from "@/components/primitives/IconButton";
import { HistoryList } from "@/components/home/HistoryList";
import { useTransaction } from "@/src/hooks";
import { appTheme as theme } from "@/src/design-system/theme";

export default function HistoryScreen() {
  const router = useRouter();
  const { transactions } = useTransaction();

  return (
    <View style={styles.root}>
      <Backdrop preset="settings" />

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

          <Text style={styles.headerTitle}>History</Text>

          {/* Spacer */}
          <View style={styles.spacer} />
        </View>

        <HistoryList transactions={transactions} />
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
});
