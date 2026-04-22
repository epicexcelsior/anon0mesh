import React from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { SignalBars } from "@/components/primitives/SignalBars";
import { Pill } from "@/components/primitives/Pill";
import type { PillTone } from "@/components/primitives/Pill";
import { PressSurface } from "@/components/primitives/PressSurface";
import { useMesh } from "@/src/hooks/useMesh";
import type { ConnectionState } from "@/src/hooks/useMesh";
import { appTheme as theme } from "@/src/design-system/theme";

const STRIP_HEIGHT = theme.spacing.xxxl; // 32px — matches theme token

function stateTone(state: ConnectionState): PillTone {
  switch (state) {
    case "Live":
      return "green";
    case "Silent":
      return "amber";
    case "Offline":
      return "neutral";
  }
}

function stateSignalStrength(state: ConnectionState): 0 | 1 | 2 | 3 | 4 {
  switch (state) {
    case "Live":
      return 3;
    case "Silent":
      return 1;
    case "Offline":
      return 0;
    default:
      return 0;
  }
}

function stateSignalColor(state: ConnectionState): string {
  switch (state) {
    case "Live":
      return theme.colors.green;
    case "Silent":
      return theme.colors.amber;
    case "Offline":
      return theme.colors.textMuted;
    default:
      return theme.colors.textMuted;
  }
}

export function MeshStatusStrip() {
  const router = useRouter();
  const { nodeCount, connectionState, bleError } = useMesh();

  const tone = bleError ? "red" : stateTone(connectionState);
  const signalStrength = bleError ? 0 : stateSignalStrength(connectionState);
  const signalColor = bleError ? theme.colors.red : stateSignalColor(connectionState);
  const pillLabel = bleError ? "BLE Error" : connectionState;

  return (
    <PressSurface
      accessibilityLabel={bleError ? "BLE error, 0 nodes" : `${nodeCount} ${nodeCount === 1 ? "node" : "nodes"}, ${connectionState}`}
      onPress={() => router.push("/peers" as Parameters<typeof router.push>[0])}
      style={styles.touchable}
      variant="strip"
    >
      <GlassSurface variant="soft" style={styles.strip}>
        <SignalBars
          strength={signalStrength}
          size={14}
          activeColor={signalColor}
        />
        <Text style={styles.nodeCount}>
          {bleError ? "0 nodes" : `${nodeCount} ${nodeCount === 1 ? "node" : "nodes"}`}
        </Text>
        <Pill label={pillLabel} tone={tone} style={styles.pill} />
      </GlassSurface>
    </PressSurface>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: "100%",
    height: STRIP_HEIGHT,
    zIndex: 10,
  },
  strip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderRadius: 0,
    // push pill to the right
    justifyContent: "flex-start",
  },
  nodeCount: {
    flex: 1,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.micro,
    letterSpacing: 0.4,
  },
  pill: {
    // compact pill — no extra style overrides needed
  },
});
