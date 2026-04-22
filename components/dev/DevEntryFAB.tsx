// Dev-only floating entry to the /dev catalog. Never renders in production.
import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { IconButton } from "@/components/primitives/IconButton";
import { appTheme as theme } from "@/src/design-system/theme";

export function DevEntryFAB() {
  const router = useRouter();
  if (!__DEV__) return null;

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <IconButton
        accessibilityLabel="Open dev catalog"
        name="code"
        onPress={() => router.push("/dev" as Parameters<typeof router.push>[0])}
        size="sm"
        tone="purple"
        variant="contained"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    bottom: theme.component.nav.barHeight + theme.spacing.md,
    position: "absolute",
    right: theme.spacing.md,
    zIndex: 30,
  },
});
