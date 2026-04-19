import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { useFonts } from "@/src/design-system/useFonts";
import { AdapterProvider } from "@/src/providers/AdapterProvider";
import { ThemeProvider } from "@/src/providers/ThemeProvider";
import { WalletProvider } from "@/src/providers/WalletProvider";
import { MeshProvider } from "@/src/providers/MeshProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loaded: fontsLoaded } = useFonts();

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AdapterProvider>
          <ThemeProvider>
            <WalletProvider>
              <MeshProvider>
                <StatusBar style="light" translucent backgroundColor="transparent" />
                <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
              </MeshProvider>
            </WalletProvider>
          </ThemeProvider>
        </AdapterProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
