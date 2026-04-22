// Dev-only helper to clear wallet state + restart onboarding flow.
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { LocalWallet } from "@/src/infrastructure/wallet/LocalWallet";

/**
 * Clears local wallet secure-store entries, any MWA token cache,
 * and all `display-name:*` AsyncStorage keys. Safe to call even if
 * nothing is stored. Does not touch peer / mesh state.
 */
export async function resetOnboarding(): Promise<void> {
  // 1. Local wallet secure-store (secret key, AES, public key, marker).
  await LocalWallet.delete();

  // 2. MWA auth token (Android external wallet cache).
  await Promise.allSettled([
    SecureStore.deleteItemAsync("anon_mwa_auth_token_v1"),
  ]);

  // 3. Display-name AsyncStorage entries.
  try {
    const keys = await AsyncStorage.getAllKeys();
    const displayNameKeys = keys.filter((k) => k.startsWith("display-name:"));
    if (displayNameKeys.length > 0) {
      await AsyncStorage.multiRemove(displayNameKeys);
    }
  } catch {
    // non-fatal — dev reset best-effort
  }
}
