import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { VP } from "@/constants/void-protocol";

interface VoidCardProps extends ViewProps {
  /** Elevated surface color (slightly lighter). Default false. */
  elevated?: boolean;
  children: React.ReactNode;
}

export default function VoidCard({
  elevated = false,
  children,
  style,
  ...rest
}: VoidCardProps) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: VP.colors.surface,
    borderRadius: VP.radius.md,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
    padding: VP.spacing.md,
  },
  elevated: {
    backgroundColor: VP.colors.surfaceElevated,
  },
});
