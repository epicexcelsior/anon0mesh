import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";

import { Backdrop } from "@/components/primitives/Backdrop";
import { DepthButton } from "@/components/primitives/DepthButton";
import { Icon } from "@/components/primitives/Icon";
import { IconButton } from "@/components/primitives/IconButton";
import { PressSurface } from "@/components/primitives/PressSurface";
import { RecipientPeerCard } from "@/components/send/RecipientPeerCard";
import QrScannerModal from "@/components/ui/QrScannerModal";
import * as haptics from "@/src/design-system/haptics";
import { appTheme as theme } from "@/src/design-system/theme";
import { usePeers } from "@/src/hooks/usePeers";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// Dev-only filler address for testing the flow without scanning. Pulled
// from Solana Explorer devnet sample account so nothing mainnet-sensitive
// ends up in the clipboard during development.
const MOCK_DEVNET_ADDRESS = "9A8uBzYXR2Dy5mJqZ6wmKdP9rKfChS7mZXAZWV7kP8fH";

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
    haptics.select();
    setAddress(publicKey);
  }

  function handleNext() {
    if (!isValid) return;
    haptics.confirm();
    router.push({
      pathname: "/send/amount",
      params: { to: trimmedAddress },
    });
  }

  function handleScanResult(data: string) {
    const nextAddress = extractScannedAddress(data);
    if (!nextAddress) {
      haptics.warning();
      Alert.alert(
        "Unsupported QR",
        "Scan a wallet address or a solana: payment link.",
      );
      return;
    }
    haptics.confirm();
    setAddress(nextAddress);
  }

  async function handlePaste() {
    haptics.tap();
    try {
      const text = await Clipboard.getStringAsync();
      if (text) setAddress(text);
    } catch {
      // non-fatal
    }
  }

  function handleMockFill() {
    haptics.tap();
    setAddress(MOCK_DEVNET_ADDRESS);
  }

  return (
    <View style={styles.root}>
      <Backdrop animated preset="send" />

      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Send</Text>
          <IconButton
            accessibilityLabel="Close send"
            name="x"
            onPress={() => router.back()}
            size="md"
            tone="neutral"
            variant="contained"
          />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.pasteRow}>
              <Text style={styles.toLabel}>To</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                multiline={false}
                numberOfLines={1}
                onChangeText={setAddress}
                placeholder="Solana address"
                placeholderTextColor={theme.colors.textMuted}
                selectionColor={theme.colors.cyan}
                style={styles.pasteInput}
                value={address}
              />
              <Pressable
                accessibilityLabel="Paste address"
                accessibilityRole="button"
                onPress={handlePaste}
                style={styles.pasteButton}
              >
                <Text style={styles.pasteButtonLabel}>Paste</Text>
              </Pressable>
            </View>

            {address.length > 0 && !isValid ? (
              <Text style={styles.errorLine}>Enter a valid Solana address.</Text>
            ) : isValid ? (
              <Text style={styles.previewLine}>
                Sending to <Text style={styles.previewHighlight}>{shortAddress(trimmedAddress)}</Text>
              </Text>
            ) : null}

            <PressSurface
              accessibilityLabel="Scan QR code"
              onPress={() => {
                haptics.select();
                setScannerVisible(true);
              }}
              style={styles.scanRow}
              variant="row"
            >
              <View style={styles.scanInner}>
                <View style={styles.scanIconWrap}>
                  <Icon color={theme.colors.textPrimary} name="maximize" size={22} />
                </View>
                <View style={styles.scanText}>
                  <Text style={styles.scanTitle}>Scan QR Code</Text>
                  <Text style={styles.scanSubtitle}>Tap to scan a peer&apos;s address</Text>
                </View>
              </View>
            </PressSurface>

            {peers.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Nearby peers</Text>
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

            {__DEV__ ? (
              <Pressable
                accessibilityLabel="Fill mock Solana devnet address"
                onPress={handleMockFill}
                style={styles.devRow}
              >
                <Icon color={theme.colors.purple} name="code" size={14} />
                <Text style={styles.devRowText}>dev: fill mock devnet address</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <DepthButton
            disabled={!isValid}
            label="Continue to amount"
            onPress={handleNext}
            size="lg"
            tone="cyan"
            variant="primary"
          />
        </View>
      </SafeAreaView>

      <QrScannerModal
        onClose={() => setScannerVisible(false)}
        onScanned={handleScanResult}
        visible={scannerVisible}
      />
    </View>
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
  flex: {
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
  scrollContent: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  pasteRow: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  toLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 15,
  },
  pasteInput: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontFamily: theme.fonts.monoJetBrains,
    fontSize: 15,
    minHeight: 56,
    paddingVertical: 0,
  },
  pasteButton: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  pasteButtonLabel: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 14,
  },
  previewLine: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    paddingHorizontal: theme.spacing.sm,
  },
  previewHighlight: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.monoJetBrains,
  },
  errorLine: {
    color: theme.colors.red,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    paddingHorizontal: theme.spacing.sm,
  },
  scanRow: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  scanInner: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  scanIconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.pill,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  scanText: {
    flex: 1,
    gap: 2,
  },
  scanTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: 17,
  },
  scanSubtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 13,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 1.1,
    paddingHorizontal: theme.spacing.sm,
    textTransform: "uppercase",
  },
  peerList: {
    gap: theme.spacing.sm,
  },
  devRow: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.colors.purpleSoft,
    borderRadius: theme.radius.pill,
    flexDirection: "row",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  devRowText: {
    color: theme.colors.purple,
    fontFamily: theme.fonts.mono,
    fontSize: 11,
  },
  footer: {
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
});
