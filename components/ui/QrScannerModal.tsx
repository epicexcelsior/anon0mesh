import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassSurface } from "@/components/primitives/GlassSurface";
import { Icon } from "@/components/primitives/Icon";
import { appTheme as theme } from "@/src/design-system/theme";

interface QrScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (data: string) => void;
}

const QrScannerModal: React.FC<QrScannerModalProps> = ({
  visible,
  onClose,
  onScanned,
}) => {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!visible) return;

    if (!permission?.granted) {
      void requestPermission();
    }

    setScanned(false);
  }, [permission, requestPermission, visible]);

  const showLoading = visible && !permission;
  const denied = permission?.granted === false;

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      transparent={false}
      visible={visible}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Recipient scan</Text>
            <Text style={styles.title}>Scan a wallet QR</Text>
            <Text style={styles.subtitle}>
              Plain wallet addresses and <Text style={styles.subtitleStrong}>solana:</Text> links work best.
            </Text>
          </View>

          <TouchableOpacity
            accessibilityLabel="Close scanner"
            accessibilityRole="button"
            activeOpacity={0.8}
            hitSlop={8}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Icon color={theme.colors.textPrimary} name="x" size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {showLoading ? (
            <GlassSurface style={styles.messageCard} variant="strong">
              <ActivityIndicator color={theme.colors.cyan} size="small" />
              <Text style={styles.messageTitle}>Requesting camera permission</Text>
              <Text style={styles.messageBody}>
                Camera access is only used to read recipient QR codes during this step.
              </Text>
            </GlassSurface>
          ) : denied ? (
            <GlassSurface style={styles.messageCard} variant="strong">
              <Icon color={theme.colors.red} name="camera-off" size={24} />
              <Text style={styles.messageTitle}>Camera access is off</Text>
              <Text style={styles.messageBody}>
                Enable camera permission to scan a QR, or paste the wallet address manually.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Use paste instead</Text>
              </TouchableOpacity>
            </GlassSurface>
          ) : (
            <View style={styles.cameraWrap}>
              <CameraView
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                facing="back"
                onBarcodeScanned={
                  scanned
                    ? undefined
                    : (result: { data: string }) => {
                        setScanned(true);
                        onClose();
                        onScanned(result.data);
                      }
                }
                style={styles.camera}
              />
              <View pointerEvents="none" style={styles.frameOverlay}>
                <View style={styles.frame} />
              </View>
            </View>
          )}

          <Text style={styles.footerNote}>
            Keep the code inside the frame. You can still paste an address if scan fails.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  headerCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  eyebrow: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.micro,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.headingBold,
    fontSize: theme.type.section,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.45,
  },
  subtitleStrong: {
    color: theme.colors.cyan,
    fontFamily: theme.fonts.monoJetBrains,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  body: {
    flex: 1,
    gap: theme.spacing.lg,
    justifyContent: "center",
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  cameraWrap: {
    alignSelf: "stretch",
    aspectRatio: 1,
    borderRadius: theme.radius.xl,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    borderColor: theme.colors.cyanGlowStrong,
    borderRadius: theme.radius.xl,
    borderWidth: 2,
    height: "62%",
    width: "62%",
  },
  messageCard: {
    alignItems: "center",
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxxl,
  },
  messageTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.type.bodyLg,
    textAlign: "center",
  },
  messageBody: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.body,
    lineHeight: theme.type.body * 1.55,
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.type.body,
  },
  footerNote: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    lineHeight: theme.type.caption * 1.6,
    paddingHorizontal: theme.spacing.sm,
    textAlign: "center",
  },
});

export default QrScannerModal;
