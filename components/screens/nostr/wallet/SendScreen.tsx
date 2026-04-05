/**
 * SendScreen - Send SOL, USDC, and ZEC transactions
 *
 * Supports three transaction modes:
 * 1. Online (Internet) - Standard Solana transactions
 * 2. BLE Mesh - Peer-to-peer mesh network transactions
 * 3. Offline Wallets - Durable nonce accounts via BLE (BLE-only)
 *
 * ✨ v2.0 Improvement: Transactions Flow Like Messages
 * - Transactions are broadcast to all connected peers like regular messages
 * - Uses existing mesh sessions - no new handshakes needed
 * - Any peer can accept the transaction and be the second signer
 * - No timeout delays - transactions flow through established sessions
 *
 * ✨ v1.3.0 Improvement: Non-blocking Handshakes
 * - Transactions are sent immediately to native layer
 * - Noise protocol handshakes happen asynchronously in background
 * - No more 5-second timeout delays!
 * - Native layer automatically queues messages if session isn't ready
 *
 * Offline wallets use durable nonce accounts which:
 * - Create transactions that NEVER expire
 * - Enable truly offline transaction signing
 * - Can be broadcast via BLE mesh and relayed to Solana network later
 */

import USDCIcon from "@/components/icons/USDCIcon";
import ZECIcon from "@/components/icons/ZECIcon";
import QRScannerModal from "@/components/modals/QRScannerModal";
import SendConfirmationModal from "@/components/modals/SendConfirmationModal";
import NumericKeyboard from "@/components/ui/NumericKeyboard";
import VoidScreen from "@/components/ui/VoidScreen";
import { VP } from "@/constants/void-protocol";
import { useMWAOfflineWallets } from "@/hooks/useMWAOfflineWallets";
import { useOfflineWallets } from "@/hooks/useOfflineWallets";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { useWallet } from "@/src/contexts/WalletContext";
import { Packet } from "@/src/domain/entities/Packet";
// import { useBLENotificationUpdater } from "@/src/hooks/useBLENotificationUpdater";
import {
  TransactionApprovalModal,
  useMeshChat,
} from "@/src/contexts/MeshBLEContext";
import { useSolanaTransaction } from "@/src/hooks/useSolanaTransaction";
import { IWalletAdapter } from "@/src/infrastructure/wallet/transaction/MWADurableNonce";
import type { ConnectivityStatus } from "@/src/infrastructure/wallet/utils/connectivity";
import * as ConnectivityUtils from "@/src/infrastructure/wallet/utils/connectivity";
import "@/src/polyfills";
import { createSolanaConnection } from "@/src/utils/solana";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useRouter } from "expo-router";
import {
  CaretDown,
  CaretLeft,
  CaretUp,
  Scan,
  SlidersHorizontal,
} from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Type for transaction mode
type TransactionMode = "online" | "ble_mesh" | "offline_wallet";

// Wallet mode type
type WalletMode = "local" | "mwa" | "unknown";

type TokenType = "SOL" | "USDC" | "ZEC";

const USDC_DEVNET_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const SOL_USD_RATE = 141.457; // Approximate SOL/USD exchange rate

