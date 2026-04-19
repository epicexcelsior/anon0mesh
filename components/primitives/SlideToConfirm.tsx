import * as haptics from "@/src/design-system/haptics";
import * as sound from "@/src/design-system/sound";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "phosphor-react-native";
import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { appMotion } from "@/src/design-system/motion";
import { appTheme as theme } from "@/src/design-system/theme";

const TRACK_HEIGHT = theme.component.slider.trackHeight;
const TRACK_RADIUS = theme.component.slider.trackRadius;
const KNOB_SIZE = theme.component.slider.knobSize;
const KNOB_RADIUS = theme.component.slider.knobRadius;
const KNOB_INSET = theme.component.slider.knobInset;
const THRESHOLD = theme.component.slider.threshold;
const MAGNET_START = theme.component.slider.magnetStart;
const RESISTANCE_START = theme.component.slider.resistanceStart;

interface SlideToConfirmProps {
  label: string;
  onComplete: () => void;
}

export default function SlideToConfirm({ label, onComplete }: SlideToConfirmProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);
  const engagement = useSharedValue(0);
  const crossedRef = useSharedValue(false);
  const maxTranslate = Math.max(trackWidth - KNOB_SIZE - KNOB_INSET * 2, 0);

  function fireThreshold() {
    haptics.lightPress();
    sound.sliderThreshold();
  }

  function fireConfirm() {
    haptics.mediumPress();
    sound.sliderConfirm();
    onComplete();
  }

  const pan = Gesture.Pan()
    .activeOffsetX(4)
    .failOffsetY([-10, 10])
    .onBegin(() => {
      crossedRef.value = false;
      engagement.value = withTiming(1, {
        duration: appMotion.duration.instant,
        easing: appMotion.easing.standard,
      });
    })
    .onUpdate((event) => {
      const raw = Math.max(0, event.translationX);
      const rawRatio = maxTranslate > 0 ? raw / maxTranslate : 0;
      let next = raw;

      if (rawRatio > MAGNET_START && rawRatio < 1) {
        const magneticPull = ((rawRatio - MAGNET_START) / (1 - MAGNET_START)) * maxTranslate * 0.06;
        next += magneticPull;
      }

      if (rawRatio > RESISTANCE_START) {
        const over = raw - maxTranslate * RESISTANCE_START;
        next = maxTranslate * RESISTANCE_START + over * 0.28;
      }

      translateX.value = Math.min(Math.max(next, 0), maxTranslate);

      const visualRatio = maxTranslate > 0 ? translateX.value / maxTranslate : 0;
      if (visualRatio >= THRESHOLD && !crossedRef.value) {
        crossedRef.value = true;
        runOnJS(fireThreshold)();
      } else if (visualRatio < THRESHOLD && crossedRef.value) {
        crossedRef.value = false;
      }
    })
    .onEnd(() => {
      const ratio = maxTranslate > 0 ? translateX.value / maxTranslate : 0;

      if (ratio >= THRESHOLD) {
        translateX.value = withTiming(
          maxTranslate,
          { duration: appMotion.duration.instant, easing: appMotion.easing.emphasis },
          (finished) => {
            if (finished) runOnJS(fireConfirm)();
          },
        );
      } else {
        crossedRef.value = false;
        translateX.value = withSpring(0, appMotion.spring.settle);
      }

      engagement.value = withTiming(0, {
        duration: appMotion.duration.quick,
        easing: appMotion.easing.standard,
      });
    });

  const trackStyle = useAnimatedStyle(() => {
    const progress = maxTranslate > 0 ? translateX.value / maxTranslate : 0;
    return {
      backgroundColor: interpolateColor(
        engagement.value + progress * 0.45,
        [0, 0.6, 1.45],
        [theme.colors.surfaceElevated, theme.colors.surfaceMuted, theme.colors.surface],
      ),
      borderColor: interpolateColor(
        progress,
        [0, THRESHOLD, 1],
        [theme.colors.lineStrong, "rgba(0, 218, 243, 0.18)", "rgba(60, 227, 106, 0.22)"],
      ),
      transform: [{ scale: interpolate(engagement.value, [0, 1], [1, 0.998], Extrapolation.CLAMP) }],
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    const progress = maxTranslate > 0 ? translateX.value / maxTranslate : 0;
    return {
      opacity: interpolate(progress, [0, 0.3, 1], [0.78, 0.92, 1], Extrapolation.CLAMP),
      width: translateX.value + KNOB_SIZE,
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const progress = maxTranslate > 0 ? translateX.value / maxTranslate : 0;
    return {
      opacity: interpolate(progress, [0, 0.84, 1], [1, 0.14, 0], Extrapolation.CLAMP),
      transform: [{ translateX: interpolate(progress, [0, 1], [0, 8], Extrapolation.CLAMP) }],
    };
  });

  const readyLabelStyle = useAnimatedStyle(() => {
    const progress = maxTranslate > 0 ? translateX.value / maxTranslate : 0;
    return {
      opacity: interpolate(progress, [THRESHOLD - 0.08, THRESHOLD, 1], [0, 0.72, 1], Extrapolation.CLAMP),
      transform: [{ translateX: interpolate(progress, [THRESHOLD - 0.08, 1], [-10, 0], Extrapolation.CLAMP) }],
    };
  });

  const sheenStyle = useAnimatedStyle(() => {
    const progress = maxTranslate > 0 ? translateX.value / maxTranslate : 0;
    return {
      opacity: interpolate(progress, [0, 0.35, 1], [0.12, 0.2, 0.3], Extrapolation.CLAMP),
      transform: [{ translateX: interpolate(progress, [0, 1], [-18, 10], Extrapolation.CLAMP) }],
    };
  });

  const knobStyle = useAnimatedStyle(() => {
    const progress = maxTranslate > 0 ? translateX.value / maxTranslate : 0;
    return {
      backgroundColor: interpolateColor(
        progress,
        [0, 0.88, 1],
        [theme.colors.cyanDim, theme.colors.cyan, theme.colors.green],
      ),
      borderColor: interpolateColor(
        progress,
        [0, 1],
        ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.06)"],
      ),
      shadowOpacity: interpolate(progress, [0, 1], [0.18, 0.24], Extrapolation.CLAMP),
      shadowRadius: interpolate(progress, [0, 1], [12, 16], Extrapolation.CLAMP),
      transform: [
        { translateX: translateX.value },
        { scale: interpolate(engagement.value, [0, 1], [1, 0.986], Extrapolation.CLAMP) },
      ],
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const progress = maxTranslate > 0 ? translateX.value / maxTranslate : 0;
    return {
      opacity: interpolate(progress, [0, 1], [0.94, 1], Extrapolation.CLAMP),
      transform: [{ translateX: interpolate(progress, [0, THRESHOLD, 1], [0, 1.5, 2.5], Extrapolation.CLAMP) }],
    };
  });

  const knobShadowStyle = useAnimatedStyle(() => {
    const progress = maxTranslate > 0 ? translateX.value / maxTranslate : 0;
    return {
      backgroundColor: interpolateColor(
        progress,
        [0, 0.88, 1],
        [theme.colors.cyanDim, theme.colors.cyan, theme.colors.green],
      ),
      transform: [
        { translateX: translateX.value },
        { scale: interpolate(engagement.value, [0, 1], [1, 0.986], Extrapolation.CLAMP) },
      ],
    };
  });

  function handleLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  return (
    <View style={styles.wrapper}>
      <Animated.View pointerEvents="none" style={[styles.knobShadowTwin, knobShadowStyle]} />
      <Animated.View onLayout={handleLayout} style={[styles.track, trackStyle]}>
        <View style={styles.trackInnerHighlight} />
        <Animated.View style={[styles.progressFill, progressStyle]}>
          <Animated.View style={[styles.progressSheen, sheenStyle]}>
            <LinearGradient
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.18)", "rgba(255,255,255,0)"]}
              end={{ x: 1, y: 0.5 }}
              start={{ x: 0, y: 0.5 }}
              style={styles.progressSheenFill}
            />
          </Animated.View>
        </Animated.View>
        <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
        <Animated.Text style={[styles.readyLabel, readyLabelStyle]}>Release to send</Animated.Text>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.knob, knobStyle]}>
            <Animated.View style={iconStyle}>
              <ArrowRight color={theme.colors.background} size={20} weight="bold" />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "relative" },
  knobShadowTwin: {
    borderRadius: KNOB_RADIUS,
    elevation: 8,
    height: KNOB_SIZE,
    left: KNOB_INSET,
    position: "absolute",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    top: (TRACK_HEIGHT - KNOB_SIZE) / 2,
    width: KNOB_SIZE,
    zIndex: 2,
  },
  track: {
    alignItems: "center",
    borderRadius: TRACK_RADIUS,
    borderWidth: 1,
    height: TRACK_HEIGHT,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  trackInnerHighlight: {
    backgroundColor: "rgba(255,255,255,0.04)",
    height: 1,
    left: 14,
    position: "absolute",
    right: 14,
    top: 0,
  },
  progressFill: {
    backgroundColor: "rgba(0, 218, 243, 0.1)",
    borderRadius: KNOB_RADIUS,
    bottom: KNOB_INSET,
    left: KNOB_INSET,
    overflow: "hidden",
    position: "absolute",
    top: KNOB_INSET,
  },
  progressSheen: {
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 54,
  },
  progressSheenFill: { flex: 1 },
  label: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.bodyLg,
    letterSpacing: 0.1,
  },
  readyLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.bodyLg,
    letterSpacing: 0.1,
    position: "absolute",
  },
  knob: {
    alignItems: "center",
    borderRadius: KNOB_RADIUS,
    borderWidth: 1,
    height: KNOB_SIZE,
    justifyContent: "center",
    left: KNOB_INSET,
    position: "absolute",
    shadowColor: theme.colors.cyan,
    shadowOffset: { width: 0, height: 8 },
    width: KNOB_SIZE,
  },
});
