import CreateOffline from "@/components/modals/CreateOfflineAddressModal";
import VoidCard from "@/components/ui/VoidCard";
import VoidScreen from "@/components/ui/VoidScreen";
import { VP } from "@/constants/void-protocol";
import { useOfflineWallets } from "@/hooks/useOfflineWallets";
import { useMWAOfflineWallets } from "@/hooks/useMWAOfflineWallets";
import { useWallet } from "@/src/contexts/WalletContext";
import { createSolanaConnection } from "@/src/utils/solana";
import { IWalletAdapter } from "@/src/infrastructure/wallet/transaction/MWADurableNonce";
import { Keypair, Transaction } from "@solana/web3.js";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { ArrowLeft, Copy, Plus, Trash, ArrowsClockwise } from "phosphor-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WalletSettingsScreen() {
  const router = useRouter();

  const {
    publicKey,
    isLoading: walletLoading,
    isConnected,
    walletMode,
    isSolanaMobile,
    deviceInfo,
    wallet,
    disconnect,
  } = useWallet();

  const connection = useMemo(
    () => createSolanaConnection({ network: "devnet" }),
    [],
  );

  const [authority, setAuthority] = useState<Keypair | null>(null);

  useEffect(() => {
    const loadAuthority = async () => {
      if (wallet && isConnected && walletMode === "local") {
        try {
          if ("exportSecretKey" in wallet) {
            const secretKey = await wallet.exportSecretKey();
            const keypair = Keypair.fromSecretKey(secretKey);
            setAuthority(keypair);
          }
        } catch (err) {
          console.error("[WalletSettings] Failed to load authority:", err);
        }
      }
    };
    loadAuthority();
  }, [wallet, isConnected, walletMode]);

  const mwaWalletAdapter: IWalletAdapter | null = useMemo(() => {
    if (!wallet || !publicKey) return null;
    const hasSignTransaction = typeof wallet.signTransaction === "function";
    if (!hasSignTransaction) return null;

    return {
      getPublicKey: () => publicKey,
      signTransaction: async (transaction: Transaction) => {
        const signed = await wallet.signTransaction(transaction);
        return signed as Transaction;
      },
      signAllTransactions: async (transactions: Transaction[]) => {
        const signed = await wallet.signAllTransactions(transactions);
        return signed as Transaction[];
      },
    };
  }, [wallet, publicKey]);

  const localWalletsHook = useOfflineWallets({ connection, authority });
  const mwaWalletsHook = useMWAOfflineWallets({
    connection,
    walletAdapter: mwaWalletAdapter,
  });

  const {
    wallets: offlineWallets,
    isLoading: offlineLoading,
    createWallet,
    deleteWallet,
    refreshBalances,
    sweepFunds,
  } = walletMode === "mwa" ? mwaWalletsHook : localWalletsHook;

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const isLoading = walletLoading || offlineLoading;

  const primaryWallet = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  const handleCopyPrimary = async () => {
    if (publicKey) {
      Clipboard.setStringAsync(publicKey.toBase58());
      Alert.alert("Copied", "Primary wallet address copied to clipboard");
    }
  };

  const handleCopyAddress = async (address: string) => {
    Clipboard.setStringAsync(address);
    Alert.alert("Copied", "Address copied to clipboard");
  };

  const handleRefreshBalances = async () => {
    try {
      await refreshBalances();
      Alert.alert("Success", "Balances refreshed");
    } catch {
      Alert.alert("Error", "Failed to refresh balances");
    }
  };

  const handleAddFunds = (addressId: string) => {
    Alert.alert("Add Funds", "Send SOL to this address from your primary wallet");
  };

  const handleSweepFunds = async (walletId: string) => {
    Alert.alert("Sweep Funds", "Transfer all funds from this offline wallet to your primary wallet?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sweep",
        onPress: async () => {
          try {
            const signature = await sweepFunds(walletId);
            Alert.alert("Success", `Funds swept!\nSignature: ${signature.slice(0, 8)}...`);
          } catch (err) {
            Alert.alert("Error", err instanceof Error ? err.message : "Failed to sweep funds");
          }
        },
      },
    ]);
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this offline address? The nonce account will be closed and rent recovered.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWallet(addressId, true);
              Alert.alert("Success", "Offline wallet deleted");
            } catch {
              Alert.alert("Error", "Failed to delete wallet");
            }
          },
        },
      ],
    );
  };

  const handleCreateNewAddress = () => {
    if (!isConnected || !wallet || !publicKey) {
      Alert.alert("Error", "Primary wallet not connected. Please connect your wallet first.");
      return;
    }
    setIsCreateModalVisible(true);
  };

  const handleDisconnectWallet = () => {
    Alert.alert(
      "Disconnect Wallet",
      "Disconnect the current wallet and return to onboarding?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            await disconnect();
            router.replace("/onboarding");
          },
        },
      ],
    );
  };

  const handleCreateAddress = async (
    label?: string,
    amount?: number,
    token?: "SOL" | "USDC" | "ZEC",
  ) => {
    if (!wallet || !publicKey || !isConnected) {
      Alert.alert("Error", "Wallet not connected");
      return;
    }
    if (walletMode === "local" && !authority) {
      Alert.alert("Error", "Primary wallet keypair not loaded");
      return;
    }
    if (walletMode === "mwa" && !mwaWalletAdapter) {
      Alert.alert("Error", "MWA wallet adapter not ready");
      return;
    }

    try {
      const initialFunding = token === "SOL" ? amount : 0;
      const newWallet = await createWallet({
        label,
        initialFundingSOL: initialFunding,
        createNonceAccount: true,
      });

      if (newWallet) {
        const fundingMsg = initialFunding
          ? `Funded with ${initialFunding} SOL`
          : "No initial funding (you can fund later)";
        Alert.alert(
          "Success",
          `Offline wallet created!\n\nAddress: ${newWallet.data.publicKey.slice(0, 8)}...${newWallet.data.publicKey.slice(-8)}\nNonce Account: ${newWallet.data.nonceAccount ? "Yes" : "No"}\n${fundingMsg}`,
        );
      }
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to create wallet");
    }
  };

  return (
    <VoidScreen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={12}
        >
          <ArrowLeft size={22} color={VP.colors.text.primary} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WALLET SETTINGS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Primary Wallet */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>PRIMARY WALLET</Text>
          {walletMode && (
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeText}>
                {walletMode === "mwa" ? "MWA" : "LOCAL"}
              </Text>
            </View>
          )}
        </View>

        <VoidCard style={styles.primaryCard}>
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={VP.colors.accent.cyan} />
              <Text style={styles.loadingText}>
                {walletMode === "mwa" ? "Connecting to wallet..." : "Loading..."}
              </Text>
            </View>
          ) : (
            <View style={styles.primaryRow}>
              <Text style={styles.primaryAddress}>{primaryWallet}</Text>
              <TouchableOpacity onPress={handleCopyPrimary} hitSlop={8}>
                <Copy size={20} color={VP.colors.text.secondary} weight="regular" />
              </TouchableOpacity>
            </View>
          )}
        </VoidCard>

        {isSolanaMobile && deviceInfo && (
          <VoidCard style={styles.deviceCard}>
            <Text style={styles.deviceText}>
              Solana Mobile: {deviceInfo.device} ({deviceInfo.model})
            </Text>
          </VoidCard>
        )}

        {/* Offline Wallets */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionLabel}>OFFLINE WALLETS</Text>
            {walletMode === "mwa" && (
              <View style={styles.mwaBadge}>
                <Text style={styles.mwaBadgeText}>MWA</Text>
              </View>
            )}
          </View>
          {offlineWallets.length > 0 && (
            <TouchableOpacity onPress={handleRefreshBalances} hitSlop={8}>
              <ArrowsClockwise size={18} color={VP.colors.accent.cyan} weight="regular" />
            </TouchableOpacity>
          )}
        </View>

        {offlineWallets.length === 0 ? (
          <VoidCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No offline wallets yet</Text>
            <Text style={styles.emptySubtext}>
              Create one for offline transactions
            </Text>
          </VoidCard>
        ) : (
          offlineWallets.map((w) => {
            const shortAddress = `${w.publicKey.slice(0, 4)}...${w.publicKey.slice(-4)}`;
            return (
              <VoidCard key={w.id} style={styles.walletCard}>
                {/* Address row */}
                <View style={styles.walletHeader}>
                  <TouchableOpacity
                    onPress={() => handleCopyAddress(w.publicKey)}
                    style={styles.addressRow}
                  >
                    <View style={styles.addressInfo}>
                      <Text style={styles.walletAddress}>{shortAddress}</Text>
                      {w.label && (
                        <Text style={styles.walletLabel}>{w.label}</Text>
                      )}
                      {w.nonceAccount && (
                        <Text style={styles.nonceText}>Nonce Account</Text>
                      )}
                    </View>
                    <Copy size={16} color={VP.colors.text.disabled} weight="regular" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteAddress(w.id)}
                    hitSlop={8}
                  >
                    <Trash size={18} color={VP.colors.status.error} weight="regular" />
                  </TouchableOpacity>
                </View>

                {/* Balances */}
                <View style={styles.balancesRow}>
                  <Text style={styles.balanceText}>
                    {w.balances.sol.toFixed(4)} SOL
                  </Text>
                  <Text style={styles.balanceSep}>|</Text>
                  <Text style={styles.balanceText}>
                    {w.balances.usdc.toFixed(2)} USDC
                  </Text>
                  <Text style={styles.balanceSep}>|</Text>
                  <Text style={styles.balanceText}>
                    {w.balances.zec.toFixed(4)} ZEC
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.walletActions}>
                  <TouchableOpacity
                    style={styles.actionOutline}
                    onPress={() => handleAddFunds(w.id)}
                  >
                    <Text style={styles.actionOutlineText}>Add Funds</Text>
                  </TouchableOpacity>
                  {w.balances.sol > 0 && (
                    <TouchableOpacity
                      style={styles.actionDanger}
                      onPress={() => handleSweepFunds(w.id)}
                    >
                      <Text style={styles.actionDangerText}>Sweep</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </VoidCard>
            );
          })
        )}

        {/* Create new */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateNewAddress}
          disabled={!isConnected || !wallet || !publicKey}
          activeOpacity={0.7}
        >
          <Plus size={18} color={VP.colors.accent.cyan} weight="regular" />
          <Text style={styles.createButtonText}>Create new offline wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={handleDisconnectWallet}
          activeOpacity={0.7}
        >
          <Text style={styles.disconnectButtonText}>Disconnect wallet</Text>
        </TouchableOpacity>
      </ScrollView>

      <CreateOffline
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreate={handleCreateAddress}
      />
    </VoidScreen>
  );
}

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
  backButton: { padding: 4 },
  headerTitle: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerSpacer: { width: 30 },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: VP.spacing.md,
    paddingTop: VP.spacing.md,
    paddingBottom: VP.spacing.xxl,
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: VP.spacing.lg,
    marginBottom: VP.spacing.sm,
  },
  sectionLabel: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    textTransform: "uppercase",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
  },
  modeBadge: {
    backgroundColor: VP.colors.accent.cyanMuted,
    borderRadius: VP.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  modeBadgeText: {
    ...VP.typography.caption,
    color: VP.colors.accent.cyan,
    fontFamily: "SpaceGrotesk-Bold",
    letterSpacing: 1,
  },
  mwaBadge: {
    backgroundColor: VP.colors.accent.cyan,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mwaBadgeText: {
    ...VP.typography.caption,
    color: VP.colors.text.inverse,
    fontFamily: "SpaceGrotesk-Bold",
  },

  // Primary wallet
  primaryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: VP.colors.accent.cyan,
    borderWidth: 1,
  },
  primaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  primaryAddress: {
    ...VP.typography.mono,
    color: VP.colors.accent.cyan,
    fontSize: 16,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
  },

  // Device info
  deviceCard: {
    marginTop: VP.spacing.sm,
    borderColor: VP.colors.accent.cyan,
    borderWidth: 1,
  },
  deviceText: {
    ...VP.typography.monoSmall,
    color: VP.colors.accent.cyan,
  },

  // Wallet cards
  walletCard: {
    marginBottom: VP.spacing.sm,
    borderColor: VP.colors.accent.cyan,
    borderWidth: 1,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: VP.spacing.sm,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
    flex: 1,
  },
  addressInfo: {
    flex: 1,
  },
  walletAddress: {
    ...VP.typography.mono,
    color: VP.colors.accent.cyan,
  },
  walletLabel: {
    ...VP.typography.caption,
    color: VP.colors.text.secondary,
    marginTop: 2,
  },
  nonceText: {
    ...VP.typography.caption,
    color: VP.colors.accent.cyan,
    marginTop: 2,
    fontFamily: "SpaceGrotesk-Medium",
  },
  balancesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: VP.spacing.sm,
  },
  balanceText: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.secondary,
  },
  balanceSep: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.disabled,
    marginHorizontal: VP.spacing.sm,
  },
  walletActions: {
    flexDirection: "row",
    gap: VP.spacing.sm,
  },
  actionOutline: {
    borderRadius: VP.radius.full,
    borderWidth: 1,
    borderColor: VP.colors.accent.cyan,
    paddingVertical: 6,
    paddingHorizontal: VP.spacing.md,
  },
  actionOutlineText: {
    ...VP.typography.label,
    color: VP.colors.accent.cyan,
    letterSpacing: 0.5,
  },
  actionDanger: {
    borderRadius: VP.radius.full,
    borderWidth: 1,
    borderColor: VP.colors.status.error,
    paddingVertical: 6,
    paddingHorizontal: VP.spacing.md,
  },
  actionDangerText: {
    ...VP.typography.label,
    color: VP.colors.status.error,
    letterSpacing: 0.5,
  },

  // Empty state
  emptyCard: {
    alignItems: "center",
    paddingVertical: VP.spacing.xl,
    borderStyle: "dashed",
  },
  emptyText: {
    ...VP.typography.subheader,
    color: VP.colors.text.secondary,
    marginBottom: VP.spacing.xs,
  },
  emptySubtext: {
    ...VP.typography.body,
    color: VP.colors.text.disabled,
    textAlign: "center",
  },

  // Create button
  createButton: {
    borderRadius: VP.radius.md,
    borderWidth: 1,
    borderColor: VP.colors.accent.cyan,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: VP.spacing.sm,
    marginTop: VP.spacing.sm,
  },
  createButtonText: {
    ...VP.typography.body,
    color: VP.colors.accent.cyan,
    fontFamily: "SpaceGrotesk-Medium",
  },
  disconnectButton: {
    marginTop: VP.spacing.md,
    borderRadius: VP.radius.md,
    borderWidth: 1,
    borderColor: VP.colors.status.error,
    backgroundColor: "rgba(255, 107, 107, 0.08)",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  disconnectButtonText: {
    ...VP.typography.body,
    color: VP.colors.status.error,
    fontFamily: "SpaceGrotesk-Medium",
    textTransform: "uppercase",
  },
});
