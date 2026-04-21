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

interface SegmentedControlProps {
  segments: Segment[];
  selected: string;
  onSelect: (id: string) => void;
}

export function SegmentedControl({ segments, selected, onSelect }: SegmentedControlProps) {
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

  return (
    <View style={styles.track} onLayout={handleLayout}>
      <Animated.View style={[styles.thumb, thumbStyle]} />
      {segments.map(({ id, label }, index) => {
        const isActive = id === selected;
        return (
          <Pressable
            key={id}
            onPress={() => handleSelect(id, index)}
            style={styles.segment}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
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
    height: 40,
    overflow: "hidden",
    padding: theme.spacing.xs,
    position: "relative",
  },
  thumb: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.line,
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
    fontSize: theme.type.caption,
    letterSpacing: 0.4,
  },
  labelActive: {
    color: theme.colors.cyan,
  },
});
