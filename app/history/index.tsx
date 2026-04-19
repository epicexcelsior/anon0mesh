import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Backdrop } from "@/components/primitives/Backdrop";
import { Icon } from "@/components/primitives/Icon";
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
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Icon name="arrow-left" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>History</Text>

          {/* Spacer */}
          <View style={styles.backBtn} />
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
});
