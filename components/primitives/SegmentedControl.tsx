import React, { useState } from "react";
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

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: selectedIndex * segmentWidth }],
    width: segmentWidth,
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
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    height: 36,
    overflow: "hidden",
    position: "relative",
  },
  thumb: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    height: "100%",
    position: "absolute",
  },
  segment: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
  },
  label: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
  },
  labelActive: {
    color: theme.colors.textPrimary,
  },
});
