import { VP } from "@/constants/void-protocol";
import { useMeshChat } from "@/src/contexts/MeshBLEContext";
import { useWallet } from "@/src/contexts/WalletContext";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bluetooth,
  CaretRight,
  Copy,
  CurrencyDollar,
  EyeSlash,
  Link,
  Lock,
  Plugs,
  ShieldCheck,
  Broadcast,
  Users,
  Info,
  FileText,
  Code,
  SlidersHorizontal,
} from "phosphor-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import VoidCard from "../ui/VoidCard";
import VoidScreen from "../ui/VoidScreen";

// ── Component ───────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();
  const { publicKey: walletPublicKey } = useWallet();
  useMeshChat();

  // Toggle states (local for now — would persist via SecureStore in production)
  const [stealthMode, setStealthMode] = useState(false);
  const [txPrivacy, setTxPrivacy] = useState(false);
  const [autoRotateKeys, setAutoRotateKeys] = useState(false);
  const [bleMesh, setBleMesh] = useState(true);
  const [loraBridge, setLoraBridge] = useState(false);
  const [autoConnect, setAutoConnect] = useState(true);
  const [maxPeers] = useState(8);

  const truncatedWallet = walletPublicKey
    ? `${walletPublicKey.toBase58().slice(0, 4)}...${walletPublicKey.toBase58().slice(-4)}`
    : "Not connected";

  const handleCopyWallet = async () => {
    if (!walletPublicKey) return;
    await Clipboard.setStringAsync(walletPublicKey.toBase58());
    Alert.alert("Copied", "Wallet address copied to clipboard.");
  };

  const handleOpenWalletSettings = () => {
    router.push("/wallet/settings");
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
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Privacy ────────────────────────────────── */}
        <Text style={styles.sectionLabel}>PRIVACY</Text>
        <VoidCard style={styles.sectionCard}>
          <ToggleRow
            icon={<EyeSlash size={18} color={VP.colors.accent.purple} weight="regular" />}
            label="Stealth Mode"
            description="Hide from mesh discovery"
            value={stealthMode}
            onValueChange={setStealthMode}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon={<Lock size={18} color={VP.colors.accent.purple} weight="regular" />}
            label="Transaction Privacy"
            description="Shield amounts via Arcium"
            value={txPrivacy}
            onValueChange={setTxPrivacy}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon={<ShieldCheck size={18} color={VP.colors.accent.purple} weight="regular" />}
            label="Auto-rotate Keys"
            description="Regenerate identity keys weekly"
            value={autoRotateKeys}
            onValueChange={setAutoRotateKeys}
          />
        </VoidCard>

        {/* ── Mesh Network ───────────────────────────── */}
        <Text style={styles.sectionLabel}>MESH NETWORK</Text>
        <VoidCard style={styles.sectionCard}>
          <ToggleRow
            icon={<Bluetooth size={18} color={VP.colors.accent.cyan} weight="regular" />}
            label="BLE Mesh"
            description="Bluetooth Low Energy"
            value={bleMesh}
            onValueChange={setBleMesh}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon={<Broadcast size={18} color={VP.colors.text.secondary} weight="regular" />}
            label="LoRa Bridge"
            description="Long-range relay (hardware required)"
            value={loraBridge}
            onValueChange={setLoraBridge}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon={<Plugs size={18} color={VP.colors.accent.cyan} weight="regular" />}
            label="Auto-connect"
            description="Connect to nearby peers automatically"
            value={autoConnect}
            onValueChange={setAutoConnect}
          />
          <View style={styles.divider} />
          <View style={styles.staticRow}>
            <Users size={18} color={VP.colors.text.secondary} weight="regular" />
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Max Peers</Text>
              <Text style={styles.rowDescription}>Maximum simultaneous connections</Text>
            </View>
            <Text style={styles.staticValue}>{maxPeers}</Text>
          </View>
        </VoidCard>

        {/* ── Wallet ─────────────────────────────────── */}
        <Text style={styles.sectionLabel}>WALLET</Text>
        <VoidCard style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleOpenWalletSettings}
            activeOpacity={0.7}
          >
            <SlidersHorizontal
              size={18}
              color={VP.colors.accent.cyan}
              weight="regular"
            />
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Wallet Settings</Text>
              <Text style={styles.rowDescription}>
                Manage primary and offline wallets
              </Text>
            </View>
            <CaretRight size={16} color={VP.colors.text.disabled} weight="regular" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleCopyWallet}
            activeOpacity={0.7}
          >
            <Link size={18} color={VP.colors.text.secondary} weight="regular" />
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Connected Wallet</Text>
              <Text style={styles.rowValueMono}>{truncatedWallet}</Text>
            </View>
            <Copy size={16} color={VP.colors.text.disabled} weight="regular" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.staticRow}>
            <CurrencyDollar size={18} color={VP.colors.text.secondary} weight="regular" />
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Default Currency</Text>
            </View>
            <Text style={styles.staticValue}>USD</Text>
          </View>
        </VoidCard>

        {/* ── About ──────────────────────────────────── */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <VoidCard style={styles.sectionCard}>
          <View style={styles.staticRow}>
            <Info size={18} color={VP.colors.text.secondary} weight="regular" />
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Version</Text>
            </View>
            <Text style={styles.staticValue}>v1.0.0</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <FileText size={18} color={VP.colors.text.secondary} weight="regular" />
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Terms of Service</Text>
            </View>
            <CaretRight size={16} color={VP.colors.text.disabled} weight="regular" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <Code size={18} color={VP.colors.text.secondary} weight="regular" />
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>Open Source Licenses</Text>
            </View>
            <CaretRight size={16} color={VP.colors.text.disabled} weight="regular" />
          </TouchableOpacity>
        </VoidCard>

        {/* Footer */}
        <Text style={styles.footerText}>Arcium Privacy Guard</Text>
      </ScrollView>
    </VoidScreen>
  );
}

