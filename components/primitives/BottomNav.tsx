import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { LinearGradient } from "expo-linear-gradient";
import { ChatCircleDots, GearSix, House } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { appMotion } from "@/src/design-system/motion";
import { appTheme as theme } from "@/src/design-system/theme";

export type AppTab = "home" | "messages" | "settings";

const TABS = [
  { id: "home", label: "Home", Icon: House },
  { id: "messages", label: "Messages", Icon: ChatCircleDots },
  { id: "settings", label: "Settings", Icon: GearSix },
] as const;

const TAB_INDEX: Record<AppTab, number> = {
  home: 0,
  messages: 1,
  settings: 2,
};

interface BottomNavProps {
  active: AppTab;
  onSelect?: (tab: AppTab) => void;
}

export default function BottomNav({ active, onSelect }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const indicatorX = useSharedValue(0);

  const tabWidth = barWidth > 0 ? barWidth / TABS.length : 0;

  useEffect(() => {
    if (tabWidth > 0) {
      indicatorX.value = withTiming(TAB_INDEX[active] * tabWidth, {
        duration: appMotion.duration.standard,
        easing: appMotion.easing.standard,
      });
    }
  }, [active, tabWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: tabWidth,
  }));

  function handleLayout(e: LayoutChangeEvent) {
    setBarWidth(e.nativeEvent.layout.width);
  }

  return (
    <View
      style={[
        styles.wrapper,
        { bottom: theme.component.nav.minimumBottomOffset },
      ]}
    >
      <View style={styles.barShell}>
        <GlassSurface variant="soft" style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={["rgba(15, 26, 30, 0.96)", "rgba(5, 10, 10, 0.98)"]}
          end={{ x: 0.9, y: 1 }}
          start={{ x: 0.1, y: 0 }}
          style={[
            styles.bar,
            { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) },
          ]}
        >
          <View style={styles.innerHighlight} />
          <Animated.View style={[styles.indicator, indicatorStyle]}>
            <LinearGradient
              colors={["rgba(34, 211, 238, 0.18)", "rgba(34, 211, 238, 0.08)"]}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.indicatorFill}
            />
            <View style={styles.indicatorGlow} />
          </Animated.View>
          <View onLayout={handleLayout} style={styles.tabRow}>
            {TABS.map(({ id, label, Icon }) => {
              const isActive = id === active;
              return (
                <Pressable
                  key={id}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => {
                    haptics.tap();
                    sound.tabTap();
                    onSelect?.(id);
                  }}
                  style={[styles.tab, isActive && styles.tabActive]}
                >
                  <Icon
                    size={20}
                    weight={isActive ? "fill" : "regular"}
                    color={isActive ? theme.colors.cyan : theme.colors.textMuted}
                  />
                  <Text style={[styles.label, isActive && styles.labelActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    left: theme.component.nav.wrapperInset,
    position: "absolute",
    right: theme.component.nav.wrapperInset,
    zIndex: 20,
  },
  barShell: {
    borderColor: theme.colors.line,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  bar: {
    minHeight: theme.component.nav.barHeight,
    overflow: "hidden",
    paddingHorizontal: theme.component.nav.paddingX,
    paddingTop: theme.component.nav.paddingY,
    position: "relative",
  },
  innerHighlight: {
    backgroundColor: theme.depth.restHighlight,
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  indicator: {
    borderColor: "rgba(34, 211, 238, 0.16)",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    bottom: theme.component.nav.indicatorInsetY,
    left: theme.component.nav.indicatorInsetX,
    overflow: "hidden",
    position: "absolute",
    top: theme.component.nav.indicatorInsetY,
  },
  indicatorFill: { ...StyleSheet.absoluteFillObject },
  indicatorGlow: {
    backgroundColor: theme.depth.restHighlight,
    height: 1,
    left: theme.component.nav.indicatorGlowInset,
    position: "absolute",
    right: theme.component.nav.indicatorGlowInset,
    top: 0,
  },
  tabRow: { flexDirection: "row" },
  tab: {
    alignItems: "center",
    borderRadius: theme.radius.lg,
    flex: 1,
    gap: theme.spacing.xs,
    justifyContent: "center",
    minHeight: theme.component.nav.tabMinHeight,
    paddingVertical: theme.spacing.xs,
  },
  tabActive: {},
  label: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  labelActive: { color: theme.colors.cyan },
});
