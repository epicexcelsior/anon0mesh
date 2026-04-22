import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Backdrop } from "@/components/primitives/Backdrop";
import { Icon } from "@/components/primitives/Icon";
import { IconButton } from "@/components/primitives/IconButton";
import { SegmentedControl } from "@/components/primitives/SegmentedControl";
import { TokenLogo } from "@/components/primitives/TokenLogo";
import * as haptics from "@/src/design-system/haptics";
import { appTheme as theme } from "@/src/design-system/theme";
import { useWallet } from "@/src/hooks";
import { useLocalDisplayName } from "@/src/hooks/useLocalDisplayName";

const ADDRESS_MODES = [
  { id: "standard", label: "Standard" },
  { id: "stealth", label: "Stealth" },
];

function shortAddress(addr: string | null | undefined): string {
  if (!addr) return "—";
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-4)}`;
}

// Placeholder stealth meta-address for UI review. Real derivation
// wires up in Phase 7 from worktrees/anon0mesh-fork-ui/lib/stealth.
function previewStealthAddress(walletAddress: string | null | undefined): string {
  if (!walletAddress) return "";
  return `stealth_${walletAddress.slice(0, 4)}${walletAddress.slice(-6)}…preview`;
}

export default function ReceiveScreen() {
  const router = useRouter();
  const { wallet, loading } = useWallet();
  const [mode, setMode] = useState<string>("standard");

  const walletAlias = wallet?.identity
    ? wallet.identity.length <= 14
      ? wallet.identity
      : `${wallet.identity.slice(0, 10)}…`
    : wallet?.address
      ? `${wallet.address.slice(0, 4)}…${wallet.address.slice(-4)}`
      : "—";
  const { displayName } = useLocalDisplayName(wallet?.address ?? null, walletAlias);
  const alias = displayName || walletAlias;

  const standardAddress = wallet?.address ?? "";
  const stealthAddress = useMemo(
    () => previewStealthAddress(wallet?.address),
    [wallet?.address],
  );
  const activeAddress = mode === "stealth" ? stealthAddress : standardAddress;
  const qrValue = activeAddress || "anon";
  const isStealth = mode === "stealth";
  const qrColor = isStealth ? theme.colors.purple : "#000000";

  return (
    <View style={styles.root}>
      <Backdrop preset="settings" />
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Receive</Text>
          <IconButton
            accessibilityLabel="Close receive"
            name="x"
            onPress={() => router.back()}
            size="md"
            tone="neutral"
            variant="contained"
          />
        </View>

        <View style={styles.segmentRow}>
          <SegmentedControl
            onSelect={setMode}
            segments={ADDRESS_MODES}
            selected={mode}
            tone={isStealth ? "purple" : "cyan"}
          />
          {isStealth ? (
            <View style={styles.previewPillFloat}>
              <View style={styles.previewPill}>
                <Icon color={theme.colors.purple} name="eye" size={12} />
                <Text style={styles.previewPillText}>
                  Preview — stealth wiring lands in Phase 7
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {loading && !wallet ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={theme.colors.cyan} size="small" />
            <Text style={styles.loadingText}>Loading wallet…</Text>
          </View>
        ) : (
          <View style={styles.body}>
            <Text numberOfLines={1} style={styles.identity}>
              {alias}
            </Text>

            <View style={styles.qrCard}>
              <QRCode
                backgroundColor="#FFFFFF"
                color={qrColor}
                size={220}
                value={qrValue}
              />
            </View>

            <View style={styles.networks}>
              <View style={styles.networkIcons}>
                <TokenLogo size={18} symbol="SOL" />
                <TokenLogo size={18} symbol="USDC" />
              </View>
              <Text style={styles.networksLabel}>Supported on Solana</Text>
            </View>

            <Text
              accessibilityLabel={activeAddress}
              numberOfLines={1}
              selectable={false}
              style={styles.address}
            >
              {shortAddress(activeAddress)}
            </Text>
          </View>
        )}

        <ActionBar address={activeAddress} />
      </SafeAreaView>
    </View>
  );
}

interface ActionBarProps {
  address: string;
}

function ActionBar({ address }: ActionBarProps) {
  const [copied, setCopied] = useState(false);
  const pulse = useSharedValue(0);

  async function handleCopy() {
    if (!address) return;
    haptics.confirm();
    await Clipboard.setStringAsync(address);
    setCopied(true);
    pulse.value = withSequence(
      withTiming(1, { duration: 180 }),
      withTiming(1, { duration: 900 }),
      withTiming(0, { duration: 280 }),
    );
    setTimeout(() => setCopied(false), 1400);
  }

  async function handleShare() {
    if (!address) return;
    haptics.select();
    try {
      await Share.share({ message: `AnonMesh address\n${address}` });
    } catch {
      // Non-fatal — system share sheet unavailable.
    }
  }

  return (
    <View style={styles.actionBar}>
      <ShareButton onPress={handleShare} />
      <CopyButton copied={copied} onPress={handleCopy} pulse={pulse} />
    </View>
  );
}

function ShareButton({ onPress }: { onPress: () => void }) {
  const pressed = useSharedValue(0);
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.92]) }],
  }));
  return (
    <Pressable
      accessibilityLabel="Share address"
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      onPressIn={() => {
        haptics.tap();
        pressed.value = withTiming(1, { duration: 110 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 220 });
      }}
      style={styles.actionCell}
    >
      <Animated.View style={[styles.circle, styles.circleNeutral, scaleStyle]}>
        <Icon color={theme.colors.textPrimary} name="share-2" size={22} />
      </Animated.View>
      <Text style={styles.actionLabel}>Share</Text>
    </Pressable>
  );
}

function CopyButton({
  copied,
  onPress,
  pulse,
}: {
  copied: boolean;
  onPress: () => void;
  pulse: ReturnType<typeof useSharedValue<number>>;
}) {
  const pressed = useSharedValue(0);

  const bgStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.92]);
    const pulseBoost = interpolate(pulse.value, [0, 1], [0, 0.08]);
    return {
      backgroundColor: pulse.value > 0.5 ? theme.colors.cyan : theme.colors.surfaceContainerLowest,
      borderColor: pulse.value > 0.5 ? theme.colors.cyan : theme.colors.line,
      transform: [{ scale: scale + pulseBoost }],
    };
  });

  const copyIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 0.5, 1], [1, 0, 0]),
  }));

  const checkIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 0.5, 1], [0, 1, 1]),
    transform: [{ scale: interpolate(pulse.value, [0, 0.5, 1], [0.6, 1, 1]) }],
  }));

  return (
    <Pressable
      accessibilityLabel={copied ? "Copied" : "Copy address"}
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      onPressIn={() => {
        haptics.tap();
        pressed.value = withTiming(1, { duration: 110 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 220 });
      }}
      style={styles.actionCell}
    >
      <Animated.View style={[styles.circle, bgStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.iconLayer, copyIconStyle]}>
          <Icon color={theme.colors.textPrimary} name="copy" size={22} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.iconLayer, checkIconStyle]}>
          <Icon color={theme.colors.textOnAccent} name="check" size={24} />
        </Animated.View>
      </Animated.View>
      <Text style={styles.actionLabel}>{copied ? "Copied" : "Copy"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  segmentRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  body: {
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.lg,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  identity: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: 22,
    letterSpacing: -0.2,
  },
  qrCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: theme.radius.xl,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  networks: {
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  networkIcons: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  networksLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  previewPillFloat: {
    alignItems: "center",
    left: 0,
    paddingTop: theme.spacing.sm,
    position: "absolute",
    right: 0,
    top: "100%",
  },
  previewPill: {
    alignItems: "center",
    backgroundColor: theme.colors.purpleSoft,
    borderColor: theme.colors.purpleBorderSoft,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  previewPillText: {
    color: theme.colors.purple,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
  },
  address: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  loadingBlock: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
  },
  actionBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xxxl,
    justifyContent: "center",
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  actionCell: {
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  circle: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    overflow: "hidden",
    width: 56,
  },
  circleNeutral: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
  },
  iconLayer: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 13,
  },
});
