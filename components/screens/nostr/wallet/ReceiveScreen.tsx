import VoidCard from "@/components/ui/VoidCard";
import VoidScreen from "@/components/ui/VoidScreen";
import { VP } from "@/constants/void-protocol";
import { useStealthWallet } from "@/hooks/useStealthWallet";
import { useMeshChat } from "@/src/contexts/MeshBLEContext";
import { useWallet } from "@/src/contexts/WalletContext";
import { createSolanaConnection } from "@/src/utils/solana";
import { useRouter } from "expo-router";
import {
  CaretLeft,
  CopySimple,
  Lock,
  QrCode,
  ShareNetwork,
  WifiHigh,
} from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Clipboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function ReceiveScreen() {
  const router = useRouter();
  const { publicKey: walletPublicKey } = useWallet();
  const { peers } = useMeshChat();

  // Stealth wallet
  const connection = createSolanaConnection({ network: "devnet" });
  const { isInitialized: stealthInitialized, metaAddress } =
    useStealthWallet(connection);

  const [requestAmount, setRequestAmount] = useState("");
  const [displayAddress, setDisplayAddress] = useState("");

  const connectedPeers = peers.filter((p) => p.isConnected).length;

  useEffect(() => {
    if (walletPublicKey) {
      // Use stealth address if available, otherwise regular
      if (stealthInitialized && metaAddress) {
        setDisplayAddress(metaAddress);
      } else {
        setDisplayAddress(walletPublicKey.toBase58());
      }
    }
  }, [walletPublicKey, stealthInitialized, metaAddress]);

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 8) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleCopyAddress = () => {
    if (displayAddress) {
      Clipboard.setString(displayAddress);
      Alert.alert("Copied!", "Address copied to clipboard");
    }
  };

  const handleShare = () => {
    const shareText = requestAmount
      ? `Send ${requestAmount} SOL to: ${displayAddress}`
      : `My AnonMesh address: ${displayAddress}`;
    Alert.alert("Share Address", shareText);
  };

  const isStealthActive = stealthInitialized && metaAddress;

  return (
    <VoidScreen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <CaretLeft
            size={24}
            color={VP.colors.accent.cyan}
            weight="regular"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RECEIVE</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        {/* Stealth Status */}
        {isStealthActive && (
          <View style={styles.stealthBadge}>
            <Lock size={12} color={VP.colors.accent.purple} weight="fill" />
            <Text style={styles.stealthBadgeText}>
              ANONYMOUS RECEIVING ACTIVE
            </Text>
          </View>
        )}

        <Text style={styles.title}>
          {isStealthActive ? "Identity Address" : "Your Address"}
        </Text>

        {/* QR Code Card */}
        <VoidCard style={styles.qrCard}>
          <Text style={styles.qrLabel}>YOUR ADDRESS</Text>
          <View style={styles.qrWrapper}>
            {displayAddress ? (
              <QRCode
                value={displayAddress}
                size={200}
                backgroundColor="transparent"
                color={VP.colors.accent.cyan}
                quietZone={16}
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrPlaceholderText}>Loading...</Text>
              </View>
            )}
          </View>

          {/* Address Display */}
          <View style={styles.addressRow}>
            <Text style={styles.addressText}>
              {formatAddress(displayAddress)}
            </Text>
            {isStealthActive && (
              <Lock
                size={14}
                color={VP.colors.accent.purple}
                weight="fill"
              />
            )}
          </View>

          {/* Copy Button */}
          <Pressable style={styles.copyButton} onPress={handleCopyAddress}>
            <CopySimple
              size={16}
              color={VP.colors.text.inverse}
              weight="bold"
            />
            <Text style={styles.copyButtonText}>Copy Address</Text>
          </Pressable>
        </VoidCard>

        {/* Request Amount */}
        <View style={styles.requestSection}>
          <Text style={styles.requestLabel}>REQUEST AMOUNT (OPTIONAL)</Text>
          <View style={styles.requestRow}>
            <TextInput
              style={styles.requestInput}
              value={requestAmount}
              onChangeText={setRequestAmount}
              placeholder="0.00"
              placeholderTextColor={VP.colors.text.disabled}
              keyboardType="decimal-pad"
            />
            <Text style={styles.requestCurrency}>SOL</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionButton} onPress={handleShare}>
            <ShareNetwork
              size={20}
              color={VP.colors.accent.cyan}
              weight="regular"
            />
            <Text style={styles.actionLabel}>SHARE</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleCopyAddress}>
            <CopySimple
              size={20}
              color={VP.colors.accent.cyan}
              weight="regular"
            />
            <Text style={styles.actionLabel}>COPY</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              /* QR is already shown above */
            }}
          >
            <QrCode
              size={20}
              color={VP.colors.accent.cyan}
              weight="regular"
            />
            <Text style={styles.actionLabel}>CODE</Text>
          </Pressable>
        </View>

        {/* Mesh Info */}
        <VoidCard style={styles.meshInfoCard}>
          <View style={styles.meshInfoRow}>
            <WifiHigh
              size={20}
              color={VP.colors.accent.cyan}
              weight="regular"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.meshInfoTitle}>
                Your node is visible to {connectedPeers} mesh peer
                {connectedPeers !== 1 ? "s" : ""}
              </Text>
              <Text style={styles.meshInfoSubtext}>
                Peers can send directly via mesh without internet
              </Text>
            </View>
          </View>
        </VoidCard>
      </View>
    </VoidScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: VP.spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: VP.colors.ghostBorder,
  },
  backButton: {
    padding: VP.spacing.xs,
  },
  headerTitle: {
    ...VP.typography.label,
    color: VP.colors.text.primary,
    letterSpacing: 2,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: VP.spacing.md,
  },
  stealthBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: VP.spacing.xs,
    backgroundColor: VP.colors.accent.purpleMuted,
    paddingHorizontal: VP.spacing.sm,
    paddingVertical: 4,
    borderRadius: VP.radius.sm,
    marginTop: VP.spacing.md,
  },
  stealthBadgeText: {
    ...VP.typography.caption,
    color: VP.colors.accent.purple,
    fontFamily: "JetBrainsMono-Medium",
    letterSpacing: 1,
  },
  title: {
    ...VP.typography.header,
    color: VP.colors.text.primary,
    marginTop: VP.spacing.md,
    marginBottom: VP.spacing.md,
  },
  // QR Card
  qrCard: {
    alignItems: "center",
    paddingVertical: VP.spacing.lg,
  },
  qrLabel: {
    ...VP.typography.label,
    color: VP.colors.text.disabled,
    letterSpacing: 2,
    marginBottom: VP.spacing.md,
  },
  qrWrapper: {
    borderRadius: VP.radius.md,
    overflow: "hidden",
    marginBottom: VP.spacing.md,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  qrPlaceholderText: {
    ...VP.typography.body,
    color: VP.colors.text.disabled,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
    marginBottom: VP.spacing.md,
  },
  addressText: {
    ...VP.typography.mono,
    color: VP.colors.accent.cyan,
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
    backgroundColor: VP.colors.accent.cyan,
    paddingHorizontal: VP.spacing.lg,
    paddingVertical: 10,
    borderRadius: VP.radius.sm,
  },
  copyButtonText: {
    ...VP.typography.label,
    color: VP.colors.text.inverse,
    letterSpacing: 0.5,
  },
  // Request Amount
  requestSection: {
    marginTop: VP.spacing.lg,
  },
  requestLabel: {
    ...VP.typography.label,
    color: VP.colors.text.disabled,
    letterSpacing: 1,
    marginBottom: VP.spacing.sm,
  },
  requestRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: VP.spacing.sm,
  },
  requestInput: {
    fontSize: 28,
    fontFamily: "JetBrainsMono-Medium",
    color: VP.colors.text.primary,
    minWidth: 80,
  },
  requestCurrency: {
    ...VP.typography.subheader,
    color: VP.colors.accent.cyan,
    fontFamily: "JetBrainsMono-Regular",
  },
  // Actions
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: VP.spacing.xl,
    marginTop: VP.spacing.lg,
  },
  actionButton: {
    alignItems: "center",
    gap: VP.spacing.xs,
  },
  actionLabel: {
    ...VP.typography.caption,
    color: VP.colors.text.secondary,
    letterSpacing: 1,
  },
  // Mesh Info
  meshInfoCard: {
    marginTop: VP.spacing.lg,
    borderColor: VP.colors.accent.cyanMuted,
  },
  meshInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: VP.spacing.md,
  },
  meshInfoTitle: {
    ...VP.typography.body,
    color: VP.colors.text.primary,
    fontFamily: "SpaceGrotesk-Medium",
  },
  meshInfoSubtext: {
    ...VP.typography.caption,
    color: VP.colors.text.secondary,
    marginTop: 2,
  },
});
