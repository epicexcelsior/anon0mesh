import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "display-name:";

function storageKey(address: string) {
  return `${STORAGE_PREFIX}${address}`;
}

export async function saveLocalDisplayNameForAddress(
  address: string,
  nextValue: string,
): Promise<string | null> {
  const trimmed = nextValue.trim();
  if (trimmed) {
    await AsyncStorage.setItem(storageKey(address), trimmed);
    return trimmed;
  }

  await AsyncStorage.removeItem(storageKey(address));
  return null;
}

export function useLocalDisplayName(address: string | null, fallback: string) {
  const [storedDisplayName, setStoredDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!address) {
        if (active) {
          setStoredDisplayName(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const value = await AsyncStorage.getItem(storageKey(address));
        if (!active) return;
        const trimmed = value?.trim();
        setStoredDisplayName(trimmed ? trimmed : null);
      } catch {
        if (active) {
          setStoredDisplayName(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [address]);

  const save = useCallback(
    async (nextValue: string) => {
      if (!address) return null;

      const saved = await saveLocalDisplayNameForAddress(address, nextValue);
      setStoredDisplayName(saved);
      return saved;
    },
    [address],
  );

  return {
    displayName: storedDisplayName ?? fallback,
    hasCustomDisplayName: storedDisplayName !== null,
    loading,
    save,
    storedDisplayName,
  };
}
