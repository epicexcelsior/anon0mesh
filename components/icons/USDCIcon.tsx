import React from "react";
import Svg, { Circle, Text } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export default function USDCIcon({ size = 24, color = "#2775CA" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} opacity={0.15} />
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} fill="none" />
      <Text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill={color}
      >
        $
      </Text>
    </Svg>
  );
}
