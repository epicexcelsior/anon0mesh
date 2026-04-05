import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VP } from "@/constants/void-protocol";

interface VoidScreenProps extends ViewProps {
  /** Use SafeAreaView (default true). Set false for screens that manage their own insets. */
  safe?: boolean;
  children: React.ReactNode;
}

export default function VoidScreen({
  safe = true,
  children,
  style,
  ...rest
}: VoidScreenProps) {
  const Container = safe ? SafeAreaView : View;
  return (
    <Container style={[styles.screen, style]} {...rest}>
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: VP.colors.void,
  },
});
