import { VP } from "@/constants/void-protocol";
import { IdentityManager } from "@/src/infrastructure/crypto/IdentityManager";
import { identityStateManager } from "@/src/infrastructure/identity";
import {
  DeviceDetector,
  LocalWalletAdapter,
  MWAWalletAdapter,
} from "@/src/infrastructure/wallet";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  Bluetooth,
  BellSimple,
  ShieldCheck,
  CaretLeft,
} from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import VoidButton from "../ui/VoidButton";
import VoidCard from "../ui/VoidCard";
import VoidScreen from "../ui/VoidScreen";
import VoidText from "../ui/VoidText";

const PERMISSIONS = [
  {
    icon: Bluetooth,
    title: "Bluetooth",
    description: "Required for mesh communication with nearby peers",
  },
  {
    icon: BellSimple,
    title: "Notifications",
    description: "Get alerts for incoming messages and transactions",
  },
];

export default function OnboardingSetupScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [meshAlias, setMeshAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSeeker, setIsSeeker] = useState(false);

  useEffect(() => {
    const info = DeviceDetector.getDeviceInfo();
    setIsSeeker(info.isSolanaMobile);

    // Generate mesh alias
    const alias = IdentityManager.generateRandomNickname();
    setMeshAlias(alias);
  }, []);

  async function handleOnboard() {
    if (loading) return;
    setLoading(true);

    const deviceInfo = DeviceDetector.getDeviceInfo();
    const nickname = displayName.trim() || meshAlias;

    try {
      if (deviceInfo.isSolanaMobile) {
        // MWA wallet flow
        const wallet = new MWAWalletAdapter();
        await wallet.initialize();
        await wallet.connect();
        if (!wallet.isConnected()) throw new Error("Failed to connect wallet");
        console.log("[Setup] MWA wallet connected:", wallet.getPublicKey()?.toBase58());
      } else {
        // Local wallet flow
        const wallet = new LocalWalletAdapter();
        await wallet.initialize();
        if (!wallet.getPublicKey()) throw new Error("Failed to generate wallet");
        console.log("[Setup] Local wallet created:", wallet.getPublicKey()?.toBase58());
      }

      // Generate and save identity
      const identity = await IdentityManager.generateIdentity(nickname);
      await identityStateManager.saveIdentity(identity);

      if (nickname) {
        await SecureStore.setItemAsync("nickname", nickname);
      }

      console.log("[Setup] Identity saved, navigating to landing...");

      setTimeout(() => {
        router.replace("/landing");
      }, 500);
    } catch (error: any) {
      console.error("[Setup] Onboard error:", error);
      alert(error?.message || "Failed to set up wallet.");
      setLoading(false);
    }
  }

  return (
    <VoidScreen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <CaretLeft size={20} color={VP.colors.text.secondary} />
        </Pressable>

        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepDotActive} />
          <View style={styles.stepDotActive} />
        </View>
        <VoidText variant="caption" secondary style={styles.stepText}>
          Step 2 of 2
        </VoidText>

        {/* Identity section */}
        <View style={styles.section}>
          <VoidText variant="header">Identity</VoidText>
          <VoidText variant="body" secondary style={styles.sectionDescription}>
            Choose a display name or use your auto-generated mesh alias.
          </VoidText>

          <View style={styles.inputGroup}>
            <VoidText variant="label" secondary>
              Display Name (optional)
            </VoidText>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter a display name..."
              placeholderTextColor={VP.colors.text.disabled}
              maxLength={20}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <VoidText variant="label" secondary>
              Mesh Alias
            </VoidText>
            <View style={styles.aliasContainer}>
              <Text style={styles.aliasText}>@{meshAlias}</Text>
              <View style={styles.aliasBadge}>
                <Text style={styles.aliasBadgeText}>AUTO</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Permission primer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShieldCheck
              size={20}
              color={VP.colors.accent.cyan}
              weight="regular"
            />
            <VoidText variant="header" style={styles.sectionHeaderText}>
              Permissions
            </VoidText>
          </View>
          <VoidText variant="body" secondary style={styles.sectionDescription}>
            The app will request these permissions next. Here is why each one matters.
          </VoidText>

          {PERMISSIONS.map((perm, index) => (
            <VoidCard key={index} style={styles.permissionCard}>
              <View style={styles.permissionIconContainer}>
                <perm.icon
                  size={20}
                  color={VP.colors.accent.cyan}
                  weight="regular"
                />
              </View>
              <View style={styles.permissionTextContainer}>
                <VoidText variant="label" color={VP.colors.text.primary}>
                  {perm.title}
                </VoidText>
                <VoidText
                  variant="caption"
                  color={VP.colors.text.secondary}
                  style={styles.permissionDescription}
                >
                  {perm.description}
                </VoidText>
              </View>
            </VoidCard>
          ))}
        </View>

        {/* Wallet section */}
        <View style={styles.section}>
          <VoidText variant="header">Wallet</VoidText>
          <VoidText variant="body" secondary style={styles.sectionDescription}>
            {isSeeker
              ? "Connect your existing Solana wallet via Mobile Wallet Adapter."
              : "A secure local wallet will be created on your device."}
          </VoidText>
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={VP.colors.accent.cyan} size="small" />
              <VoidText variant="label" color={VP.colors.accent.cyan} style={styles.loadingText}>
                {isSeeker ? "CONNECTING WALLET..." : "CREATING WALLET..."}
              </VoidText>
            </View>
          ) : (
            <VoidButton
              label="ENTER THE MESH"
              variant="primary"
              onPress={handleOnboard}
            />
          )}
        </View>
      </ScrollView>
    </VoidScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: VP.spacing.lg,
    paddingBottom: VP.spacing.xxl,
  },
  backButton: {
    paddingVertical: VP.spacing.md,
    paddingRight: VP.spacing.md,
    alignSelf: "flex-start",
  },
  stepIndicator: {
    flexDirection: "row",
    gap: VP.spacing.xs,
    marginBottom: VP.spacing.xs,
  },
  stepDotActive: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: VP.colors.accent.cyan,
  },
  stepText: {
    marginBottom: VP.spacing.xl,
  },
  section: {
    marginBottom: VP.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionDescription: {
    marginTop: VP.spacing.xs,
    marginBottom: VP.spacing.md,
  },
  inputGroup: {
    marginBottom: VP.spacing.md,
    gap: VP.spacing.xs,
  },
  input: {
    backgroundColor: VP.colors.surface,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
    borderRadius: VP.radius.sm,
    paddingHorizontal: VP.spacing.md,
    paddingVertical: 14,
    color: VP.colors.text.primary,
    fontFamily: "SpaceGrotesk-Regular",
    fontSize: 14,
  },
  aliasContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VP.colors.surface,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
    borderRadius: VP.radius.sm,
    paddingHorizontal: VP.spacing.md,
    paddingVertical: 14,
  },
  aliasText: {
    ...VP.typography.mono,
    color: VP.colors.accent.cyan,
    flex: 1,
  },
  aliasBadge: {
    backgroundColor: VP.colors.accent.cyanMuted,
    paddingHorizontal: VP.spacing.sm,
    paddingVertical: 2,
    borderRadius: VP.radius.sm,
  },
  aliasBadgeText: {
    ...VP.typography.caption,
    color: VP.colors.accent.cyan,
    fontFamily: "JetBrainsMono-Medium",
    letterSpacing: 1,
  },
  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: VP.spacing.sm,
    paddingVertical: 12,
  },
  permissionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: VP.radius.sm,
    backgroundColor: VP.colors.accent.cyanMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: VP.spacing.md,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionDescription: {
    marginTop: 2,
  },
  ctaContainer: {
    marginTop: VP.spacing.md,
    paddingBottom: VP.spacing.lg,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: VP.spacing.sm,
  },
  loadingText: {
    letterSpacing: 1.5,
  },
});