// ── Toggle Row ──────────────────────────────────────────────

function ToggleRow({
  icon,
  label,
  description,
  value,
  onValueChange,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      {icon}
      <View style={styles.rowInfo}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description && (
          <Text style={styles.rowDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: VP.colors.surface,
          true: VP.colors.accent.cyanMuted,
        }}
        thumbColor={value ? VP.colors.accent.cyan : VP.colors.text.disabled}
        ios_backgroundColor={VP.colors.surface}
      />
    </View>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerSpacer: {
    width: 30,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: VP.spacing.md,
    paddingTop: VP.spacing.md,
    paddingBottom: VP.spacing.xxl,
  },

  // Section
  sectionLabel: {
    ...VP.typography.label,
    color: VP.colors.text.secondary,
    textTransform: "uppercase",
    marginTop: VP.spacing.lg,
    marginBottom: VP.spacing.sm,
  },
  sectionCard: {
    padding: 0,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: VP.colors.ghostBorder,
  },

  // Rows
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: VP.spacing.md,
    gap: VP.spacing.sm,
  },
  staticRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: VP.spacing.md,
    gap: VP.spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: VP.spacing.md,
    gap: VP.spacing.sm,
  },
  rowInfo: {
    flex: 1,
  },
  rowLabel: {
    ...VP.typography.body,
    color: VP.colors.text.primary,
  },
  rowDescription: {
    ...VP.typography.caption,
    color: VP.colors.text.disabled,
    marginTop: 2,
  },
  rowValueMono: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.secondary,
    marginTop: 2,
  },
  staticValue: {
    ...VP.typography.monoSmall,
    color: VP.colors.text.primary,
  },

  // Footer
  footerText: {
    ...VP.typography.caption,
    color: VP.colors.text.disabled,
    textAlign: "center",
    marginTop: VP.spacing.xl,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
