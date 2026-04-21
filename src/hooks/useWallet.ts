import { useCallback, useEffect, useState } from "react";

import type { Wallet } from "@/src/domain/entities/Wallet";
import type { WalletExportState } from "@/src/domain/services/WalletService";
import { useAdapters } from "@/src/providers/AdapterProvider";

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [exportState, setExportState] = useState<WalletExportState | null>(null);
  const [loading, setLoading] = useState(true);
  const adapters = useAdapters();
  const mode = adapters.wallet.getMode();

  const loadWallet = useCallback(async () => {
    try {
      const [nextWallet, nextExportState] = await Promise.all([
        adapters.wallet.getWallet(),
        adapters.wallet.getExportState(),
      ]);
      setWallet(nextWallet);
      setExportState(nextExportState);
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

  const exportPrivateKey = useCallback(() => adapters.wallet.exportPrivateKey(), [adapters]);

  return { wallet, loading, refresh, mode, exportState, exportPrivateKey };
}
