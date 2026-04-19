import SolanaIcon from "@/components/icons/SolanaIcon";
import USDCIcon from "@/components/icons/USDCIcon";
import * as haptics from "@/src/design-system/haptics";
import { Backspace, CaretDown } from "phosphor-react-native";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { appMotion } from "@/src/design-system/motion";
import { appTheme as theme } from "@/src/design-system/theme";

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "⌫"],
] as const;

const MAX_DIGITS = 10;

interface NumericKeypadProps {
  accessory?: React.ReactNode;
  currency: string;
  fiatLabel?: string;
  maxAmount?: string;
  onChangeValue: (value: string) => void;
  onPressCurrency?: () => void;
  showMaxChip?: boolean;
  value: string;
}

export default function NumericKeypad({
  accessory,
  currency,
  fiatLabel,
  maxAmount,
  onChangeValue,
  onPressCurrency,
  showMaxChip = true,
  value,
}: NumericKeypadProps) {
  const handleKey = useCallback(
    (key: string) => {
      haptics.lightPress();

      if (key === "⌫") {
        onChangeValue(value.length <= 1 ? "0" : value.slice(0, -1));
        return;
      }

      if (key === ".") {
        if (value.includes(".")) return;
        onChangeValue(value + ".");
        return;
      }

      if (value === "0") {
        onChangeValue(key);
        return;
      }

      if (value.length >= MAX_DIGITS) return;

      const parts = (value + key).split(".");
      if (parts[1] && parts[1].length > 2) return;

      onChangeValue(value + key);
    },
    [onChangeValue, value],
  );

  function handleUseMax() {
    if (!maxAmount) return;
    haptics.mediumPress();
    onChangeValue(maxAmount);
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.heroRow}>
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.amountValue}>
            {value === "0" ? "0" : value}
          </Text>
          {onPressCurrency ? (
            <Pressable hitSlop={12} onPress={() => { haptics.tap(); onPressCurrency(); }}>
              {({ pressed }) => (
                <View style={[styles.tokenButton, pressed && styles.tokenButtonPressed]}>
                  <CurrencyIcon symbol={currency} size={18} />
                  <Text style={styles.tokenButtonLabel}>{currency}</Text>
                  <CaretDown color={theme.colors.cyan} size={14} weight="bold" />
                </View>
              )}
            </Pressable>
          ) : (
            <View style={styles.tokenButtonStatic}>
              <CurrencyIcon symbol={currency} size={18} />
              <Text style={styles.tokenButtonLabel}>{currency}</Text>
            </View>
          )}
        </View>
        {fiatLabel ? <Text style={styles.amountFiat}>{fiatLabel}</Text> : null}
      </View>

      {showMaxChip && maxAmount ? (
        <View style={styles.chipRow}>
          <Pressable
            onPress={handleUseMax}
            style={({ pressed }) => [styles.useMaxChip, pressed && styles.useMaxChipPressed]}
          >
            <Text style={styles.useMaxText}>Use max</Text>
          </Pressable>
        </View>
      ) : null}

      {accessory}

      <View style={styles.grid}>
        {KEYS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key) => <KeyButton key={key} label={key} onPress={handleKey} />)}
          </View>
        ))}
      </View>
    </View>
  );
}

function CurrencyIcon({ symbol, size = 24 }: { symbol: string; size?: number }) {
  if (symbol === "SOL") return <SolanaIcon size={size} color={theme.colors.textSecondary} />;
  if (symbol === "USDC") return <USDCIcon size={size} />;
  return null;
}

function KeyButton({ label, onPress }: { label: string; onPress: (key: string) => void }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  function handlePress() {
    const { compression } = appMotion.press;
    scale.value = withSequence(
      withTiming(compression.scale, { duration: 45, easing: appMotion.easing.exit }),
      withTiming(1, { duration: appMotion.duration.instant, easing: appMotion.easing.standard }),
    );
    translateY.value = withSequence(
      withTiming(compression.translateY, { duration: 45 }),
      withTiming(0, { duration: appMotion.duration.instant }),
    );
    opacity.value = withSequence(
      withTiming(0.7, { duration: 40 }),
      withTiming(1, { duration: 120 }),
    );
    onPress(label);
  }

  return (
    <Pressable onPress={handlePress} style={styles.keyPressable}>
      <Animated.View style={[styles.keyFace, animatedStyle]}>
        {label === "⌫" ? (
          <Backspace color={theme.colors.textPrimary} size={24} weight="regular" />
        ) : (
          <Text style={[styles.keyLabel, label === "." && styles.keyLabelDot]}>{label}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.md },
  heroSection: { alignItems: "center", gap: theme.spacing.xs, paddingHorizontal: theme.spacing.lg },
  heroRow: { alignItems: "center", flexDirection: "row", gap: theme.spacing.md, justifyContent: "center" },
  amountValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.heroXl,
    flexShrink: 1,
    letterSpacing: -2.4,
    textAlign: "center",
  },
  amountFiat: { color: theme.colors.textTertiary, fontFamily: theme.fonts.body, fontSize: theme.type.body },
  tokenButton: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderColor: "rgba(0, 218, 243, 0.22)",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    minHeight: 36,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  tokenButtonPressed: { backgroundColor: "rgba(0, 218, 243, 0.16)", transform: [{ scale: 0.96 }] },
  tokenButtonStatic: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderColor: "rgba(0, 218, 243, 0.22)",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    minHeight: 36,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  tokenButtonLabel: { color: theme.colors.textPrimary, fontFamily: theme.fonts.bodyMedium, fontSize: theme.type.body },
  chipRow: { alignItems: "center" },
  useMaxChip: {
    backgroundColor: theme.colors.cyanSoft,
    borderColor: "rgba(0, 218, 243, 0.18)",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
  },
  useMaxChipPressed: { opacity: 0.8 },
  useMaxText: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  grid: { gap: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
  row: { flexDirection: "row", gap: theme.spacing.sm },
  keyPressable: { flex: 1 },
  keyFace: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
  },
  keyLabel: { color: theme.colors.textPrimary, fontFamily: theme.fonts.heading, fontSize: theme.type.title },
  keyLabelDot: { fontSize: theme.type.display, lineHeight: theme.type.display + 4 },
});
