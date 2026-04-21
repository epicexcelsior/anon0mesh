import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { DepthButton } from "@/components/primitives/DepthButton";
import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { RecipientPeerCard } from "@/components/send/RecipientPeerCard";
import { SendScaffold } from "@/components/send/SendScaffold";
import QrScannerModal from "@/components/ui/QrScannerModal";
import { appTheme as theme } from "@/src/design-system/theme";
import { usePeers } from "@/src/hooks/usePeers";

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function isValidSolanaAddress(addr: string): boolean {
  return BASE58_RE.test(addr.trim());
}

function shortAddress(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-4)}`;
}

function extractScannedAddress(raw: string): string | null {
  const trimmed = raw.trim();
  if (isValidSolanaAddress(trimmed)) return trimmed;

  const withoutPrefix = trimmed.replace(/^solana:(\/\/)?/i, "");
  const candidate = withoutPrefix.split(/[?#]/)[0]?.trim();
  if (candidate && isValidSolanaAddress(candidate)) return candidate;

  const embedded = trimmed.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/)?.[0];
  return embedded && isValidSolanaAddress(embedded) ? embedded : null;
}

export function RecipientPicker() {
  const router = useRouter();
  const { peers } = usePeers();
  const [address, setAddress] = useState("");
  const [scannerVisible, setScannerVisible] = useState(false);

  const trimmedAddress = address.trim();
  const isValid = isValidSolanaAddress(trimmedAddress);

  function handleSelectPeer(publicKey: string) {
    setAddress(publicKey);
  }

  function handleNext() {
    if (!isValid) return;
    router.push({
      pathname: "/send/amount",
      params: { to: trimmedAddress },
    });
  }

  function handleScanResult(data: string) {
    const nextAddress = extractScannedAddress(data);
    if (!nextAddress) {
      Alert.alert(
        "Unsupported QR",
        "Scan a wallet address or a solana: payment link for this recovery build.",
      );
      return;
    }

    setAddress(nextAddress);
  }

  return (
    <>
      <SendScaffold
        onBack={() => router.back()}
        step={1}
        subtitle="Paste a wallet address, scan a QR, or pick a nearby peer already visible on your mesh."
        title="Choose recipient"
        footer={
          <DepthButton
            disabled={!isValid}
            label="Continue to amount"
            onPress={handleNext}
            tone="cyan"
            variant="primary"
          />
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <GlassSurface style={styles.primaryCard} variant="strong">
              <SectionLabel
                label="Wallet address"
                trailing={
                  isValid ? (
                    <View style={styles.validRow}>
                      <Icon color={theme.colors.green} name="check-circle" size={14} />
                      <Text style={styles.validLabel}>Ready</Text>
                    </View>
                  ) : null
                }
              />

              <View
                style={[
                  styles.inputWrap,
                  address.length > 0 && !isValid && styles.inputWrapError,
                  isValid && styles.inputWrapValid,
                ]}
              >
                <Icon color={theme.colors.textMuted} name="hash" size={16} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setAddress}
                  placeholder="Paste address or payment link"
                  placeholderTextColor={theme.colors.textMuted}
                  selectionColor={theme.colors.cyan}
                  style={styles.input}
                  value={address}
                />
                <TouchableOpacity
                  accessibilityLabel="Scan QR code"
                  accessibilityRole="button"
                  activeOpacity={0.8}
                  onPress={() => setScannerVisible(true)}
                  style={styles.scanButton}
                >
                  <Icon color={theme.colors.cyan} name="camera" size={16} />
                  <Text style={styles.scanButtonLabel}>Scan</Text>
                </TouchableOpacity>
              </View>

              {address.length > 0 && !isValid ? (
                <View style={styles.feedbackRow}>
                  <Icon color={theme.colors.red} name="alert-circle" size={14} />
                  <Text style={styles.feedbackError}>
                    Enter a valid Solana address or scan a supported QR.
                  </Text>
                </View>
              ) : (
                <Text style={styles.helperText}>
                  QR scan supports plain wallet addresses and <Text style={styles.helperStrong}>solana:</Text> links.
                </Text>
              )}

              {isValid ? (
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Selected</Text>
                  <Text numberOfLines={1} style={styles.previewValue}>
                    {shortAddress(trimmedAddress)}
                  </Text>
                </View>
              ) : null}
            </GlassSurface>

            {peers.length > 0 ? (
              <View style={styles.section}>
                <SectionLabel label="Nearby peers" />
                <View style={styles.peerList}>
                  {peers.slice(0, 4).map((peer) => {
                    const selected = trimmedAddress === peer.publicKey;

                    return (
                      <RecipientPeerCard
                        key={peer.id}
                        onPress={() => handleSelectPeer(peer.publicKey)}
                        peer={peer}
                        selected={selected}
                      />
                    );
                  })}
                </View>
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SendScaffold>

      <QrScannerModal
        onClose={() => setScannerVisible(false)}
        onScanned={handleScanResult}
        visible={scannerVisible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  primaryCard: {
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  validRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  validLabel: {
    color: theme.colors.green,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 64,
    paddingHorizontal: theme.spacing.md,
  },
  inputWrapError: {
    borderColor: theme.colors.red,
  },
  inputWrapValid: {
    borderColor: theme.colors.greenGlow,
  },
  input: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.body,
    paddingVertical: theme.spacing.md,
  },
  scanButton: {
    alignItems: "center",
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.cyanGlow,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  scanButtonLabel: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    textTransform: "uppercase",
  },
  feedbackRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  feedbackError: {
    color: theme.colors.red,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.5,
  },
  helperText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
  },
  helperStrong: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.monoJetBrains,
  },
  previewRow: {
    alignItems: "center",
    borderTopColor: theme.colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.md,
  },
  previewLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  previewValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: theme.type.caption,
    maxWidth: 200,
    textAlign: "right",
  },
  section: {
    gap: theme.spacing.md,
  },
  peerList: {
    gap: theme.spacing.sm,
  },
});
