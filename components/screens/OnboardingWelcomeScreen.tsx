import { VP } from "@/constants/void-protocol";
import { useRouter } from "expo-router";
import { Bluetooth, Lock, Wallet } from "phosphor-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import VoidButton from "../ui/VoidButton";
import VoidCard from "../ui/VoidCard";
import VoidScreen from "../ui/VoidScreen";
import VoidText from "../ui/VoidText";

const FEATURES = [
  {
    icon: Lock,
    title: "End-to-End Encrypted",
    description: "Messages secured with NaCl cryptography",
  },
  {
    icon: Bluetooth,
    title: "Mesh Network",
    description: "Communicate via Bluetooth — no internet needed",
  },
  {
    icon: Wallet,
    title: "Private Transactions",
    description: "Send SOL offline through the mesh",
  },
];

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <VoidScreen style={styles.container}>
      {/* Skip button */}
      <Pressable
        style={styles.skipButton}
        onPress={() => router.push("/onboarding/setup")}
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

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
        <Image
          source={require("../../assets/images/anon0mesh_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Headline */}
        <Text style={styles.headline}>
          Your messages.{"\n"}Your money.{"\n"}Your mesh.
        </Text>

        <Text style={styles.subheadline}>
          Communicate and transact without internet, without servers, without
          permission.
        </Text>

        {/* Feature highlights */}
        <View style={styles.features}>
          {FEATURES.map((feature, index) => (
            <VoidCard key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <feature.icon
                  size={20}
                  color={VP.colors.accent.cyan}
                  weight="regular"
                />
              </View>
              <View style={styles.featureTextContainer}>
                <VoidText variant="label" color={VP.colors.text.primary}>
                  {feature.title}
                </VoidText>
                <VoidText
                  variant="caption"
                  color={VP.colors.text.secondary}
                  style={styles.featureDescription}
                >
                  {feature.description}
                </VoidText>
              </View>
            </VoidCard>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <VoidButton
            label="GET STARTED"
            variant="primary"
            onPress={() => router.push("/onboarding/setup")}
          />
        </View>
      </Animated.View>
    </VoidScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: VP.spacing.lg,
  },
  skipButton: {
    position: "absolute",
    top: 56,
    right: VP.spacing.lg,
    zIndex: 10,
    paddingVertical: VP.spacing.sm,
    paddingHorizontal: VP.spacing.md,
  },
  skipText: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: VP.spacing.xxl,
  },
  logo: {
    width: 200,
    height: 50,
    marginBottom: VP.spacing.xl,
  },
  headline: {
    ...VP.typography.pageTitle,
    color: VP.colors.text.primary,
    textAlign: "center",
    marginBottom: VP.spacing.md,
    lineHeight: 36,
  },
  subheadline: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
    textAlign: "center",
    marginBottom: VP.spacing.xl,
    paddingHorizontal: VP.spacing.md,
    lineHeight: 22,
  },
  features: {
    width: "100%",
    gap: VP.spacing.sm,
    marginBottom: VP.spacing.xl,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: VP.spacing.md,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: VP.radius.sm,
    backgroundColor: VP.colors.accent.cyanMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: VP.spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureDescription: {
    marginTop: 2,
  },
  ctaContainer: {
    width: "100%",
    paddingBottom: VP.spacing.xl,
  },
});
