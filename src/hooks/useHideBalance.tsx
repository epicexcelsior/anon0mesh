import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import * as haptics from "@/src/design-system/haptics";

const STORAGE_KEY = "anonmesh:hide-balance";

interface HideBalanceValue {
  hidden: boolean;
  toggle: () => void;
}

const HideBalanceContext = createContext<HideBalanceValue | null>(null);

// Provider should wrap any screen that displays a sensitive balance so
// the eye toggle in the header stays in sync with the balance display
// beneath it, and the preference survives restarts.
export function HideBalanceProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    void AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (!alive) return;
      setHidden(value === "true");
      setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const toggle = useCallback(() => {
    haptics.select();
    setHidden((prev) => {
      const next = !prev;
      void AsyncStorage.setItem(STORAGE_KEY, next ? "true" : "false");
      return next;
    });
  }, []);

  const value = useMemo<HideBalanceValue>(
    () => ({ hidden: hydrated ? hidden : false, toggle }),
    [hidden, hydrated, toggle],
  );

  return <HideBalanceContext.Provider value={value}>{children}</HideBalanceContext.Provider>;
}

export function useHideBalance(): HideBalanceValue {
  const ctx = useContext(HideBalanceContext);
  if (!ctx) {
    throw new Error("useHideBalance must be used inside HideBalanceProvider");
  }
  return ctx;
}
