import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { VP } from "@/constants/void-protocol";

type TypographyVariant = keyof typeof VP.typography;

interface VoidTextProps extends TextProps {
  /** Typography variant from Void Protocol. Default "body". */
  variant?: TypographyVariant;
  /** Text color override. Defaults to VP.colors.text.primary. */
  color?: string;
  /** Shorthand: use secondary text color. */
  secondary?: boolean;
  children: React.ReactNode;
}

export default function VoidText({
  variant = "body",
  color,
  secondary = false,
  style,
  children,
  ...rest
}: VoidTextProps) {
  const typographyStyle = VP.typography[variant] as TextStyle;
  const textColor =
    color ?? (secondary ? VP.colors.text.secondary : VP.colors.text.primary);

  return (
    <Text
      style={[typographyStyle, { color: textColor }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}
