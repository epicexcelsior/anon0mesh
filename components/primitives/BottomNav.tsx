import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { LinearGradient } from "expo-linear-gradient";
import { ChatCircleDots, GearSix, House } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { appMotion, scaled } from "@/src/design-system/motion";
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
      indicatorX.value = withSpring(
        TAB_INDEX[active] * tabWidth,
        appMotion.spring.direct,
      );
    }
  }, [active, tabWidth, indicatorX]);

  const indicatorInsetX = theme.component.nav.indicatorInsetX;
  const indicatorWidth = Math.max(0, tabWidth - indicatorInsetX * 2);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value + indicatorInsetX }],
    width: indicatorWidth,
  }));

  function handleLayout(e: LayoutChangeEvent) {
    setBarWidth(e.nativeEvent.layout.width);
  }

  // Background gradient extends all the way to the bottom of the
  // screen; tabs themselves respect the safe-area inset via
  // paddingBottom so they stay clear of the Android gesture bar.
  const tabPaddingBottom = Math.max(insets.bottom, theme.spacing.sm);

  return (
    <View style={[styles.wrapper, { bottom: 0 }]}>
      <View style={styles.barShell}>
        <GlassSurface variant="soft" style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={[theme.colors.navTop, theme.colors.navBottom]}
          end={{ x: 0.9, y: 1 }}
          start={{ x: 0.1, y: 0 }}
          style={[styles.bar, { paddingBottom: tabPaddingBottom }]}
        >
          <View style={styles.innerHighlight} />
          <View onLayout={handleLayout} style={styles.tabRow}>
            <Animated.View style={[styles.indicator, indicatorStyle]}>
              <LinearGradient
                colors={[theme.colors.navIndicatorTop, theme.colors.navIndicatorBottom]}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={styles.indicatorFill}
              />
              <View style={styles.indicatorGlow} />
            </Animated.View>
            {TABS.map(({ id, label, Icon }) => {
              const isActive = id === active;
              return (
                <TabButton
                  key={id}
                  Icon={Icon}
                  isActive={isActive}
                  label={label}
                  onPress={() => onSelect?.(id)}
                />
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}



interface TabButtonProps {
  Icon: React.ComponentType<{ size?: number; weight?: "fill" | "regular"; color?: string }>;
  isActive: boolean;
  label: string;
  onPress: () => void;
}

function TabButton({ Icon, isActive, label, onPress }: TabButtonProps) {
  const pressed = useSharedValue(0);

  const handlePressIn = () => {
    haptics.tap();
    sound.tabTap();
    pressed.value = withTiming(1, {
      duration: scaled(appMotion.duration.press),
      easing: appMotion.easing.standard,
    });
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, appMotion.spring.pressRelease);
  };

  const shellStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pressed.value, [0, 1], [1, 0.94]) },
    ],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      hitSlop={4}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tab, isActive && styles.tabActive]}
    >
      <Animated.View style={[styles.tabInner, shellStyle]}>
        <Icon
          size={18}
          weight={isActive ? "fill" : "regular"}
          color={isActive ? theme.colors.cyan : theme.colors.textMuted}
        />
        <Text style={[styles.label, isActive && styles.labelActive]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
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
    borderColor: theme.colors.cyanBorderSoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    bottom: theme.component.nav.indicatorInsetY,
    left: 0,
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
    flex: 1,
  },
  tabInner: {
    alignItems: "center",
    borderRadius: theme.radius.lg,
    flex: 1,
    gap: 2,
    justifyContent: "center",
    minHeight: theme.component.nav.tabMinHeight,
    paddingVertical: 2,
  },
  tabActive: {},
  label: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  labelActive: { color: theme.colors.cyan },
});
