import { useCallback, useEffect, useState } from "react";

import type { Wallet } from "@/src/domain/entities/Wallet";
import { useAdapters } from "@/src/providers/AdapterProvider";

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const adapters = useAdapters();

  const loadWallet = useCallback(async () => {
    try {
      const nextWallet = await adapters.wallet.getWallet();
      setWallet(nextWallet);
    } finally {
      setLoading(false);
    }
  }, [adapters]);

  useEffect(() => {
    void loadWallet();
    const intervalId = setInterval(() => {
      void loadWallet();
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, [loadWallet]);

  const refresh = useCallback(() => {
    setLoading(true);
    void adapters.wallet
      .refreshBalances()
      .then(loadWallet)
      .catch(() => setLoading(false));
  }, [adapters, loadWallet]);

  return { wallet, loading, refresh };
}
