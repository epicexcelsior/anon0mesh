import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Backdrop } from "@/components/primitives/Backdrop";
import { IdentityCard, SettingsRow, SettingsSection } from "@/components/settings";
import { useWallet } from "@/src/hooks/useWallet";
import { appTheme as theme } from "@/src/design-system/theme";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wallet } = useWallet();

  return (
    <View style={styles.root}>
      <Backdrop preset="settings" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + theme.spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity card */}
        <IdentityCard
          address={wallet?.address ?? null}
          alias={wallet?.identity ?? null}
          displayName={null}
        />

        <View style={styles.sections}>
          {/* NETWORK */}
          <SettingsSection title="Network">
            <SettingsRow
              label="Network"
              iconName="radio"
              onPress={() => router.push("/settings/network" as Parameters<typeof router.push>[0])}
            />
          </SettingsSection>

          {/* PRIVACY */}
          <SettingsSection title="Privacy">
            <SettingsRow
              label="Privacy & Stealth"
              iconName="shield"
              onPress={() => router.push("/settings/privacy" as Parameters<typeof router.push>[0])}
            />
          </SettingsSection>

          {/* BEACON */}
          <SettingsSection title="Beacon">
            <SettingsRow
              label="Beacon Node"
              iconName="beacon"
              onPress={() => router.push("/settings/beacon" as Parameters<typeof router.push>[0])}
            />
          </SettingsSection>

          {/* WALLET */}
          <SettingsSection title="Wallet">
            <SettingsRow
              label="Export Wallet"
              iconName="download-cloud"
              onPress={() => router.push("/settings/wallet-export" as Parameters<typeof router.push>[0])}
            />
          </SettingsSection>

          {/* ABOUT */}
          <SettingsSection title="About">
            <SettingsRow
              label="About AnonMesh"
              iconName="info"
              onPress={() => router.push("/settings/about" as Parameters<typeof router.push>[0])}
              showSeparator={false}
            />
          </SettingsSection>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: theme.spacing.lg,
  },
  sections: {
    gap: theme.spacing.lg,
  },
});
