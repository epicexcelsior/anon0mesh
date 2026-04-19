import { useCallback, useEffect, useState } from "react";

import type { Wallet } from "@/src/domain/entities/Wallet";
import { useAdapters } from "@/src/providers/AdapterProvider";

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const adapters = useAdapters();

  useEffect(() => {
    adapters.wallet
      .getWallet()
      .then((w) => {
        setWallet(w);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [adapters]);

  const refresh = useCallback(() => {
    setLoading(true);
    adapters.wallet
      .refreshBalances()
      .then(() => adapters.wallet.getWallet())
      .then((w) => {
        setWallet(w);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [adapters]);

  return { wallet, loading, refresh };
}
