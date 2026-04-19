import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import * as sound from "@/src/design-system/sound";
import { LinearGradient } from "expo-linear-gradient";
import React, { forwardRef, useCallback, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { appMotion } from "@/src/design-system/motion";
import { appTheme as theme } from "@/src/design-system/theme";

interface SheetProps {
  children: React.ReactNode;
  contentBottomInset?: number;
  snapPoints?: number[];
  title?: string;
}

export const Sheet = forwardRef<BottomSheet, SheetProps>(function Sheet(
  { children, contentBottomInset = 0, snapPoints, title },
  ref,
) {
  const previousIndexRef = useRef(-1);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleChange = useCallback((nextIndex: number) => {
    sound.playSheetTransition(previousIndexRef.current, nextIndex);
    previousIndexRef.current = nextIndex;
  }, []);

  return (
    <BottomSheet
      animationConfigs={appMotion.spring.sheet}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bg}
      enablePanDownToClose
      handleIndicatorStyle={styles.handle}
      index={-1}
      onChange={handleChange}
      ref={ref}
      enableDynamicSizing={!snapPoints}
      snapPoints={snapPoints}
    >
      <BottomSheetView style={styles.contentWrap}>
        <LinearGradient
          colors={[theme.colors.surfaceListTop, theme.colors.surfaceUtilityBottom]}
          end={{ x: 0.92, y: 1 }}
          start={{ x: 0.08, y: 0 }}
          style={[
            styles.content,
            { paddingBottom: theme.component.sheet.contentBottomBase + contentBottomInset },
          ]}
        >
          <View style={styles.highlight} />
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {children}
        </LinearGradient>
      </BottomSheetView>
    </BottomSheet>
  );
});

export function SheetRow({
  detail,
  label,
  tone,
}: {
  detail: string;
  label: string;
  tone?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowDetail, tone ? { color: tone } : undefined]}>
        {detail}
      </Text>
    </View>
  );
}

export function SheetButton({
  label,
  onPress,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "danger" | "secondary";
}) {
  const bgStyle =
    variant === "danger"
      ? styles.btnDanger
      : variant === "secondary"
        ? styles.btnSecondary
        : styles.btnPrimary;
  const textStyle =
    variant === "danger"
      ? styles.btnDangerText
      : variant === "secondary"
        ? styles.btnSecondaryText
        : styles.btnPrimaryText;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, bgStyle, pressed && styles.btnPressed]}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: "transparent",
    borderTopLeftRadius: theme.component.sheet.topRadius,
    borderTopRightRadius: theme.component.sheet.topRadius,
  },
  handle: {
    backgroundColor: theme.colors.textMuted,
    width: theme.component.sheet.handleWidth,
  },
  contentWrap: {
    paddingBottom: theme.spacing.xxs,
  },
  content: {
    gap: theme.spacing.lg,
    overflow: "hidden",
    paddingHorizontal: theme.component.sheet.paddingX,
    paddingTop: theme.component.sheet.paddingTop,
    position: "relative",
  },
  highlight: {
    backgroundColor: theme.depth.restHighlight,
    height: 1,
    left: theme.component.sheet.highlightInset,
    position: "absolute",
    right: theme.component.sheet.highlightInset,
    top: 0,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.section,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
  },
  rowLabel: {
    color: theme.colors.textTertiary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  rowDetail: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
    maxWidth: "55%",
    textAlign: "right",
  },
  btn: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    justifyContent: "center",
    minHeight: theme.component.sheet.actionMinHeight,
    paddingHorizontal: theme.spacing.lg,
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  btnPrimary: {
    backgroundColor: theme.colors.cyan,
  },
  btnPrimaryText: {
    color: theme.colors.textOnAccent,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.body,
  },
  btnDanger: {
    backgroundColor: theme.colors.errorContainer,
    borderColor: theme.colors.errorOutline,
    borderWidth: 1,
  },
  btnDangerText: {
    color: theme.colors.red,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  btnSecondary: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.lineStrong,
    borderWidth: 1,
  },
  btnSecondaryText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
});
