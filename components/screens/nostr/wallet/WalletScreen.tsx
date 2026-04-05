import { VP } from "@/constants/void-protocol";
import { useStealthWallet } from "@/hooks/useStealthWallet";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import {
  Transaction,
  useTransactionHistory,
} from "@/hooks/useTransactionHistory";
import { useWallet } from "@/src/contexts/WalletContext";
import "@/src/polyfills";
import { createSolanaConnection } from "@/src/utils/solana";
import { useRouter } from "expo-router";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  EyeSlash,
  SlidersHorizontal,
} from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import USDCIcon from "@/components/icons/USDCIcon";
import ZECIcon from "@/components/icons/ZECIcon";
import VoidCard from "@/components/ui/VoidCard";
import VoidScreen from "@/components/ui/VoidScreen";
import QRCode from "react-native-qrcode-svg";

type WalletTab = "balance" | "history";

export default function WalletScreen() {
  const router = useRouter();
  const {
    wallet,
    publicKey: walletPublicKey,
    isConnected,
    connect,
    isLoading: isWalletLoading,
  } = useWallet();

  // Stealth wallet
  const connection = createSolanaConnection({ network: "devnet" });
  const { isInitialized: stealthInitialized, metaAddress } =
    useStealthWallet(connection);

  // Balances
  const { balances, isRefreshing, fetchBalances } = useWalletBalances();

  // Transaction history
  const {
    transactions,
    loading: historyLoading,
    error: historyError,
    walletAddress,
    refetch: refetchHistory,
  } = useTransactionHistory();

  // Local state
  const [activeTab, setActiveTab] = useState<WalletTab>("balance");
  const [publicKey, setPublicKey] = useState<string>("");
  const [displayAddress, setDisplayAddress] = useState<string>("");
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [useStealthMode, setUseStealthMode] = useState(false);

  // Initialize wallet and fetch balances
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!isConnected && !isWalletLoading) {
          await connect();
        }

        if (walletPublicKey && mounted) {
          const pubKeyString = walletPublicKey.toBase58();
          setPublicKey(pubKeyString);

          if (useStealthMode && stealthInitialized && metaAddress) {
            setDisplayAddress(metaAddress);
          } else {
            setDisplayAddress(pubKeyString);
          }

          await fetchBalances(walletPublicKey);
        }
      } catch (error) {
        console.error("[Wallet] Error initializing:", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [
    isConnected,
    isWalletLoading,
    walletPublicKey,
    connect,
    fetchBalances,
    stealthInitialized,
    metaAddress,
    useStealthMode,
  ]);

  // Show history errors
  useEffect(() => {
    if (historyError) {
      Alert.alert(
        historyError.includes("Rate limit") ? "Rate Limit" : "Error",
        historyError,
        [{ text: "OK" }],
      );
    }
  }, [historyError]);

  const handleCopyAddress = () => {
    if (displayAddress) {
      Clipboard.setString(displayAddress);
      const addressType =
        displayAddress === metaAddress
          ? "Stealth meta-address"
          : "Wallet address";
      Alert.alert("Copied!", `${addressType} copied to clipboard`);
    }
  };

  const handleSend = () => {
    router.push("/wallet/send" as any);
  };

  const handleReceive = () => {
    router.push("/wallet/receive" as any);
  };

  const handleAirdrop = async () => {
    try {
      setIsAirdropping(true);
      if (!wallet) throw new Error("Wallet not initialized");
      await wallet.airdropSol(1);
      Alert.alert("Success!", "1 SOL airdrop confirmed! Your balance will update shortly.");
      setTimeout(async () => {
        if (walletPublicKey) await fetchBalances(walletPublicKey);
      }, 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Airdrop Failed", errorMsg, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Use Web Faucet",
          onPress: () =>
            Alert.alert(
              "Web Faucet",
              `Visit https://faucet.solana.com and paste your address:\n\n${publicKey}`,
            ),
        },
      ]);
    } finally {
      setIsAirdropping(false);
    }
  };

  const handleToggleStealth = (value: boolean) => {
    if (value && !stealthInitialized) {
      Alert.alert(
        "Stealth Not Available",
        "Stealth wallet is still initializing. Please wait a moment.",
      );
      return;
    }
    setUseStealthMode(value);
  };

  const handleTransactionPress = (transaction: Transaction) => {
    Alert.alert(
      "Transaction Details",
      `Signature: ${transaction.signature}\n\n${transaction.type} ${transaction.type === "Send" ? "to" : "from"} ${transaction.address}\n\nAmount: ${transaction.amount} ${transaction.currency}\nStatus: ${transaction.status}\nTime: ${transaction.timestamp}`,
      [
        { text: "Close", style: "cancel" },
        {
          text: "View on Explorer",
          onPress: () =>
            Alert.alert(
              "Explorer",
              `https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`,
            ),
        },
      ],
    );
  };

  const formatAddress = (address: string) => {
    if (!address) return "XXXX...XXXX";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const isShowingStealth =
    useStealthMode && displayAddress === metaAddress && stealthInitialized;

  // Get total SOL balance for display
  const solBalance = balances.find((b) => b.symbol === "SOL");
  const totalSol = solBalance?.balance ?? 0;

  return (
    <VoidScreen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/wallet/settings" as any)}
        >
          <SlidersHorizontal
            size={20}
            color={VP.colors.text.secondary}
            weight="regular"
          />
        </TouchableOpacity>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <Pressable
          style={[
            styles.segmentButton,
            activeTab === "balance" && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab("balance")}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === "balance" && styles.segmentTextActive,
            ]}
          >
            Balance
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.segmentButton,
            activeTab === "history" && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === "history" && styles.segmentTextActive,
            ]}
          >
            History
          </Text>
        </Pressable>
      </View>

      {activeTab === "balance" ? (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Stealth Mode Toggle */}
          <VoidCard style={styles.stealthCard}>
            <View style={styles.stealthToggleContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stealthToggleTitle}>Stealth Mode</Text>
                <Text style={styles.stealthToggleSubtitle}>
                  {stealthInitialized
                    ? "Enhanced privacy for receiving funds"
                    : "Initializing..."}
                </Text>
              </View>
              <Switch
                value={useStealthMode}
                onValueChange={handleToggleStealth}
                trackColor={{
                  false: VP.colors.surfaceElevated,
                  true: VP.colors.accent.cyan,
                }}
                thumbColor={
                  useStealthMode
                    ? VP.colors.text.primary
                    : VP.colors.text.secondary
                }
                disabled={!stealthInitialized}
              />
            </View>
          </VoidCard>

          {/* Total Balance Card */}
          <VoidCard elevated style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
            {isShowingStealth && (
              <View style={styles.stealthBadge}>
                <EyeSlash
                  size={12}
                  color={VP.colors.accent.purple}
                  weight="bold"
                />
                <Text style={styles.stealthBadgeText}>STEALTH ACTIVE</Text>
              </View>
            )}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceAmount}>
                {solBalance?.isLoading
                  ? "..."
                  : totalSol.toFixed(4)}
              </Text>
              <Text style={styles.balanceCurrency}>SOL</Text>
            </View>
          </VoidCard>

          {/* QR + Address */}
          <View style={styles.qrSection}>
            <View style={styles.qrWrapper}>
              {displayAddress ? (
                <QRCode
                  value={displayAddress}
                  size={160}
                  backgroundColor="transparent"
                  color={VP.colors.text.primary}
                  quietZone={12}
                />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <ActivityIndicator color={VP.colors.accent.cyan} />
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.addressRow}
              onPress={handleCopyAddress}
            >
              <Text style={styles.addressText}>
                {formatAddress(displayAddress)}
              </Text>
              <Copy size={16} color={VP.colors.text.secondary} weight="regular" />
            </TouchableOpacity>
            {isShowingStealth && (
              <Text style={styles.addressSubtext}>
                Private deposits enabled
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSend}>
              <View style={styles.actionIconContainer}>
                <ArrowUp size={20} color={VP.colors.void} weight="bold" />
              </View>
              <Text style={styles.actionLabel}>SEND</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleReceive}
            >
              <View style={styles.actionIconContainer}>
                <ArrowDown size={20} color={VP.colors.void} weight="bold" />
              </View>
              <Text style={styles.actionLabel}>RECEIVE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, isAirdropping && styles.actionDisabled]}
              onPress={handleAirdrop}
              disabled={isAirdropping}
            >
              <View style={[styles.actionIconContainer, styles.airdropIcon]}>
                {isAirdropping ? (
                  <ActivityIndicator size="small" color={VP.colors.void} />
                ) : (
                  <Text style={{ fontSize: 18 }}>💧</Text>
                )}
              </View>
              <Text style={styles.actionLabel}>AIRDROP</Text>
            </TouchableOpacity>
          </View>

          {/* Assets Section */}
          <View style={styles.assetsSection}>
            <View style={styles.assetsTitleRow}>
              <Text style={styles.assetsTitle}>Assets</Text>
              {isRefreshing && (
                <ActivityIndicator size="small" color={VP.colors.accent.cyan} />
              )}
            </View>
            {balances.map((item, index) => (
              <VoidCard key={index} style={styles.assetItem}>
                <View style={styles.assetLeft}>
                  <View style={styles.assetIcon}>
                    {item.symbol === "SOL" && (
                      <Image
                        source={require("../../../../assets/images/sol-logo.png")}
                        style={{ width: 36, height: 36 }}
                      />
                    )}
                    {item.symbol === "USDC" && <USDCIcon size={36} />}
                    {item.symbol === "ZEC" && <ZECIcon size={36} />}
                  </View>
                  <View>
                    <Text style={styles.assetSymbol}>{item.symbol}</Text>
                    <Text style={styles.assetName}>{item.name}</Text>
                  </View>
                </View>
                {item.isLoading ? (
                  <ActivityIndicator size="small" color={VP.colors.accent.cyan} />
                ) : (
                  <Text style={styles.assetBalance}>
                    {item.balance.toFixed(item.symbol === "SOL" ? 4 : 2)}
                  </Text>
                )}
              </VoidCard>
            ))}
          </View>

          {/* Recent Activity Preview */}
          {transactions.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentTitleRow}>
                <Text style={styles.assetsTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => setActiveTab("history")}>
                  <Text style={styles.viewAllText}>VIEW ALL</Text>
                </TouchableOpacity>
              </View>
              {transactions.slice(0, 3).map((tx) => (
                <TouchableOpacity
                  key={tx.id}
                  style={styles.recentItem}
                  onPress={() => handleTransactionPress(tx)}
                >
                  <View style={styles.recentIcon}>
                    {tx.type === "Send" ? (
                      <ArrowUp
                        size={14}
                        color={VP.colors.status.error}
                        weight="bold"
                      />
                    ) : (
                      <ArrowDown
                        size={14}
                        color={VP.colors.accent.cyan}
                        weight="bold"
                      />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentType}>
                      {tx.type === "Send" ? "Sent" : "Received"} {tx.currency}
                    </Text>
                    <Text style={styles.recentTime}>{tx.timestamp}</Text>
                  </View>
                  <Text
                    style={[
                      styles.recentAmount,
                      tx.type === "Receive" && styles.recentAmountPositive,
                    ]}
                  >
                    {tx.type === "Send" ? "-" : "+"}
                    {tx.amount} {tx.currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      ) : (
        /* ==================== HISTORY TAB ==================== */
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* History Header */}
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>History</Text>
            <View style={styles.syncBadge}>
              <View style={styles.syncDot} />
              <Text style={styles.syncText}>NETWORK SYNC: ACTIVE</Text>
            </View>
          </View>

          {/* Transaction List */}
          {historyLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={VP.colors.accent.cyan} />
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found</Text>
              <Text style={styles.emptySubtext}>
                {walletAddress
                  ? "Your transaction history will appear here"
                  : "Connect your wallet to view transactions"}
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  onPress={() => handleTransactionPress(transaction)}
                >
                  <VoidCard style={styles.txItem}>
                    <View style={styles.txLeft}>
                      {/* Status Badge */}
                      <View
                        style={[
                          styles.txStatusBadge,
                          transaction.status === "Success"
                            ? styles.txStatusSuccess
                            : styles.txStatusPending,
                        ]}
                      >
                        <View
                          style={[
                            styles.txStatusDot,
                            transaction.status === "Success"
                              ? styles.txStatusDotSuccess
                              : styles.txStatusDotPending,
                          ]}
                        />
                        <Text
                          style={[
                            styles.txStatusText,
                            transaction.status === "Success"
                              ? styles.txStatusTextSuccess
                              : styles.txStatusTextPending,
                          ]}
                        >
                          {transaction.status === "Success"
                            ? "CONFIRMED"
                            : "PENDING"}
                        </Text>
                      </View>
                      {/* Type + Address */}
                      <Text style={styles.txType}>
                        {transaction.type === "Send"
                          ? "Outgoing Transfer"
                          : "Incoming Deposit"}
                      </Text>
                      <Text style={styles.txAddress}>
                        {transaction.type === "Send" ? "To:" : "From:"}{" "}
                        {transaction.address}
                      </Text>
                    </View>
                    <View style={styles.txRight}>
                      <Text
                        style={[
                          styles.txAmount,
                          transaction.type === "Receive" &&
                            styles.txAmountPositive,
                        ]}
                      >
                        {transaction.type === "Send" ? "-" : "+"}
                        {transaction.amount} {transaction.currency}
                      </Text>
                      <Text style={styles.txTimestamp}>
                        {transaction.timestamp}
                      </Text>
                    </View>
                  </VoidCard>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </VoidScreen>
  );
}

const styles = StyleSheet.create({
  // ── Header ──
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
    padding: VP.spacing.xs,
  },

  // ── Segmented Control ──
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: VP.spacing.md,
    marginTop: VP.spacing.md,
    marginBottom: VP.spacing.sm,
    backgroundColor: VP.colors.surface,
    borderRadius: VP.radius.md,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: VP.radius.sm,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: VP.colors.accent.cyan,
  },
  segmentText: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    letterSpacing: 1,
  },
  segmentTextActive: {
    color: VP.colors.text.inverse,
    fontFamily: "SpaceGrotesk-Bold",
  },

  // ── Content ──
  content: {
    flex: 1,
  },

  // ── Stealth Toggle ──
  stealthCard: {
    marginHorizontal: VP.spacing.md,
    marginTop: VP.spacing.md,
    borderColor: VP.colors.accent.cyanMuted,
  },
  stealthToggleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stealthToggleTitle: {
    ...VP.typography.subheader,
    color: VP.colors.text.primary,
  },
  stealthToggleSubtitle: {
    ...VP.typography.caption,
    color: VP.colors.text.secondary,
    marginTop: 2,
  },

  // ── Balance Card ──
  balanceCard: {
    marginHorizontal: VP.spacing.md,
    marginTop: VP.spacing.md,
    alignItems: "center",
    paddingVertical: VP.spacing.lg,
  },
  balanceLabel: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    letterSpacing: 2,
    marginBottom: VP.spacing.sm,
  },
  stealthBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VP.colors.accent.purpleMuted,
    paddingHorizontal: VP.spacing.sm,
    paddingVertical: 3,
    borderRadius: VP.radius.sm,
    gap: 4,
    marginBottom: VP.spacing.sm,
  },
  stealthBadgeText: {
    ...VP.typography.caption,
    color: VP.colors.accent.purple,
    fontFamily: "JetBrainsMono-Medium",
    letterSpacing: 1,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: VP.spacing.sm,
  },
  balanceAmount: {
    fontSize: 36,
    fontFamily: "JetBrainsMono-Medium",
    color: VP.colors.text.primary,
  },
  balanceCurrency: {
    fontSize: 18,
    fontFamily: "JetBrainsMono-Regular",
    color: VP.colors.accent.cyan,
  },

  // ── QR + Address ──
  qrSection: {
    alignItems: "center",
    marginTop: VP.spacing.lg,
    paddingHorizontal: VP.spacing.md,
  },
  qrWrapper: {
    borderRadius: VP.radius.md,
    borderWidth: 1,
    borderColor: VP.colors.accent.cyanMuted,
    padding: VP.spacing.sm,
    backgroundColor: VP.colors.surface,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
    marginTop: VP.spacing.md,
    paddingHorizontal: VP.spacing.md,
    paddingVertical: VP.spacing.sm,
    backgroundColor: VP.colors.surface,
    borderRadius: VP.radius.sm,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
  },
  addressText: {
    ...VP.typography.mono,
    color: VP.colors.accent.cyan,
    letterSpacing: 2,
  },
  addressSubtext: {
    ...VP.typography.caption,
    color: VP.colors.text.disabled,
    marginTop: VP.spacing.xs,
    fontStyle: "italic",
  },

  // ── Action Buttons ──
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: VP.spacing.xl,
    marginTop: VP.spacing.lg,
    paddingHorizontal: VP.spacing.md,
  },
  actionButton: {
    alignItems: "center",
    gap: VP.spacing.sm,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: VP.colors.accent.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  airdropIcon: {
    backgroundColor: VP.colors.accent.cyan,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionLabel: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    letterSpacing: 1.5,
  },

  // ── Assets Section ──
  assetsSection: {
    marginTop: VP.spacing.xl,
    paddingHorizontal: VP.spacing.md,
  },
  assetsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: VP.spacing.md,
  },
  assetsTitle: {
    ...VP.typography.subheader,
    color: VP.colors.text.primary,
  },
  assetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: VP.spacing.sm,
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.md,
  },
  assetIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  assetSymbol: {
    ...VP.typography.subheader,
    color: VP.colors.text.primary,
    fontFamily: "SpaceGrotesk-SemiBold",
  },
  assetName: {
    ...VP.typography.caption,
    color: VP.colors.text.secondary,
    marginTop: 2,
  },
  assetBalance: {
    fontSize: 18,
    fontFamily: "JetBrainsMono-Medium",
    color: VP.colors.text.primary,
  },

  // ── Recent Activity Preview ──
  recentSection: {
    marginTop: VP.spacing.xl,
    paddingHorizontal: VP.spacing.md,
  },
  recentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: VP.spacing.md,
  },
  viewAllText: {
    ...VP.typography.label,
    color: VP.colors.accent.cyan,
    letterSpacing: 1,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: VP.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: VP.colors.ghostBorder,
    gap: VP.spacing.md,
  },
  recentIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: VP.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  recentType: {
    ...VP.typography.body,
    color: VP.colors.text.primary,
  },
  recentTime: {
    ...VP.typography.caption,
    color: VP.colors.text.disabled,
    marginTop: 2,
  },
  recentAmount: {
    ...VP.typography.monoBold,
    color: VP.colors.text.secondary,
  },
  recentAmountPositive: {
    color: VP.colors.accent.cyan,
  },

  // ── History Tab ──
  historyHeader: {
    paddingHorizontal: VP.spacing.md,
    paddingTop: VP.spacing.md,
    paddingBottom: VP.spacing.sm,
  },
  historyTitle: {
    ...VP.typography.header,
    color: VP.colors.text.primary,
    marginBottom: VP.spacing.sm,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.xs,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: VP.colors.accent.cyan,
  },
  syncText: {
    ...VP.typography.monoSmall,
    color: VP.colors.accent.cyan,
    letterSpacing: 1,
  },
  transactionsList: {
    paddingHorizontal: VP.spacing.md,
    paddingTop: VP.spacing.sm,
  },
  txItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: VP.spacing.sm,
  },
  txLeft: {
    flex: 1,
    gap: 4,
  },
  txStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: VP.radius.sm,
    gap: 6,
  },
  txStatusSuccess: {
    backgroundColor: VP.colors.accent.cyan,
  },
  txStatusPending: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: VP.colors.accent.cyan,
  },
  txStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  txStatusDotSuccess: {
    backgroundColor: VP.colors.void,
  },
  txStatusDotPending: {
    backgroundColor: VP.colors.accent.cyan,
  },
  txStatusText: {
    fontSize: 10,
    fontFamily: "JetBrainsMono-Medium",
    letterSpacing: 1,
  },
  txStatusTextSuccess: {
    color: VP.colors.void,
  },
  txStatusTextPending: {
    color: VP.colors.text.primary,
  },
  txType: {
    ...VP.typography.subheader,
    color: VP.colors.text.primary,
    marginTop: 4,
  },
  txAddress: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.secondary,
  },
  txRight: {
    alignItems: "flex-end",
    gap: 4,
    marginLeft: VP.spacing.md,
  },
  txAmount: {
    ...VP.typography.monoBold,
    color: VP.colors.text.primary,
    fontSize: 16,
  },
  txAmountPositive: {
    color: VP.colors.accent.cyan,
  },
  txTimestamp: {
    ...VP.typography.caption,
    color: VP.colors.text.disabled,
  },

  // ── Shared States ──
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
    marginTop: VP.spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    ...VP.typography.subheader,
    color: VP.colors.text.secondary,
    textAlign: "center",
    marginBottom: VP.spacing.sm,
  },
  emptySubtext: {
    ...VP.typography.body,
    color: VP.colors.text.disabled,
    textAlign: "center",
  },
});
