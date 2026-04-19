import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

import { appTheme as theme } from "@/src/design-system/theme";

// Placeholder ambient background — node-particle mesh animation deferred to polish pass.
export function LandingCanvas() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, styles.bg]} />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="glow1" cx="50%" cy="35%" r="55%" fx="50%" fy="35%">
            <Stop offset="0%" stopColor={theme.colors.cyan} stopOpacity={0.12} />
            <Stop offset="100%" stopColor={theme.colors.cyan} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="glow2" cx="20%" cy="75%" r="40%">
            <Stop offset="0%" stopColor={theme.colors.purple} stopOpacity={0.08} />
            <Stop offset="100%" stopColor={theme.colors.purple} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="glow3" cx="80%" cy="70%" r="35%">
            <Stop offset="0%" stopColor={theme.colors.green} stopOpacity={0.06} />
            <Stop offset="100%" stopColor={theme.colors.green} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50%" cy="35%" r="100%" fill="url(#glow1)" />
        <Circle cx="20%" cy="75%" r="80%" fill="url(#glow2)" />
        <Circle cx="80%" cy="70%" r="70%" fill="url(#glow3)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: theme.colors.background,
  },
});
