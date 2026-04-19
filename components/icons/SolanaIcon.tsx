import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export default function SolanaIcon({ size = 24, color = "#9945FF" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} opacity={0.15} />
      <Path
        d="M7 8.5h8.5a.5.5 0 01.35.85l-1.5 1.5H7V8.5zM7 11.15h7.5l-1.5 1.5H7v-1.5zM7 13.65h6l1.5 1.5a.5.5 0 01-.35.85H7v-2.35z"
        fill={color}
      />
    </Svg>
  );
}
