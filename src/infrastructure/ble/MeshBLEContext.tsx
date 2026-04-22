import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { bleMeshAdapter } from './BLEMeshAdapter';
import type { BLEMeshAdapter } from './BLEMeshAdapter';
import {
  APP_PREFERENCES_STORAGE_KEY,
  DEFAULT_NETWORK_PREFERENCES,
  normalizeStoredPreferences,
} from "@/src/infrastructure/preferences";
import { checkBLEPermissions } from "@/src/utils/blePermissions";

interface MeshBLEContextValue {
  adapter: BLEMeshAdapter;
  bleError: string | null;
  enabled: boolean;
  scanning: boolean;
  setEnabled: (enabled: boolean) => void;
}

const MeshBLEContext = createContext<MeshBLEContextValue | null>(null);

export function MeshBLEProvider({ children }: { children: React.ReactNode }) {
  const [bleError, setBleError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(DEFAULT_NETWORK_PREFERENCES.bleEnabled);
  const [scanning, setScanning] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadEnabledState() {
      try {
        const raw = await AsyncStorage.getItem(APP_PREFERENCES_STORAGE_KEY);
        if (!mounted) return;
        if (!raw) {
          setEnabled(DEFAULT_NETWORK_PREFERENCES.bleEnabled);
          return;
        }
        const prefs = normalizeStoredPreferences(JSON.parse(raw));
        setEnabled(prefs.network.bleEnabled);
      } catch {
        if (mounted) {
          setEnabled(DEFAULT_NETWORK_PREFERENCES.bleEnabled);
        }
      } finally {
        if (mounted) {
          setHydrated(true);
        }
      }
    }

    void loadEnabledState();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    let mounted = true;

    async function syncScanState() {
      if (!enabled) {
        await bleMeshAdapter.stopScan();
        if (mounted) {
          setScanning(false);
          setBleError(null);
        }
        return;
      }

      // Gate on permission check before attempting scan — scanning without
      // permission throws "not authorized" repeatedly and risks ANR.
      const permissionStatus = await checkBLEPermissions();
      if (permissionStatus === "denied" || permissionStatus === "never_ask_again") {
        if (mounted) {
          setScanning(false);
          setBleError("Bluetooth permission required to discover peers.");
        }
        return;
      }

      setBleError(null);
      try {
        await bleMeshAdapter.startScan();
        if (mounted) {
          setScanning(true);
        }
      } catch (e: unknown) {
        if (__DEV__) console.warn("[BLE] startScan failed:", e);
        if (mounted) {
          setScanning(false);
          setBleError(e instanceof Error ? e.message : "BLE unavailable");
        }
      }
    }

    void syncScanState();

    return () => {
      mounted = false;
      void bleMeshAdapter.stopScan();
    };
  }, [enabled, hydrated]);

  return (
    <MeshBLEContext.Provider
      value={{ adapter: bleMeshAdapter, bleError, enabled, scanning, setEnabled }}
    >
      {children}
    </MeshBLEContext.Provider>
  );
}

export function useMeshBLE() {
  const ctx = useContext(MeshBLEContext);
  if (!ctx) throw new Error('useMeshBLE must be used inside MeshBLEProvider');
  return ctx;
}
