import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { TechDrawerContent } from "@/components/onboarding/TechDrawerContent";
import * as haptics from "@/src/design-system/haptics";
import { appTheme as theme } from "@/src/design-system/theme";

export default function TechDrawerScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <GlassSurface variant="strong" style={styles.surface}>
        <View style={styles.header}>
          <View style={styles.handle} />
          <Pressable
            accessibilityLabel="Close technical overview"
            accessibilityRole="button"
            onPress={() => {
              haptics.tap();
              router.back();
            }}
            style={styles.closeBtn}
          >
            <Text style={styles.closeLabel}>Close</Text>
          </Pressable>
        </View>
        <TechDrawerContent />
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.scrim,
    justifyContent: "flex-end",
  },
  surface: {
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    flex: 0.85,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.lineStrong,
  },
  closeBtn: {
    padding: theme.spacing.sm,
  },
  closeLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
});
