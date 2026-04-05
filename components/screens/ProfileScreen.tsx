import { VP } from "@/constants/void-protocol";
import { useMeshChat } from "@/src/contexts/MeshBLEContext";
import { useWallet } from "@/src/contexts/WalletContext";
import { Identity } from "@/src/domain/entities/Identity";
import { identityStateManager } from "@/src/infrastructure/identity";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  Broadcast,
  CaretRight,
  Copy,
  Gear,
  Lock,
  PencilSimple,
  SlidersHorizontal,
} from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import VoidCard from "../ui/VoidCard";
import VoidScreen from "../ui/VoidScreen";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    publicKey: walletPublicKey,
    isConnected: walletConnected,
    connect,
    isLoading: isWalletLoading,
  } = useWallet();

  const {
    isConnected: meshConnected,
    myPeerId,
    connectedPeerCount,
  } = useMeshChat();

  const [nickname, setNickname] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load wallet and nickname on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!walletConnected && !isWalletLoading) {
          await connect();
        }
        if (walletPublicKey && mounted) {
          setPubKey(walletPublicKey.toBase58());
        }

        const identity =
          identityStateManager.getIdentity() ||
          (await identityStateManager.initialize());

        if (identity && mounted) {
          setNickname(identity.nickname);
        } else if (mounted) {
          const storedNickname = await SecureStore.getItemAsync("nickname");
          setNickname(storedNickname || "Anonymous");
        }
      } catch (e) {
        console.warn("[ProfileScreen] Failed to initialize", e);
        if (mounted) setNickname("Anonymous");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [walletConnected, isWalletLoading, walletPublicKey, connect]);

  const handleSaveNickname = async () => {
    const trimmed = nickname.trim();
    if (!trimmed || trimmed.length < 2) {
      Alert.alert("Invalid", "Nickname must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 20) {
      Alert.alert("Invalid", "Nickname must be 20 characters or less.");
      return;
    }
    if (!/^[a-zA-Z0-9\s\-_.]+$/.test(trimmed)) {
      Alert.alert("Invalid", "Letters, numbers, and basic punctuation only.");
      return;
    }

    setIsSaving(true);
    try {
      const currentIdentity = identityStateManager.getIdentity();
      if (currentIdentity) {
        const updated = new Identity({
          noiseStaticKeyPair: currentIdentity.noiseStaticKeyPair,
          signingKeyPair: currentIdentity.signingKeyPair,
          nickname: trimmed,
          fingerprint: currentIdentity.fingerprint,
        });
        await identityStateManager.saveIdentity(updated);
      }
      await SecureStore.setItemAsync("nickname", trimmed);
      setNickname(trimmed);
      setIsEditing(false);
      Keyboard.dismiss();
    } catch (error) {
      console.error("[ProfileScreen] Save failed:", error);
      Alert.alert("Error", "Failed to update nickname.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!pubKey) return;
    await Clipboard.setStringAsync(pubKey);
    Alert.alert("Copied", "Wallet address copied to clipboard.");
  };

  const handleCopyPeerId = async () => {
    if (!myPeerId) return;
    await Clipboard.setStringAsync(myPeerId);
    Alert.alert("Copied", "Mesh Node ID copied to clipboard.");
  };

  const handleOpenWalletSettings = () => {
    router.push("/wallet/settings");
  };

  const truncatedPubKey = pubKey
    ? `${pubKey.slice(0, 6)}...${pubKey.slice(-4)}`
    : "Not connected";
  const truncatedPeerId = myPeerId
    ? `${myPeerId.slice(0, 6)}...${myPeerId.slice(-4)}`
    : "...";

  return (
    <VoidScreen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/settings")}
          hitSlop={12}
        >
          <Gear size={22} color={VP.colors.text.secondary} weight="regular" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Identity Card ──────────────────────────── */}
        <VoidCard elevated style={styles.identityCard}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(nickname || "AN").slice(0, 2).toUpperCase()}
            </Text>
          </View>

          {/* Name + edit */}
          {isEditing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nicknameInput}
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
                autoFocus
                selectTextOnFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveNickname}
                placeholderTextColor={VP.colors.text.disabled}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveNickname}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.nameRow}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.displayName}>{nickname || "Anonymous"}</Text>
              <PencilSimple
                size={16}
                color={VP.colors.text.secondary}
                weight="regular"
              />
            </TouchableOpacity>
          )}

          {/* BLE status */}
          <View style={styles.bleRow}>
            <View
              style={[
                styles.bleDot,
                !meshConnected && styles.bleDotOffline,
              ]}
            />
            <Text
              style={[
                styles.bleLabel,
                !meshConnected && styles.bleLabelOffline,
              ]}
            >
              {meshConnected ? "BLE ACTIVE" : "BLE OFFLINE"}
            </Text>
          </View>
        </VoidCard>

        {/* ── Public Identity ────────────────────────── */}
        <Text style={styles.sectionLabel}>PUBLIC IDENTITY</Text>

        <VoidCard style={styles.identityDetails}>
          {/* Solana address */}
          <TouchableOpacity
            style={styles.detailRow}
            onPress={handleCopyAddress}
            activeOpacity={0.7}
          >
            <Lock size={16} color={VP.colors.accent.purple} weight="fill" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Solana Address</Text>
              <Text style={styles.detailValueMono}>{truncatedPubKey}</Text>
            </View>
            <Copy size={16} color={VP.colors.text.disabled} weight="regular" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Mesh Node ID */}
          <TouchableOpacity
            style={styles.detailRow}
            onPress={handleCopyPeerId}
            activeOpacity={0.7}
          >
            <Broadcast size={16} color={VP.colors.accent.cyan} weight="regular" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Mesh Node ID</Text>
              <Text style={styles.detailValueMono}>{truncatedPeerId}</Text>
            </View>
            <Copy size={16} color={VP.colors.text.disabled} weight="regular" />
          </TouchableOpacity>
        </VoidCard>

        {/* ── Node Stats ─────────────────────────────── */}
        <Text style={styles.sectionLabel}>NODE STATUS</Text>

        <View style={styles.statsRow}>
          <VoidCard style={styles.statCard}>
            <Text style={styles.statValue}>{connectedPeerCount}</Text>
            <Text style={styles.statLabel}>Active Nodes</Text>
          </VoidCard>
          <VoidCard style={styles.statCard}>
            <Text style={styles.statValue}>
              {meshConnected ? "Online" : "Offline"}
            </Text>
            <Text style={styles.statLabel}>Mesh Status</Text>
          </VoidCard>
        </View>

        {/* ── Wallet Management ─────────────────────── */}
        <Text style={styles.sectionLabel}>WALLET MANAGEMENT</Text>

        <VoidCard style={styles.securityCard}>
          <TouchableOpacity
            style={styles.securityRow}
            onPress={handleOpenWalletSettings}
            activeOpacity={0.7}
          >
            <SlidersHorizontal
              size={18}
              color={VP.colors.accent.cyan}
              weight="regular"
            />
            <View style={styles.securityRowInfo}>
              <Text style={styles.securityRowLabel}>Wallet Settings</Text>
              <Text style={styles.securityRowSubtext}>
                Manage your primary wallet and offline wallets
              </Text>
            </View>
            <CaretRight
              size={16}
              color={VP.colors.text.disabled}
              weight="regular"
            />
          </TouchableOpacity>
        </VoidCard>

        {/* ── Version ────────────────────────────────── */}
        <Text style={styles.versionText}>v1.0.0</Text>
      </ScrollView>
    </VoidScreen>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: VP.spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: VP.colors.ghostBorder,
  },
  headerTitle: {
    ...VP.typography.header,
    color: VP.colors.text.primary,
  },
  settingsButton: {
    padding: 4,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: VP.spacing.md,
    paddingTop: VP.spacing.lg,
    paddingBottom: VP.spacing.xxl,
  },

  // Identity card
  identityCard: {
    alignItems: "center",
    paddingVertical: VP.spacing.lg,
    gap: VP.spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: VP.colors.accent.cyanMuted,
    borderWidth: 2,
    borderColor: VP.colors.accent.cyan,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: VP.spacing.xs,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: "JetBrainsMono-Medium",
    color: VP.colors.accent.cyan,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
  },
  displayName: {
    ...VP.typography.header,
    color: VP.colors.text.primary,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
    width: "100%",
    paddingHorizontal: VP.spacing.md,
  },
  nicknameInput: {
    flex: 1,
    ...VP.typography.mono,
    color: VP.colors.accent.cyan,
    borderWidth: 1,
    borderColor: VP.colors.accent.cyan,
    borderRadius: VP.radius.sm,
    paddingHorizontal: VP.spacing.sm,
    paddingVertical: 10,
  },
  saveButton: {
    backgroundColor: VP.colors.accent.cyan,
    borderRadius: VP.radius.sm,
    paddingHorizontal: VP.spacing.md,
    paddingVertical: 10,
  },
  saveButtonText: {
    ...VP.typography.label,
    color: VP.colors.text.inverse,
    fontFamily: "SpaceGrotesk-SemiBold",
    letterSpacing: 1,
  },
  bleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VP.colors.accent.cyanGhost,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: VP.radius.full,
  },
  bleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: VP.colors.accent.cyan,
    marginRight: 6,
  },
  bleDotOffline: {
    backgroundColor: VP.colors.status.error,
  },
  bleLabel: {
    ...VP.typography.caption,
    color: VP.colors.accent.cyan,
    fontFamily: "SpaceGrotesk-Medium",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bleLabelOffline: {
    color: VP.colors.status.error,
  },

  // Section labels
  sectionLabel: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    textTransform: "uppercase",
    marginTop: VP.spacing.lg,
    marginBottom: VP.spacing.sm,
  },

  // Identity details
  identityDetails: {
    padding: 0,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: VP.spacing.md,
    gap: VP.spacing.sm,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    ...VP.typography.caption,
    color: VP.colors.text.disabled,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValueMono: {
    ...VP.typography.mono,
    color: VP.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: VP.colors.ghostBorder,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: VP.spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: VP.spacing.md,
  },
  statValue: {
    ...VP.typography.header,
    color: VP.colors.accent.cyan,
    marginBottom: 2,
  },
  statLabel: {
    ...VP.typography.caption,
    color: VP.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Security
  securityCard: {
    padding: 0,
    overflow: "hidden",
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: VP.spacing.md,
    gap: VP.spacing.sm,
  },
  securityRowInfo: {
    flex: 1,
  },
  securityRowLabel: {
    ...VP.typography.body,
    color: VP.colors.text.primary,
  },
  securityRowSubtext: {
    ...VP.typography.caption,
    color: VP.colors.text.secondary,
    marginTop: 2,
  },

  // Version
  versionText: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.disabled,
    textAlign: "center",
    marginTop: VP.spacing.xl,
  },
});