export default function SendScreen() {
  const router = useRouter();
  const {
    wallet,
    publicKey,
    isConnected,
    isLoading: isWalletLoading,
    walletMode: contextWalletMode,
  } = useWallet();
  const [amount, setAmount] = useState("0.00");
  const [token, setToken] = useState<TokenType>("SOL");
  const [recipient, setRecipient] = useState("");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [_selectedFrom, setSelectedFrom] = useState<
    "primary" | "disposable1" | "disposable2"
  >("primary");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [connectivity, setConnectivity] = useState<ConnectivityStatus | null>(
    null,
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Use wallet balances hook
  const { balances, isRefreshing, fetchBalances } = useWalletBalances();

  // Mesh chat context for discovering nearby peers
  const {
    peers: meshPeers,
    isInitialized: bleInitialized,
    isConnected: bleConnected,
    shouldUseBLEForNonceTx,
  } = useMeshChat();

  // Map mesh peers to legacy format for compatibility
  const discoveredDevices = React.useMemo(() => {
    return meshPeers.map((p) => ({
      id: p.peerId,
      name: p.nickname,
      isConnected: p.isConnected,
    }));
  }, [meshPeers]);

  // Create a keypair from wallet for transaction signing (Local wallet mode)
  const [walletKeypair, setWalletKeypair] = useState<any>(null);

  // Use wallet mode from context (single source of truth)
  const walletMode = contextWalletMode || "unknown";

  // Transaction mode state
  const [transactionMode, setTransactionMode] =
    useState<TransactionMode>("online");
  // Multiple wallet selection (array of selected wallet IDs)
  const [selectedOfflineWalletIds, setSelectedOfflineWalletIds] = useState<
    string[]
  >([]);

  // Connection for Solana transactions (memoized to prevent recreating)
  const connection = React.useMemo(
    () => createSolanaConnection({ network: "devnet" }),
    [],
  );

  // Load keypair for local wallet mode (needed for signing)
  // Try to export - if it fails, it's an MWA wallet (which is fine)
  useEffect(() => {
    const loadLocalKeypair = async () => {
      if (!wallet || !wallet.isConnected()) return;

      try {
        // Try to export secret key (only works for LocalWalletAdapter)
        const secretKey = await wallet.exportSecretKey();
        const { Keypair } = await import("@solana/web3.js");
        const kp = Keypair.fromSecretKey(secretKey);
        setWalletKeypair(kp);
        console.log("[SendScreen] ✅ Local wallet keypair loaded");
      } catch (error) {
        // Expected for MWA wallets - they can't export keys
        console.log(
          "[SendScreen] Not a local wallet (MWA detected), skipping keypair load",
        );
      }
    };
    loadLocalKeypair();
  }, [wallet]);

  // Create MWA wallet adapter as soon as we have wallet and publicKey
  // MWA wallet = has signTransaction (exportSecretKey may exist but throws for MWA)
  const mwaWalletAdapter: IWalletAdapter | null = React.useMemo(() => {
    console.log(
      "[SendScreen] Creating MWA adapter check - wallet:",
      !!wallet,
      "publicKey:",
      !!publicKey,
    );
    if (!wallet || !publicKey) return null;

    // Check if wallet can sign transactions
    const hasSignTransaction = typeof wallet.signTransaction === "function";

    if (!hasSignTransaction) {
      console.log("[SendScreen] Wallet cannot sign, skipping adapter");
      return null;
    }

    console.log("[SendScreen] ✅ Creating MWA wallet adapter");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey?.toBase58()]); // Only recreate when public key changes

  // Use offline wallets hook for Local wallets (only when in local mode)
  const localWalletsHook = useOfflineWallets({
    connection,
    authority: walletKeypair,
    bleMode: true,
  });

  // Use MWA offline wallets hook for MWA wallets (only when in mwa mode)
  const mwaWalletsHook = useMWAOfflineWallets({
    connection,
    walletAdapter: mwaWalletAdapter,
    bleMode: true,
  });

  // Select the appropriate hook based on wallet mode
  // For MWA mode or unknown mode with MWA adapter available, use MWA hook
  const useMWA =
    walletMode === "mwa" ||
    (walletMode === "unknown" && mwaWalletAdapter !== null);

  const {
    wallets: offlineWallets,
    isLoading: isOfflineWalletsLoading,
    isBLEMode,
    isBLEReady,
    createWallet: createOfflineWallet,
    sweepFunds,
    addFunds,
    reloadWallets,
    refreshBalances,
    createNonceTransaction,
    submitNonceTransaction,
    sendNonceTransactionBLE,
  } = useMWA ? mwaWalletsHook : localWalletsHook;

  // Debug logging
  useEffect(() => {
    console.log("[SendScreen] ========== DEBUG ==========");
    console.log("[SendScreen] Wallet mode from context:", walletMode);
    console.log("[SendScreen] Using MWA hook:", useMWA);
    console.log(
      "[SendScreen] MWA adapter available:",
      mwaWalletAdapter !== null,
    );
    console.log("[SendScreen] Offline wallets count:", offlineWallets.length);
    console.log("[SendScreen] Is MWA mode:", walletMode === "mwa");
    console.log("[SendScreen] Wallet object:", wallet ? "exists" : "null");
    console.log(
      "[SendScreen] PublicKey:",
      publicKey ? publicKey.toBase58().slice(0, 8) + "..." : "null",
    );
    console.log("[SendScreen] ==============================");
  }, [
    walletMode,
    useMWA,
    offlineWallets.length,
    mwaWalletAdapter,
    wallet,
    publicKey,
  ]);

  // Force reload wallets when MWA adapter becomes available
  useEffect(() => {
    console.log(
      "[SendScreen] Reload effect - mode:",
      walletMode,
      "adapter:",
      !!mwaWalletAdapter,
    );
    if (walletMode === "mwa" && mwaWalletAdapter && reloadWallets) {
      console.log(
        "[SendScreen] MWA adapter ready, triggering wallet reload...",
      );
      reloadWallets()
        .then(() => {
          console.log("[SendScreen] Wallet reload completed successfully");
        })
        .catch((err) => {
          console.error("[SendScreen] Failed to reload wallets:", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletMode, mwaWalletAdapter?.getPublicKey()?.toBase58()]);

  // Security: Clear keypair from memory when component unmounts
  useEffect(() => {
    return () => {
      if (walletKeypair?.secretKey) {
        walletKeypair.secretKey.fill(0);
      }
    };
  }, [walletKeypair]);

  // Solana transaction hook for BLE offline transactions
  const {
    sendTransactionRequest,
    pendingTransactions,
    incomingRequests,
    approveTransaction,
    rejectTransaction,
  } = useSolanaTransaction({
    connection,
    wallet: walletKeypair,
    onTransactionRequest: async (request, senderId) => {
      // Show approval UI for incoming transaction requests
      return new Promise((resolve) => {
        Alert.alert(
          "Transaction Request",
          `${senderId.slice(0, 8)} wants to co-sign a transaction.\n\n${request.memo || "No memo"}`,
          [
            { text: "Reject", style: "cancel", onPress: () => resolve(false) },
            { text: "Approve", onPress: () => resolve(true) },
          ],
        );
      });
    },
    onReceipt: (receipt) => {
      // Show receipt notification
      Alert.alert(
        receipt.status === "success"
          ? "Transaction Confirmed"
          : "Transaction Failed",
        `Signature: ${receipt.signature.slice(0, 8)}...${receipt.signature.slice(-8)}`,
        [{ text: "OK" }],
      );
    },
    onPacketReady: (packets: Packet[]) => {
      // Send packets via BLE - this will be handled by the BLE adapter
      console.log(
        "[SendScreen] Ready to send",
        packets.length,
        "packets via BLE",
      );
      // Packets will be sent automatically by the transaction service
    },
  });

  // Update BLE notification with pending transaction count
  // NOTE: useBLENotificationUpdater removed - using kard-network-ble-mesh now
  // useBLENotificationUpdater({
  //   connectedPeerCount: discoveredDevices.length,
  //   pendingTransactionCount: pendingTransactions.length,
  //   updateInterval: 5000,
  // });

  // Get balance for selected token
  const balance = balances.find((b) => b.symbol === token)?.balance ?? 0;

  // Get selected offline wallets and total balance
  const selectedOfflineWallets = offlineWallets.filter((w) =>
    selectedOfflineWalletIds.includes(w.id),
  );
  const totalOfflineBalance = selectedOfflineWallets.reduce(
    (sum, w) => sum + w.balances.sol,
    0,
  );
  const selectedWalletCount = selectedOfflineWallets.length;

  // Check connectivity
  useEffect(() => {
    const checkConnectivity = async () => {
      const status = await ConnectivityUtils.getConnectivityStatus();
      setConnectivity(status);
    };

    checkConnectivity();
    const unsubscribe =
      ConnectivityUtils.subscribeToConnectivityChanges(checkConnectivity);

    return () => {
      unsubscribe();
    };
  }, []);

  // Initialize wallet and fetch balances
  useEffect(() => {
    if (!isWalletLoading && !isConnected) {
      Alert.alert("Wallet Required", "Please connect your wallet first.");
      router.replace("/wallet" as any);
      return;
    }

    if (publicKey) {
      console.log(
        "[Send] Wallet loaded:",
        publicKey.toBase58().slice(0, 8) + "...",
      );
      // Fetch real balances from blockchain
      fetchBalances(publicKey);
    }
  }, [isConnected, isWalletLoading, publicKey, router, fetchBalances]);

  const handleCreateNewAddress = () => {
    router.push("/wallet/settings");
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const handleQRScanned = (data: string) => {
    console.log("[Send] QR scanned:", data);
    setRecipient(data);
    setShowQRScanner(false);
  };

  const handleTokenDropdown = () => {
    setShowTokenDropdown(!showTokenDropdown);
  };

  const handleSelectToken = (selectedToken: TokenType) => {
    setToken(selectedToken);
    setShowTokenDropdown(false);
  };

  const handleMaxAmount = () => {
    // Use nonce wallet balance if selected, otherwise use main wallet balance
    const currentBalance =
      selectedOfflineWalletIds.length > 0 ? totalOfflineBalance : balance;
    // Leave a small amount for transaction fees
    const maxAmount = Math.max(0, currentBalance - 0.001);
    setAmount(maxAmount.toFixed(token === "SOL" ? 4 : 2));
  };

  const handleBack = () => {
    router.back();
  };

  const handleSettings = () => {
    router.push("/wallet/settings");
  };

  const handleSendTransaction = async () => {
    if (!recipient) {
      Alert.alert("Error", "Please enter recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!publicKey) {
      Alert.alert("Error", "Wallet not initialized");
      return;
    }

    // Validate recipient address
    let recipientPubKey: PublicKey;
    try {
      recipientPubKey = new PublicKey(recipient);
    } catch (error) {
      Alert.alert("Error", "Invalid recipient address");
      return;
    }

    // Check if sufficient balance based on transaction mode
    const amountNum = parseFloat(amount);
    const currentBalance =
      transactionMode === "offline_wallet" && selectedWalletCount > 0
        ? totalOfflineBalance
        : balance;

    if (amountNum > currentBalance) {
      Alert.alert(
        "Insufficient Balance",
        `You only have ${currentBalance} ${token} available`,
      );
      return;
    }

    // Only SOL and USDC transfers supported (ZEC coming soon)
    if (token === "ZEC") {
      Alert.alert(
        "Coming Soon",
        `${token} transfers will be available soon. Currently only SOL and USDC transfers are supported.`,
      );
      return;
    }

    // === OFFLINE WALLET MODE (Nonce Account via BLE) ===
    if (transactionMode === "offline_wallet") {
      if (selectedWalletCount === 0) {
        Alert.alert("Error", "Please select at least one nonce wallet");
        return;
      }

      if (!isBLEReady) {
        Alert.alert(
          "BLE Not Ready",
          "BLE mesh is not initialized. Please wait for BLE to connect.",
        );
        return;
      }

      setIsSending(true);

      try {
        console.log("[Send] 📡 Creating nonce transactions for BLE mesh broadcast...");
        console.log(`[Send] From ${selectedWalletCount} nonce wallet(s)`);
        console.log(`[Send] To: ${recipientPubKey.toBase58()}`);
        console.log(`[Send] Total Amount: ${amountNum} SOL`);
        console.log("[Send] ✨ Transactions flow like messages - any peer can co-sign!");

        // Calculate amount per wallet (split equally for now)
        const amountPerWallet = amountNum / selectedWalletCount;
        const { SystemProgram, LAMPORTS_PER_SOL } =
          await import("@solana/web3.js");

        // Create transactions for each selected wallet
        const bleRequestIds: string[] = [];

        for (const wallet of selectedOfflineWallets) {
          // Check if wallet has enough balance
          if (wallet.balances.sol < amountPerWallet) {
            console.warn(
              `[Send] Wallet ${wallet.publicKey.slice(0, 8)} has insufficient balance`,
            );
            continue;
          }

          // Create transfer instruction
          const instruction = SystemProgram.transfer({
            fromPubkey: new PublicKey(wallet.publicKey),
            toPubkey: recipientPubKey,
            lamports: amountPerWallet * LAMPORTS_PER_SOL,
          });

          // Create durable nonce transaction
          const { serialized, nonceValue } = await createNonceTransaction(
            wallet.id,
            [instruction],
          );

          console.log(
            `[Send] Nonce transaction created for ${wallet.publicKey.slice(0, 8)}, nonce: ${nonceValue.slice(0, 16)}`,
          );

          // Broadcast transaction via BLE mesh
          // ✨ Flows like a regular message to all connected peers
          // Uses existing mesh sessions - no new handshakes needed
          // Any peer can accept and be the second signer
          // firstSignerPublicKey should be the WALLET's public key (the signer), not the nonce account
          const bleRequestId = await sendNonceTransactionBLE(
            wallet.id,
            serialized,
            wallet.publicKey, // This is the actual signer (offline wallet)
            "transfer",
            {
              description: `Transfer ${amountPerWallet.toFixed(4)} SOL from ${wallet.publicKey.slice(0, 8)}`,
            },
          );

          bleRequestIds.push(bleRequestId);
        }

        if (bleRequestIds.length === 0) {
          throw new Error(
            "No transactions could be created. Check wallet balances.",
          );
        }

        Alert.alert(
          "Nonce Transactions Broadcast via BLE",
          `✨ Broadcast ${bleRequestIds.length} transaction(s) to all connected peers!\n\n` +
            `Transactions flow like regular messages through the mesh.\n` +
            `Any peer can accept and co-sign - no targeted handshakes needed.\n\n` +
            `Total Amount: ${amountNum} SOL\n` +
            `Per Wallet: ${amountPerWallet.toFixed(4)} SOL\n\n` +
            `Request IDs:\n${bleRequestIds.join("\n").slice(0, 100)}...`,
          [
            {
              text: "OK",
              onPress: () => {
                setAmount("0.00");
                setRecipient("");
                setSelectedOfflineWalletIds([]);
                router.back();
              },
            },
          ],
        );
      } catch (err) {
        console.error("[Send] Nonce transaction error:", err);
        Alert.alert(
          "Transaction Failed",
          err instanceof Error ? err.message : "Unknown error occurred",
          [{ text: "OK" }],
        );
      } finally {
        setIsSending(false);
      }
      return;
    }

    // === BLE MESH MODE (Standard) ===
    // Transactions flow like regular messages through the mesh
    // - Broadcast to all connected peers without new handshakes
    // - Uses existing mesh sessions (established during normal chat flow)
    // - Any peer can accept and be the second signer
    if (transactionMode === "ble_mesh") {
      if (!bleInitialized) {
        Alert.alert("BLE Not Ready", "Bluetooth is not initialized.");
        return;
      }

      if (discoveredDevices.length === 0) {
        Alert.alert(
          "No Peers Found",
          "No Bluetooth peers detected. Make sure there are nearby devices.",
          [{ text: "OK" }],
        );
        return;
      }

      setIsSending(true);

      try {
        console.log("[Send] 📡 Broadcasting transaction via BLE mesh...");
        console.log("[Send] Transaction flows like a regular message to all peers");
        console.log(`[Send] Amount: ${amountNum} ${token}`);
        console.log(`[Send] ${discoveredDevices.length} peer(s) available to co-sign`);

        const requestId = await sendTransactionRequest({
          recipientPubkey: recipientPubKey,
          amountSOL: token === "SOL" ? amountNum : 0,
          memo: `${token} transfer via BLE mesh`,
          // targetPeerId is not set, so it broadcasts to all peers like a public message
        });

        if (requestId) {
          const peerNames = discoveredDevices
            .map((d) => d.name || d.id.slice(0, 8))
            .join(", ");
          Alert.alert(
            "Transaction Broadcast",
            `Transaction sent to ${discoveredDevices.length} peer(s): ${peerNames}\n\nAny peer can accept and co-sign this transaction.`,
            [{ text: "OK", onPress: () => router.back() }],
          );
        }
      } catch (err) {
        console.error("[Send] BLE error:", err);
        Alert.alert(
          "Failed",
          err instanceof Error ? err.message : "Unknown error",
        );
      } finally {
        setIsSending(false);
      }
      return;
    }

    // === ONLINE MODE ===
    setIsSending(true);

    try {
      console.log("[Send] Sending online transaction...");
      console.log("[Send] Token:", token);
      console.log("[Send] From:", publicKey.toBase58());
      console.log("[Send] To:", recipientPubKey.toBase58());
      console.log("[Send] Amount:", amountNum, token);

      if (!wallet || !wallet.isConnected()) {
        throw new Error("Wallet not connected");
      }

      const walletAdapter = wallet;

      // Create connection
      const connection = createSolanaConnection({ network: "devnet" });

      // Build transaction using wallet adapter
      const {
        Transaction,
        SystemProgram,
        LAMPORTS_PER_SOL,
        TransactionInstruction,
      } = await import("@solana/web3.js");

      const transaction = new Transaction();

      if (token === "SOL") {
        // SOL transfer
        console.log("[Send] Building SOL transfer...");
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPubKey,
            lamports: amountNum * LAMPORTS_PER_SOL,
          }),
        );
      } else if (token === "USDC") {
        // USDC (SPL Token) transfer - Manual implementation for React Native compatibility
        console.log("[Send] Building USDC transfer...");

        const mintPubKey = new PublicKey(USDC_DEVNET_MINT);

        // Token Program IDs
        const TOKEN_PROGRAM_ID = new PublicKey(
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        );
        const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
          "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
        );

        // Manually derive associated token addresses
        const getAssociatedTokenAddressSync = (
          mint: PublicKey,
          owner: PublicKey,
        ): PublicKey => {
          const [address] = PublicKey.findProgramAddressSync(
            [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID,
          );
          return address;
        };

        const senderTokenAccount = getAssociatedTokenAddressSync(
          mintPubKey,
          publicKey,
        );
        const recipientTokenAccount = getAssociatedTokenAddressSync(
          mintPubKey,
          recipientPubKey,
        );

        console.log(
          "[Send] Sender token account:",
          senderTokenAccount.toBase58(),
        );
        console.log(
          "[Send] Recipient token account:",
          recipientTokenAccount.toBase58(),
        );

        // Check if recipient token account exists
        const recipientAccountInfo = await connection.getAccountInfo(
          recipientTokenAccount,
        );

        if (!recipientAccountInfo) {
          console.log(
            "[Send] Recipient token account does not exist, creating...",
          );

          // Manually create associated token account instruction
          const keys = [
            { pubkey: publicKey, isSigner: true, isWritable: true }, // payer
            {
              pubkey: recipientTokenAccount,
              isSigner: false,
              isWritable: true,
            }, // associated token account
            { pubkey: recipientPubKey, isSigner: false, isWritable: false }, // wallet address
            { pubkey: mintPubKey, isSigner: false, isWritable: false }, // token mint
            {
              pubkey: new PublicKey("11111111111111111111111111111111"),
              isSigner: false,
              isWritable: false,
            }, // system program
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token program
          ];

          transaction.add(
            new TransactionInstruction({
              keys,
              programId: ASSOCIATED_TOKEN_PROGRAM_ID,
              data: Buffer.from([]), // Create instruction has no data
            }),
          );
        }

        // Add token transfer instruction
        // USDC has 6 decimals on devnet
        const usdcDecimals = 6;
        const transferAmount = Math.floor(
          amountNum * Math.pow(10, usdcDecimals),
        );

        console.log("[Send] Transfer amount (base units):", transferAmount);

        // Manually create transfer instruction
        // Instruction: 3 (Transfer) + amount (u64, 8 bytes)
        const dataLayout = Buffer.alloc(9);
        dataLayout.writeUInt8(3, 0); // Transfer instruction
        dataLayout.writeBigUInt64LE(BigInt(transferAmount), 1);

        const transferKeys = [
          { pubkey: senderTokenAccount, isSigner: false, isWritable: true }, // source
          {
            pubkey: recipientTokenAccount,
            isSigner: false,
            isWritable: true,
          }, // destination
          { pubkey: publicKey, isSigner: true, isWritable: false }, // owner
        ];

        transaction.add(
          new TransactionInstruction({
            keys: transferKeys,
            programId: TOKEN_PROGRAM_ID,
            data: dataLayout,
          }),
        );
      }

      // Add memo
      transaction.add(
        new TransactionInstruction({
          keys: [],
          programId: new PublicKey(
            "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
          ),
          data: Buffer.from(`Sent ${token} from anon0mesh`, "utf-8"),
        }),
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      console.log("[Send] Transaction built, signing...");

      // Sign transaction using wallet adapter
      const signedTransaction =
        await walletAdapter.signTransaction(transaction);

      console.log("[Send] Transaction signed, submitting...");

      // Submit transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
          maxRetries: 3,
        },
      );

      console.log("[Send] Transaction submitted:", signature);
      console.log("[Send] Waiting for confirmation...");

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed",
      );

      if (confirmation.value.err) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
        );
      }

      console.log("[Send] ✅ Transaction confirmed!");

      // Refresh balances
      await fetchBalances(publicKey);

      // Show success
      Alert.alert(
        "Transaction Sent!",
        `Successfully sent ${amountNum} ${token} to ${recipientPubKey.toBase58().slice(0, 8)}...\n\nSignature: ${signature.slice(0, 8)}...`,
        [
          {
            text: "View Details",
            onPress: () => {
              // TODO: Open transaction details or explorer
              console.log("View tx:", signature);
              console.log(
                "Explorer:",
                `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
              );
            },
          },
          {
            text: "Done",
            onPress: () => {
              setShowConfirmation(true);
              // Reset form
              setAmount("0.00");
              setRecipient("");
            },
          },
        ],
      );
    } catch (error) {
      console.error("[Send] Transaction failed:", error);
      Alert.alert(
        "Transaction Failed",
        error instanceof Error ? error.message : "An unknown error occurred",
        [{ text: "OK" }],
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <VoidScreen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <CaretLeft size={24} color={VP.colors.accent.cyan} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SEND</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettings}
        >
          <SlidersHorizontal size={20} color={VP.colors.text.secondary} weight="regular" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

          {/* Token Selector & Amount */}
          <View style={styles.amountCard}>
            <View style={styles.amountCardHeader}>
              <View style={styles.tokenSelectorContainer}>
                <TouchableOpacity
                  style={styles.tokenSelector}
                  onPress={handleTokenDropdown}
                >
                  <View style={styles.tokenIconWrapper}>
                    {token === "SOL" && (
                      <Image
                        source={require("../../../../assets/images/sol-logo.png")}
                        style={styles.tokenImage}
                      />
                    )}
                    {token === "USDC" && <USDCIcon size={24} />}
                    {token === "ZEC" && <ZECIcon size={24} />}
                  </View>
                  <Text style={styles.tokenText}>{token}</Text>
                  {showTokenDropdown ? (
                    <CaretUp size={20} color={VP.colors.accent.cyan} weight="regular" />
                  ) : (
                    <CaretDown size={20} color={VP.colors.accent.cyan} weight="regular" />
                  )}
                </TouchableOpacity>

                {/* Token Dropdown */}
                {showTokenDropdown && (
                  <View style={styles.tokenDropdown}>
                    {(["SOL", "USDC", "ZEC"] as TokenType[])
                      .filter((t) => t !== token)
                      .map((t, index) => (
                        <TouchableOpacity
                          key={t}
                          style={[
                            styles.tokenOption,
                            index === 0 && styles.tokenOptionFirst,
                          ]}
                          onPress={() => handleSelectToken(t)}
                        >
                          <View style={styles.tokenIconWrapper}>
                            {t === "SOL" && (
                              <Image
                                source={require("../../../../assets/images/sol-logo.png")}
                                style={styles.tokenImage}
                              />
                            )}
                            {t === "USDC" && <USDCIcon size={24} />}
                            {t === "ZEC" && <ZECIcon size={24} />}
                          </View>
                          <Text style={styles.tokenOptionText}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                )}
              </View>

              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                showSoftInputOnFocus={false}
                placeholder="0.00"
                placeholderTextColor={VP.colors.text.disabled}
                caretHidden={false}
              />
            </View>

            <View style={styles.balanceRow}>
              <View style={styles.balanceLeft}>
                <Text style={styles.balanceLabel}>Balance:</Text>
                {isRefreshing || isOfflineWalletsLoading ? (
                  <ActivityIndicator size="small" color={VP.colors.accent.cyan} />
                ) : (
                  <>
                    <Text style={styles.balanceAmount}>
                      {selectedOfflineWalletIds.length > 0
                        ? `${totalOfflineBalance.toFixed(token === "SOL" ? 4 : 2)} ${token} (nonce)`
                        : `${balance.toFixed(token === "SOL" ? 4 : 2)} ${token}`}
                    </Text>
                    {selectedOfflineWalletIds.length > 0 && (
                      <Text style={styles.nonceWalletIndicator}>
                        (Using offline wallet)
                      </Text>
                    )}
                  </>
                )}
              </View>
              {!isRefreshing && !isOfflineWalletsLoading && (
                <Text style={styles.usdValue}>
                  ≈${" "}
                  {token === "SOL"
                    ? (balance * SOL_USD_RATE).toFixed(2)
                    : token === "USDC"
                      ? balance.toFixed(2)
                      : "0.00"}
                </Text>
              )}
            </View>
          </View>

          {/* To Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>To</Text>
            <View style={styles.recipientContainer}>
              <TextInput
                style={styles.recipientInput}
                placeholder="Enter recipient address..."
                value={recipient}
                onChangeText={setRecipient}
                placeholderTextColor={VP.colors.text.disabled}
              />
              <TouchableOpacity onPress={handleQRScan} style={styles.qrButton}>
                <Scan size={24} color={VP.colors.accent.cyan} weight="regular" />
              </TouchableOpacity>
            </View>
          </View>

          {/* From Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>From</Text>
            <View style={styles.fromContainer}>
              <TouchableOpacity
                style={styles.fromSelector}
                onPress={() => setShowFromDropdown(!showFromDropdown)}
              >
                {/* Show Primary or Nonce Wallet selection */}
                {selectedOfflineWalletIds.length > 0 ? (
                  <View style={styles.fromSelectorContent}>
                    <Text style={styles.fromPrimaryText}>Official Wallet</Text>
                    <Text style={styles.fromSecondaryText}>
                      Balance: {totalOfflineBalance.toFixed(4)} SOL
                    </Text>
                  </View>
                ) : (
                  <View style={styles.fromSelectorContent}>
                    <Text style={styles.fromPrimaryText}>
                      Primary Wallet (
                      {publicKey
                        ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
                        : "Loading..."}
                      )
                    </Text>
                    {walletMode !== "unknown" && (
                      <Text style={styles.walletModeText}>
                        {walletMode === "mwa" ? "Seeker Mode" : "🔑 Local Mode"}
                      </Text>
                    )}
                  </View>
                )}
                {showFromDropdown ? (
                  <CaretUp size={20} color={VP.colors.text.secondary} weight="regular" />
                ) : (
                  <CaretDown size={20} color={VP.colors.text.secondary} weight="regular" />
                )}
              </TouchableOpacity>

              {/* From Dropdown */}
              {showFromDropdown && (
                <View style={styles.fromDropdown}>
                  {/* MWA Mode Indicator */}
                  {walletMode === "mwa" && (
                    <View style={styles.mwaModeBanner}>
                      <Text style={styles.mwaModeText}>
                        Seeker Mode - Offline Wallets via Wallet Adapter
                      </Text>
                    </View>
                  )}

                  {/* Nonce Wallets Section */}
                  {/* Show wallets section always, but content varies */}
                  <View style={styles.fromSection}>
                    <View style={styles.fromSectionHeader}>
                      <Text style={styles.fromSectionTitle}>
                        Nonce Wallets {walletMode === "mwa" && "(MWA)"}
                      </Text>
                      <View style={styles.fromSectionActions}>
                        {isOfflineWalletsLoading && (
                          <ActivityIndicator
                            size="small"
                            color={VP.colors.accent.cyan}
                            style={{ marginRight: 8 }}
                          />
                        )}
                        <Text style={styles.fromSectionCount}>
                          {selectedOfflineWalletIds.length > 0
                            ? "● Selected"
                            : "Tap to select"}
                        </Text>
                      </View>
                    </View>

                    {/* Show wallet list if we have wallets */}
                    {offlineWallets.length > 0 ? (
                      <>
                        <View style={styles.fromWalletList}>
                          {offlineWallets.map((wallet) => {
                            const isSelected =
                              selectedOfflineWalletIds.includes(wallet.id);
                            return (
                              <TouchableOpacity
                                key={wallet.id}
                                style={[
                                  styles.fromWalletOption,
                                  isSelected && styles.fromWalletOptionSelected,
                                ]}
                                onPress={() => {
                                  if (isSelected) {
                                    // Deselect if already selected
                                    setSelectedOfflineWalletIds([]);
                                    setTransactionMode("online");
                                  } else {
                                    // Single selection: replace any previously selected
                                    setSelectedOfflineWalletIds([wallet.id]);
                                    setTransactionMode("offline_wallet");
                                  }
                                }}
                              >
                                <View style={styles.fromWalletCheckbox}>
                                  <View
                                    style={[
                                      styles.checkbox,
                                      isSelected && styles.checkboxSelected,
                                    ]}
                                  >
                                    {isSelected && (
                                      <Text style={styles.checkmark}>✓</Text>
                                    )}
                                  </View>
                                </View>
                                <View style={styles.fromWalletInfo}>
                                  <Text style={styles.fromWalletLabel}>
                                    {wallet.label || "Wallet"}
                                  </Text>
                                  <Text style={styles.fromWalletBalance}>
                                    {wallet.balances.sol.toFixed(4)} SOL
                                  </Text>
                                  <Text style={styles.fromWalletAddress}>
                                    {wallet.publicKey.slice(0, 6)}...
                                    {wallet.publicKey.slice(-4)}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {/* Selected Wallet Balance */}
                        {selectedOfflineWalletIds.length > 0 && (
                          <View style={styles.fromTotalBalance}>
                            <Text style={styles.fromTotalLabel}>Balance:</Text>
                            <Text style={styles.fromTotalValue}>
                              {totalOfflineBalance.toFixed(4)} SOL
                            </Text>
                          </View>
                        )}

                        {/* Clear / Refresh */}
                        <View style={styles.fromActions}>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedOfflineWalletIds([]);
                              setTransactionMode("online");
                            }}
                          >
                            <Text style={styles.fromActionText}>
                              Clear Selection
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={async () => {
                              console.log(
                                "[SendScreen] Manual refresh triggered",
                              );
                              await refreshBalances();
                            }}
                          >
                            <Text
                              style={[
                                styles.fromActionText,
                                { color: VP.colors.accent.cyan },
                              ]}
                            >
                              ↻ Refresh
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      /* Show message when no wallets found */
                      <View style={styles.noWalletsMessage}>
                        <Text style={styles.noWalletsText}>
                          No offline wallets found
                        </Text>
                        <Text style={styles.noWalletsSubtext}>
                          {walletMode === "mwa"
                            ? "Create wallets in Wallet Settings first"
                            : "Create a wallet using the button below"}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Create New Wallet */}
                  <TouchableOpacity
                    style={styles.createNewButton}
                    onPress={async () => {
                      try {
                        const newWallet = await createOfflineWallet({
                          label: `Wallet ${offlineWallets.length + 1}`,
                          createNonceAccount: true,
                        });
                        if (newWallet) {
                          Alert.alert(
                            "Nonce Wallet Created",
                            `Address: ${newWallet.data.publicKey.slice(0, 8)}...\n\n` +
                              "This wallet uses BLE mesh for transactions.",
                          );
                        }
                      } catch (err) {
                        Alert.alert(
                          "Error",
                          err instanceof Error
                            ? err.message
                            : "Failed to create wallet",
                        );
                      }
                    }}
                  >
                    <Text style={styles.createNewIcon}>+</Text>
                    <Text style={styles.createNewText}>
                      Create new nonce wallet
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (isSending || !recipient || !amount || parseFloat(amount) <= 0) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSendTransaction}
            disabled={
              isSending || !recipient || !amount || parseFloat(amount) <= 0
            }
          >
            {isSending ? (
              <ActivityIndicator size="small" color={VP.colors.text.primary} />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>

          {/* Custom Numeric Keyboard */}
          {!isSending && (
            <NumericKeyboard
              showDoneButton={false}
              maxAmount={
                selectedOfflineWalletIds.length > 0
                  ? totalOfflineBalance
                  : balance
              }
              onPercentage={(percentage) => {
                // Use nonce wallet balance if selected, otherwise main wallet
                const currentBalance =
                  selectedOfflineWalletIds.length > 0
                    ? totalOfflineBalance
                    : balance;
                const calculatedAmount = (currentBalance * percentage) / 100;
                setAmount(calculatedAmount.toFixed(5));
              }}
              onPress={(key) => {
                setAmount((prev) => {
                  // If current amount is "0.00" or "0", replace it
                  if (prev === "0.00" || prev === "0") {
                    return key === "." ? "0." : key;
                  }

                  // Prevent multiple decimal points
                  if (key === "." && prev.includes(".")) {
                    return prev;
                  }

                  // Limit to 5 decimal places
                  if (prev.includes(".")) {
                    const decimalPart = prev.split(".")[1];
                    if (decimalPart && decimalPart.length >= 5) {
                      return prev; // Don't add more digits
                    }
                  }

                  return prev + key;
                });
              }}
              onBackspace={() =>
                setAmount((prev) => {
                  const newAmount = prev.slice(0, -1);
                  return newAmount || "0.00";
                })
              }
            />
          )}

          {/* Connectivity Status */}
          {connectivity && transactionMode === "online" && (
            <View style={styles.connectivityBanner}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: connectivity.isInternetConnected
                      ? VP.colors.accent.cyan
                      : connectivity.isBluetoothAvailable
                        ? VP.colors.status.warning
                        : VP.colors.status.error,
                  },
                ]}
              />
              <Text style={styles.connectivityText}>
                {connectivity.isInternetConnected
                  ? "Connected to Internet"
                  : connectivity.isBluetoothAvailable
                    ? "Offline mode - Using Bluetooth Mesh"
                    : "No connection available"}
              </Text>
            </View>
          )}
        </ScrollView>

      <SendConfirmationModal
        visible={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          router.back();
        }}
        isBluetooth={connectivity?.isBluetoothAvailable}
      />

      <QRScannerModal
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScanned}
      />

      {/* Transaction Approval Modal - Shows when peers send tx requests */}
      <TransactionApprovalModal />
    </VoidScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
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
  settingsButton: {
    padding: VP.spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: VP.spacing.md,
    paddingTop: VP.spacing.md,
    paddingBottom: VP.spacing.md,
  },
  // Amount Card
  amountCard: {
    backgroundColor: VP.colors.surface,
    borderRadius: VP.radius.lg,
    padding: 14,
    marginVertical: VP.spacing.md,
    overflow: "visible",
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
  },
  amountCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: VP.spacing.md,
    gap: VP.spacing.md,
  },
  tokenSelectorContainer: {
    position: "relative",
    width: "40%",
    backgroundColor: VP.colors.surfaceElevated,
    borderRadius: VP.radius.md,
    overflow: "visible",
  },
  tokenSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
    paddingHorizontal: VP.spacing.md,
    paddingVertical: 10,
  },
  tokenIconWrapper: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  tokenImage: {
    width: 24,
    height: 24,
  },
  tokenText: {
    flex: 1,
    color: VP.colors.text.primary,
    ...VP.typography.subheader,
  },
  amountInput: {
    color: VP.colors.text.primary,
    fontSize: 32,
    fontFamily: "JetBrainsMono-Medium",
    textAlign: "right",
    marginBottom: VP.spacing.sm,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: VP.spacing.sm,
  },
  balanceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.xs,
  },
  balanceLabel: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
  },
  balanceAmount: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
  },
  maxLabel: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
  },
  usdValue: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
  },
  // Token Dropdown
  tokenDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: VP.colors.surfaceElevated,
    borderRadius: VP.radius.md,
    borderTopWidth: 1,
    borderTopColor: VP.colors.accent.cyanMuted,
    marginTop: 4,
    zIndex: 100,
    ...VP.shadow.md,
  },
  tokenOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
    padding: VP.spacing.md,
    borderTopWidth: 1,
    borderTopColor: VP.colors.ghostBorder,
  },
  tokenOptionFirst: {
    borderTopWidth: 0,
  },
  tokenOptionText: {
    color: VP.colors.text.primary,
    ...VP.typography.subheader,
  },
  // Section
  section: {
    marginBottom: VP.spacing.md,
  },
  sectionLabel: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    letterSpacing: 1,
    marginBottom: VP.spacing.sm,
  },
  // Recipient Input
  recipientContainer: {
    backgroundColor: VP.colors.surface,
    borderRadius: VP.radius.md,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: VP.spacing.md,
    paddingVertical: VP.spacing.md,
  },
  recipientInput: {
    flex: 1,
    color: VP.colors.accent.cyan,
    ...VP.typography.mono,
    fontSize: 14,
  },
  recipientPlaceholder: {
    color: VP.colors.accent.cyanMuted,
    ...VP.typography.mono,
  },
  qrButton: {
    padding: VP.spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  // From Selector
  fromContainer: {
    backgroundColor: VP.colors.surface,
    borderRadius: VP.radius.md,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
    overflow: "hidden",
  },
  fromSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: VP.spacing.md,
    paddingVertical: VP.spacing.lg,
  },
  fromPrimaryText: {
    ...VP.typography.mono,
    color: VP.colors.accent.cyan,
  },
  fromDropdown: {
    borderTopWidth: 1,
    borderTopColor: VP.colors.ghostBorder,
    maxHeight: 300,
  },
  fromSelectorContent: {
    flexDirection: "column",
  },
  fromSecondaryText: {
    ...VP.typography.caption,
    color: VP.colors.text.secondary,
    marginTop: 2,
  },
  walletModeText: {
    ...VP.typography.caption,
    color: VP.colors.accent.cyan,
    marginTop: 2,
    fontFamily: "JetBrainsMono-Medium",
  },
  fromSection: {
    paddingVertical: VP.spacing.md,
  },
  fromSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: VP.spacing.md,
    marginBottom: VP.spacing.sm,
  },
  fromSectionTitle: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  fromSectionCount: {
    ...VP.typography.label,
    color: VP.colors.accent.cyan,
  },
  fromWalletList: {
    paddingHorizontal: VP.spacing.md,
  },
  fromWalletOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: VP.spacing.md,
    paddingVertical: 10,
    backgroundColor: VP.colors.surfaceElevated,
    borderRadius: VP.radius.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
  },
  fromWalletOptionSelected: {
    borderColor: VP.colors.accent.cyan,
    backgroundColor: VP.colors.accent.cyanGhost,
  },
  fromWalletCheckbox: {
    marginRight: VP.spacing.md,
  },
  fromWalletInfo: {
    flex: 1,
  },
  fromWalletLabel: {
    ...VP.typography.body,
    color: VP.colors.text.primary,
    fontFamily: "SpaceGrotesk-Medium",
  },
  fromWalletBalance: {
    ...VP.typography.mono,
    color: VP.colors.accent.cyan,
    marginTop: 2,
  },
  fromWalletAddress: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.secondary,
    marginTop: 2,
  },
  fromTotalBalance: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: VP.spacing.md,
    paddingVertical: VP.spacing.sm,
    marginTop: VP.spacing.sm,
    backgroundColor: VP.colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: VP.colors.ghostBorder,
  },
  fromTotalLabel: {
    ...VP.typography.caption,
    color: VP.colors.text.secondary,
  },
  fromTotalValue: {
    ...VP.typography.mono,
    color: VP.colors.accent.cyan,
  },
  fromActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: VP.spacing.md,
    paddingHorizontal: VP.spacing.md,
    paddingTop: VP.spacing.md,
  },
  fromActionText: {
    ...VP.typography.label,
    color: VP.colors.accent.cyan,
    textDecorationLine: "underline",
  },
  fromOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: VP.spacing.md,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: VP.colors.ghostBorder,
  },
  fromOptionText: {
    ...VP.typography.subheader,
    color: VP.colors.accent.cyan,
  },
  fromOptionBalance: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
  },
  createNewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
    paddingHorizontal: VP.spacing.md,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: VP.colors.ghostBorder,
  },
  createNewIcon: {
    color: VP.colors.text.secondary,
    fontSize: 18,
    fontWeight: "bold",
  },
  createNewText: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
  },
  // Send Button
  sendButton: {
    backgroundColor: VP.colors.accent.cyan,
    borderRadius: VP.radius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: VP.spacing.md,
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  sendButtonText: {
    ...VP.typography.subheader,
    color: VP.colors.text.inverse,
    fontFamily: "SpaceGrotesk-Bold",
    letterSpacing: 1,
  },
  // Connectivity Status
  connectivityBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: VP.spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  connectivityText: {
    ...VP.typography.monoSmall,
    color: VP.colors.accent.cyan,
  },
  // Transaction Mode Selector
  modeSelector: {
    marginVertical: VP.spacing.md,
  },
  modeLabel: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
    marginBottom: VP.spacing.sm,
  },
  modeButtons: {
    flexDirection: "row",
    gap: VP.spacing.sm,
  },
  modeButton: {
    backgroundColor: VP.colors.surface,
    borderRadius: VP.radius.sm,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
    paddingHorizontal: VP.spacing.md,
    paddingVertical: VP.spacing.sm,
  },
  modeButtonActive: {
    backgroundColor: VP.colors.surfaceElevated,
    borderColor: VP.colors.accent.cyan,
  },
  modeButtonText: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
  },
  modeButtonTextActive: {
    color: VP.colors.accent.cyan,
  },
  // BLE Status Banner
  bleStatusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: VP.spacing.sm,
    flexWrap: "wrap",
  },
  bleModeText: {
    ...VP.typography.caption,
    color: VP.colors.text.secondary,
    width: "100%",
    textAlign: "center",
    marginTop: VP.spacing.xs,
  },
  // Wallet List
  walletList: {
    flexDirection: "row",
    gap: VP.spacing.sm,
    paddingVertical: VP.spacing.xs,
  },
  walletCard: {
    backgroundColor: VP.colors.surface,
    borderRadius: VP.radius.md,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
    padding: VP.spacing.md,
    minWidth: 120,
    alignItems: "center",
  },
  walletCardActive: {
    borderColor: VP.colors.accent.cyan,
    backgroundColor: VP.colors.surfaceElevated,
  },
  walletCardLabel: {
    ...VP.typography.caption,
    color: VP.colors.text.secondary,
    marginBottom: VP.spacing.xs,
  },
  walletCardBalance: {
    ...VP.typography.mono,
    color: VP.colors.accent.cyan,
    fontSize: 16,
    marginBottom: VP.spacing.xs,
  },
  walletCardAddress: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.secondary,
    fontSize: 10,
  },
  walletCardCreate: {
    backgroundColor: VP.colors.surface,
    borderRadius: VP.radius.md,
    borderWidth: 1,
    borderColor: VP.colors.ghostBorder,
    borderStyle: "dashed",
    padding: VP.spacing.md,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  walletCardCreateIcon: {
    color: VP.colors.accent.cyan,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: VP.spacing.xs,
  },
  walletCardCreateText: {
    ...VP.typography.caption,
    color: VP.colors.accent.cyan,
    textAlign: "center",
  },
  // Checkbox (used in From dropdown)
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: VP.colors.text.secondary,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: VP.colors.accent.cyan,
    backgroundColor: VP.colors.accent.cyan,
  },
  checkmark: {
    color: VP.colors.text.inverse,
    fontSize: 12,
    fontWeight: "bold",
  },
  // MWA Mode Banner
  mwaModeBanner: {
    backgroundColor: VP.colors.surfaceElevated,
    paddingHorizontal: VP.spacing.md,
    paddingVertical: VP.spacing.sm,
    marginHorizontal: VP.spacing.md,
    marginTop: VP.spacing.sm,
    borderRadius: VP.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: VP.colors.accent.cyan,
  },
  mwaModeText: {
    ...VP.typography.label,
    color: VP.colors.accent.cyan,
  },
  // Section Actions (for loading spinner)
  fromSectionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: VP.spacing.sm,
  },
  // No wallets message
  noWalletsMessage: {
    paddingHorizontal: VP.spacing.md,
    paddingVertical: VP.spacing.lg,
    alignItems: "center",
  },
  noWalletsText: {
    ...VP.typography.body,
    color: VP.colors.text.secondary,
  },
  noWalletsSubtext: {
    ...VP.typography.caption,
    color: VP.colors.text.disabled,
    marginTop: VP.spacing.xs,
  },
  // Nonce wallet indicator
  nonceWalletIndicator: {
    ...VP.typography.monoSmall,
    color: VP.colors.accent.cyan,
    marginLeft: VP.spacing.xs,
    fontStyle: "italic",
    fontSize: 11,
  },
});
