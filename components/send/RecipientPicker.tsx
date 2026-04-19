import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Backdrop } from "@/components/primitives/Backdrop";
import { DepthButton } from "@/components/primitives/DepthButton";
import { Icon } from "@/components/primitives/Icon";
import { usePeers } from "@/src/hooks/usePeers";
import { appTheme as theme } from "@/src/design-system/theme";

// Solana pubkey: base58 chars only, 32–44 chars
const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function isValidSolanaAddress(addr: string): boolean {
  return BASE58_RE.test(addr.trim());
}

function shortAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function RecipientPicker() {
  const router = useRouter();
  const { peers } = usePeers();
  const [address, setAddress] = useState("");

  const isValid = isValidSolanaAddress(address);

  function handleSelectPeer(publicKey: string) {
    setAddress(publicKey);
  }

  function handleNext() {
    if (!isValid) return;
    router.push((`/send/amount?to=${encodeURIComponent(address.trim())}`) as Parameters<typeof router.push>[0]);
  }

  function handleQrScan() {
    Alert.alert("Coming soon", "QR scan integration is coming in a future update.");
  }

  return (
    <View style={styles.root}>
      <Backdrop preset="send" />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Icon name="arrow-left" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Send to</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={8}
            onPress={handleQrScan}
            style={styles.backBtn}
          >
            <Icon name="camera" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Address input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Wallet address</Text>
            <View
              style={[
                styles.inputWrap,
                address.length > 0 && !isValid && styles.inputWrapError,
                isValid && styles.inputWrapValid,
              ]}
            >
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setAddress}
                placeholder="Paste address…"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                value={address}
              />
              {isValid && (
                <View style={styles.inputValidIcon}>
                  <Icon name="check" size={16} color={theme.colors.green} />
                </View>
              )}
            </View>
            {address.length > 0 && !isValid && (
              <Text style={styles.inputError}>Invalid Solana address</Text>
            )}
          </View>

          {/* Mesh peer quick-picks */}
          {peers.length > 0 && (
            <View style={styles.peersSection}>
              <Text style={styles.peersLabel}>Mesh peers</Text>
              <View style={styles.peersList}>
                {peers.slice(0, 5).map((peer) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    key={peer.id}
                    onPress={() => handleSelectPeer(peer.publicKey)}
                    style={[
                      styles.peerChip,
                      address === peer.publicKey && styles.peerChipSelected,
                    ]}
                  >
                    <View style={styles.peerChipDot} />
                    <View style={styles.peerChipText}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.peerAlias,
                          address === peer.publicKey && styles.peerAliasSelected,
                        ]}
                      >
                        {peer.alias}
                      </Text>
                      <Text style={styles.peerAddress} numberOfLines={1}>
                        {shortAddress(peer.publicKey)}
                      </Text>
                    </View>
                    {address === peer.publicKey && (
                      <Icon name="check" size={14} color={theme.colors.cyan} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <DepthButton
            disabled={!isValid}
            label="Next"
            onPress={handleNext}
            tone="cyan"
            variant="primary"
          />
        </View>
      </SafeAreaView>
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
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.section,
  },
  backBtn: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  content: {
    flex: 1,
    gap: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  inputSection: {
    gap: theme.spacing.sm,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  inputWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  inputWrapError: {
    borderColor: theme.colors.red,
  },
  inputWrapValid: {
    borderColor: theme.colors.green,
  },
  input: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.body,
  },
  inputValidIcon: {
    marginLeft: theme.spacing.sm,
  },
  inputError: {
    color: theme.colors.red,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
  },
  peersSection: {
    gap: theme.spacing.md,
  },
  peersLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.caption,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  peersList: {
    gap: theme.spacing.sm,
  },
  peerChip: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.lineStrong,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  peerChipSelected: {
    backgroundColor: theme.colors.cyanSoft,
    borderColor: theme.colors.cyan,
  },
  peerChipDot: {
    backgroundColor: theme.colors.green,
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  peerChipText: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  peerAlias: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  peerAliasSelected: {
    color: theme.colors.cyan,
  },
  peerAddress: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.mono,
    fontSize: theme.type.caption,
  },
  footer: {
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
});
