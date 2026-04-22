import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { useFonts } from "@/src/design-system/useFonts";
import { AdapterProvider, ThemeProvider, MeshProvider } from "@/src/providers";

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
            <MeshProvider>
              <StatusBar style="light" translucent backgroundColor="transparent" />
              <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
                <Stack.Screen name="peers/index" options={{ presentation: "modal", headerShown: false }} />
                <Stack.Screen name="peers/[peerId]" options={{ headerShown: false }} />
                <Stack.Screen name="send/recipient" options={{ headerShown: false }} />
                <Stack.Screen name="send/amount" options={{ headerShown: false }} />
                <Stack.Screen name="send/review" options={{ headerShown: false }} />
                <Stack.Screen name="send/success" options={{ headerShown: false }} />
                <Stack.Screen
                  name="receive"
                  options={{
                    headerShown: false,
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    gestureEnabled: true,
                  }}
                />
                <Stack.Screen name="history/index" options={{ headerShown: false }} />
                <Stack.Screen name="history/[txId]" options={{ headerShown: false }} />
                <Stack.Screen name="messages/[peerId]" options={{ headerShown: false }} />
                <Stack.Screen name="settings/identity" options={{ headerShown: false }} />
                <Stack.Screen name="settings/wallet-export" options={{ headerShown: false }} />
                <Stack.Screen name="settings/network" options={{ headerShown: false }} />
                <Stack.Screen name="settings/privacy" options={{ headerShown: false }} />
                <Stack.Screen name="settings/beacon" options={{ headerShown: false }} />
                <Stack.Screen name="settings/about" options={{ headerShown: false }} />
              </Stack>
            </MeshProvider>
          </ThemeProvider>
        </AdapterProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
