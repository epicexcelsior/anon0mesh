import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import * as haptics from "@/src/design-system/haptics";
import { appMotion } from "@/src/design-system/motion";
import { appTheme as theme } from "@/src/design-system/theme";

interface Segment {
  id: string;
  label: string;
}

export type SegmentedControlTone = "cyan" | "purple";

interface SegmentedControlProps {
  segments: Segment[];
  selected: string;
  onSelect: (id: string) => void;
  tone?: SegmentedControlTone;
}

const TONE_ACTIVE: Record<SegmentedControlTone, string> = {
  cyan: theme.colors.cyan,
  purple: theme.colors.purple,
};

const TONE_THUMB_BORDER: Record<SegmentedControlTone, string> = {
  cyan: theme.colors.cyanBorderSoft,
  purple: theme.colors.purpleBorderSoft,
};

export function SegmentedControl({
  segments,
  selected,
  onSelect,
  tone = "cyan",
}: SegmentedControlProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const segmentWidth = containerWidth > 0 ? containerWidth / segments.length : 0;
  const selectedIndex = segments.findIndex((s) => s.id === selected);
  const translateX = useSharedValue(0);

  function handleLayout(e: LayoutChangeEvent) {
    setContainerWidth(e.nativeEvent.layout.width);
  }

  function handleSelect(id: string, index: number) {
    haptics.tap();
    translateX.value = withTiming(index * segmentWidth, {
      duration: appMotion.duration.standard,
      easing: appMotion.easing.standard,
    });
    onSelect(id);
  }

  useEffect(() => {
    translateX.value = withTiming(selectedIndex * segmentWidth, {
      duration: appMotion.duration.standard,
      easing: appMotion.easing.standard,
    });
  }, [segmentWidth, selectedIndex, translateX]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value + theme.spacing.xs }],
    width: Math.max(segmentWidth - theme.spacing.sm, 0),
  }));

  const activeColor = TONE_ACTIVE[tone];
  const thumbBorderColor = TONE_THUMB_BORDER[tone];

  return (
    <View style={styles.track} onLayout={handleLayout}>
      <Animated.View
        style={[styles.thumb, thumbStyle, { borderColor: thumbBorderColor }]}
      />
      {segments.map(({ id, label }, index) => {
        const isActive = id === selected;
        return (
          <Pressable
            key={id}
            onPress={() => handleSelect(id, index)}
            style={styles.segment}
          >
            <Text
              style={[
                styles.label,
                isActive && { color: activeColor, fontFamily: theme.fonts.headingBold },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    height: 52,
    overflow: "hidden",
    padding: theme.spacing.xs,
    position: "relative",
  },
  thumb: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    bottom: theme.spacing.xs,
    left: 0,
    position: "absolute",
    top: theme.spacing.xs,
  },
  segment: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
  },
  label: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
