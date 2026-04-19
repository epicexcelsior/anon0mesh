import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { SignalBars } from "@/components/primitives/SignalBars";
import { Pill } from "@/components/primitives/Pill";
import type { PillTone } from "@/components/primitives/Pill";
import { useMesh } from "@/src/hooks/useMesh";
import type { ConnectionState } from "@/src/hooks/useMesh";
import { appTheme as theme } from "@/src/design-system/theme";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any;

const STRIP_HEIGHT = 32;

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
  const { nodeCount, connectionState } = useMesh();

  const tone = stateTone(connectionState);
  const signalStrength = stateSignalStrength(connectionState);
  const signalColor = stateSignalColor(connectionState);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => router.push("/peers" as AnyHref)}
      style={styles.touchable}
    >
      <GlassSurface variant="soft" style={styles.strip}>
        <SignalBars
          strength={signalStrength}
          size={14}
          activeColor={signalColor}
        />
        <Text style={styles.nodeCount}>
          {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
        </Text>
        <Pill label={connectionState} tone={tone} style={styles.pill} />
      </GlassSurface>
    </TouchableOpacity>
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
