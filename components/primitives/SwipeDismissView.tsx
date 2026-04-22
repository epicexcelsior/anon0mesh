import React, { useCallback } from "react";
import { Dimensions, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { appMotion } from "@/src/design-system/motion";

const SCREEN_HEIGHT = Dimensions.get("window").height;

// Distances and velocities calibrated to match Apple Music / Linear /
// Arc dismissals — tight enough that a clear downward intent triggers
// dismiss, forgiving enough that a light touch or short flick doesn't.
const DEFAULT_DISMISS_DISTANCE = 160;
const DEFAULT_DISMISS_VELOCITY = 900;
const DEFAULT_ACTIVATION_SLOP = 16;

interface SwipeDismissViewProps {
  children: React.ReactNode;
  onDismiss: () => void;
  dismissDistance?: number;
  dismissVelocity?: number;
  activationSlop?: number;
  style?: StyleProp<ViewStyle>;
}

// Wraps screen content with a pan-to-dismiss gesture. Drag the surface
// down past `dismissDistance` (160px) or flick faster than
// `dismissVelocity` (900px/s) to trigger `onDismiss`. Otherwise the
// surface springs back into place.
//
// Use on full-screen routes presented as modals (or anywhere the user
// expects a "pull down to close" interaction). Plays nicely with the
// native iOS modal gesture; supplies the Android equivalent.
export function SwipeDismissView({
  children,
  onDismiss,
  dismissDistance = DEFAULT_DISMISS_DISTANCE,
  dismissVelocity = DEFAULT_DISMISS_VELOCITY,
  activationSlop = DEFAULT_ACTIVATION_SLOP,
  style,
}: SwipeDismissViewProps) {
  const translateY = useSharedValue(0);

  const triggerDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const pan = Gesture.Pan()
    // Require a clear downward intent before claiming the gesture so
    // taps, list scrolls, and accidental brushes don't activate it.
    .activeOffsetY([activationSlop, 9999])
    // Fail fast if the user drags UP — don't hijack upward scroll.
    .failOffsetY(-10)
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      } else {
        translateY.value = 0;
      }
    })
    .onEnd((event) => {
      const shouldDismiss =
        event.velocityY > dismissVelocity || translateY.value > dismissDistance;
      if (shouldDismiss) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 220 });
        runOnJS(triggerDismiss)();
      } else {
        translateY.value = withSpring(0, appMotion.spring.pressRelease);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT * 0.45],
      [1, 0.55],
      "clamp",
    ),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.fill, animatedStyle, style]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
