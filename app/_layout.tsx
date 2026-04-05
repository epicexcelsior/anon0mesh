// Import polyfills FIRST (before any other imports)
import "react-native-get-random-values";

import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { useFonts } from "expo-font";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

// ENHANCED BLE CONTEXTS - Replace original providers for persistent sessions
// import { BLEProvider } from "@/src/contexts/BLEContextEnhanced";
// import { NoiseProvider } from "@/src/contexts/NoiseContextEnhanced";

// MESH CHAT - New kard-network-ble-mesh integration
import {
  MeshChatProvider,
  TransactionApprovalModal,
} from "@/src/contexts/MeshBLEContext";

import { WalletProvider, useWallet } from "@/src/contexts/WalletContext";
import { identityStateManager } from "@/src/infrastructure/identity";
import { Connection, clusterApiUrl } from "@solana/web3.js";

// Wrapper to inject wallet and connection into MeshChatProvider
function MeshChatProviderWithWallet({
  children,
}: {
  children: React.ReactNode;
}) {
  const { wallet } = useWallet();
  const [connection] = useState<Connection>(
    () => new Connection(clusterApiUrl("devnet"), "confirmed"),
  );
  const [walletKeypair, setWalletKeypair] = useState<any>(null);

  // Extract keypair from wallet for local wallets
  useEffect(() => {
    const loadKeypair = async () => {
      if (!wallet || !wallet.isConnected()) return;

      try {
        // Try to export secret key (works for local wallets)
        const secretKey = await wallet.exportSecretKey();
        const { Keypair } = await import("@solana/web3.js");
        const keypair = Keypair.fromSecretKey(secretKey);
        setWalletKeypair(keypair);
        console.log(
          "[RootLayout] Loaded local wallet keypair for transaction signing",
        );
      } catch (error) {
        // MWA wallets can't export keys, that's fine
        console.log(
          "[RootLayout] Wallet doesn't support key export (likely MWA)",
        );
        setWalletKeypair(null);
      }
    };

    loadKeypair();
  }, [wallet]);

  return (
    <MeshChatProvider
      autoInitialize={true}
      connection={connection}
      wallet={walletKeypair}
    >
      {children}
    </MeshChatProvider>
  );
}

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Load all fonts globally — Space Grotesk (UI) + JetBrains Mono (data)
  const [fontsLoaded, fontError] = useFonts({
    "SpaceGrotesk-Light": require("@/assets/fonts/SpaceGrotesk-Light.ttf"),
    "SpaceGrotesk-Regular": require("@/assets/fonts/SpaceGrotesk-Regular.ttf"),
    "SpaceGrotesk-Medium": require("@/assets/fonts/SpaceGrotesk-Medium.ttf"),
    "SpaceGrotesk-SemiBold": require("@/assets/fonts/SpaceGrotesk-SemiBold.ttf"),
    "SpaceGrotesk-Bold": require("@/assets/fonts/SpaceGrotesk-Bold.ttf"),
    "JetBrainsMono-Regular": require("@/assets/fonts/JetBrainsMono-Regular.ttf"),
    "JetBrainsMono-Medium": require("@/assets/fonts/JetBrainsMono-Medium.ttf"),
    "JetBrainsMono-Bold": require("@/assets/fonts/JetBrainsMono-Bold.ttf"),
  });

  useEffect(() => {
    identityStateManager.initialize().catch((err) => {
      console.error("[RootLayout] Failed to initialize identity state:", err);
    });
  }, []);

  // Hide splash screen once fonts are ready
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GluestackUIProvider mode="dark">
      <WalletProvider autoInitialize={true}>
        {/* MESH CHAT: kard-network-ble-mesh integration with wallet injection */}
        <MeshChatProviderWithWallet>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            {/* Hide default stack header globally */}
            <Stack screenOptions={{ headerShown: false }}>
              {/* Tab navigator — main app screens */}
              <Stack.Screen name="(tabs)" />
              {/* Pre-app screens (no tab bar) */}
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="landing" />
              {/* Push-over screens (hide tab bar) */}
              <Stack.Screen name="settings" />
              <Stack.Screen name="chat/selection" />
              <Stack.Screen name="chat/thread" />
              <Stack.Screen name="mesh/[peerId]" />
              <Stack.Screen name="wallet/send" />
              <Stack.Screen name="wallet/receive" />
              <Stack.Screen name="wallet/settings" />
              <Stack.Screen name="wallet/success" />
              <Stack.Screen name="zone/index" />
              <Stack.Screen name="zone/create" />
            </Stack>
            <TransactionApprovalModal />
            <StatusBar style="auto" />
          </ThemeProvider>
        </MeshChatProviderWithWallet>
      </WalletProvider>
    </GluestackUIProvider>
  );
}
