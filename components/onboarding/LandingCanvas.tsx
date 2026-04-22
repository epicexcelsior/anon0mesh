import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from "react-native-svg";

import { appTheme as theme } from "@/src/design-system/theme";

// Placeholder ambient mesh — deterministic node + link layout until the polish pass.
// Node and link positions are hand-placed so nothing shifts between launches.
const NODES: [number, number, number][] = [
  // [x%, y%, radius]
  [22, 18, 2.4],
  [38, 10, 3.0],
  [55, 22, 2.0],
  [72, 14, 2.6],
  [86, 30, 2.2],
  [15, 42, 3.0],
  [48, 46, 2.6],
  [80, 50, 2.4],
  [26, 66, 2.2],
  [60, 62, 3.0],
  [90, 72, 2.4],
  [12, 80, 2.2],
  [42, 88, 2.6],
  [70, 84, 2.0],
];

const LINKS: [number, number][] = [
  // Connect nodes by index — sparse graph so it reads as a mesh, not a spiderweb.
  [0, 1], [1, 2], [2, 3], [3, 4],
  [1, 6], [2, 6], [6, 7], [4, 7],
  [0, 5], [5, 6], [5, 8], [8, 9],
  [6, 9], [9, 10], [7, 10], [10, 13],
  [8, 11], [11, 12], [12, 13], [9, 12],
];

export function LandingCanvas() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, styles.bg]} />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="glow1" cx="50%" cy="30%" r="70%" fx="50%" fy="30%">
            <Stop offset="0%" stopColor={theme.colors.cyan} stopOpacity={0.16} />
            <Stop offset="100%" stopColor={theme.colors.cyan} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="glow2" cx="20%" cy="80%" r="50%">
            <Stop offset="0%" stopColor={theme.colors.purple} stopOpacity={0.10} />
            <Stop offset="100%" stopColor={theme.colors.purple} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50%" cy="30%" r="100%" fill="url(#glow1)" />
        <Circle cx="20%" cy="80%" r="80%" fill="url(#glow2)" />

        {/* Mesh links — drawn behind nodes so nodes sit on top visually */}
        {LINKS.map(([a, b], i) => (
          <Line
            key={`link-${i}`}
            x1={`${NODES[a][0]}%`}
            y1={`${NODES[a][1]}%`}
            x2={`${NODES[b][0]}%`}
            y2={`${NODES[b][1]}%`}
            stroke={theme.colors.cyanBorderSoft}
            strokeWidth={0.6}
          />
        ))}

        {/* Mesh nodes */}
        {NODES.map(([x, y, r], i) => (
          <Circle
            key={`node-${i}`}
            cx={`${x}%`}
            cy={`${y}%`}
            r={r}
            fill={theme.colors.cyan}
            opacity={0.72}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: theme.colors.background,
  },
});
