import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Backdrop } from "@/components/primitives/Backdrop";
import { appTheme as theme } from "@/src/design-system/theme";

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Backdrop preset="messages" />
      <View style={[styles.content, { paddingTop: insets.top + theme.spacing.lg }]}>
        <Text style={styles.placeholder}>Messages</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
});
