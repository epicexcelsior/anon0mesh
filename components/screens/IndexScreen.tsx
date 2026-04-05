import { VP } from "@/constants/void-protocol";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import VoidButton from "../ui/VoidButton";
import VoidScreen from "../ui/VoidScreen";

interface IndexScreenProps {
  onEnter?: () => void;
  showBackButton?: boolean;
}

export default function IndexScreen({
  onEnter,
  showBackButton = false,
}: IndexScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <VoidScreen style={styles.container}>
      {/* Mesh gradient background effect */}
      <View style={styles.meshGradient} />
      <View style={styles.meshGradientPurple} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/anon0mesh_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Private mesh communication{"\n"}& offline transactions
        </Text>

        {/* Status indicators */}
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>BLE_READY</Text>
          <Text style={styles.statusSeparator}> / </Text>
          <Text style={styles.statusText}>SCANNING_NODES</Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <VoidButton
            label="ENTER THE MESH"
            variant="outline"
            onPress={onEnter}
          />
        </View>

        {/* Version footer */}
        <Text style={styles.version}>v2.0.0-alpha</Text>
      </Animated.View>
    </VoidScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  meshGradient: {
    position: "absolute",
    top: "20%",
    left: "50%",
    width: 400,
    height: 400,
    marginLeft: -200,
    borderRadius: 200,
    backgroundColor: VP.colors.accent.cyan,
    opacity: 0.03,
  },
  meshGradientPurple: {
    position: "absolute",
    bottom: "15%",
    left: "10%",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: VP.colors.accent.purple,
    opacity: 0.02,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: VP.spacing.lg,
    width: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: VP.spacing.lg,
  },
  logo: {
    width: 280,
    height: 70,
  },
  tagline: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: VP.spacing.xl,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: VP.spacing.md,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: VP.colors.accent.cyan,
    marginRight: VP.spacing.sm,
  },
  statusText: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.disabled,
    letterSpacing: 1,
  },
  statusSeparator: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.disabled,
  },
  spacer: {
    flex: 1,
    maxHeight: 120,
  },
  ctaContainer: {
    width: "100%",
    maxWidth: 340,
    marginBottom: VP.spacing.xl,
  },
  version: {
    ...VP.typography.caption,
    color: VP.colors.text.disabled,
    letterSpacing: 1,
    marginBottom: VP.spacing.lg,
  },
});
