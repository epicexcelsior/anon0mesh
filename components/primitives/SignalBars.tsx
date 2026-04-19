import React from "react";
import { StyleSheet, View } from "react-native";

import { appTheme as theme } from "@/src/design-system/theme";

interface SignalBarsProps {
  strength: 0 | 1 | 2 | 3 | 4;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
}

export function SignalBars({
  strength,
  size = 16,
  activeColor = theme.colors.green,
  inactiveColor = theme.colors.surfaceContainerHigh,
}: SignalBarsProps) {
  const barHeights = [0.35, 0.55, 0.72, 1.0];
  const gap = Math.round(size * 0.12);
  const barWidth = Math.round(size * 0.18);

  return (
    <View style={[styles.row, { height: size, gap }]}>
      {barHeights.map((heightRatio, i) => {
        const barHeight = Math.round(size * heightRatio);
        const isActive = i < strength;
        return (
          <View
            key={i}
            style={{
              width: barWidth,
              height: barHeight,
              borderRadius: 2,
              backgroundColor: isActive ? activeColor : inactiveColor,
              alignSelf: "flex-end",
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-end",
    flexDirection: "row",
  },
});
