import { useCallback, useEffect, useState } from "react";

import type { Transaction } from "@/src/domain/entities/Transaction";
import { useAdapters } from "@/src/providers/AdapterProvider";

export function useTransaction(txId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const adapters = useAdapters();

  const loadTransactions = useCallback(async () => {
    try {
      const nextTransactions = await adapters.transaction.list();
      setTransactions(nextTransactions);
    } finally {
      setLoading(false);
    }
  }, [adapters]);

  useEffect(() => {
    void loadTransactions();
    const intervalId = setInterval(() => {
      void loadTransactions();
    }, 1500);
    return () => {
      clearInterval(intervalId);
    };
  }, [loadTransactions]);

  useEffect(() => {
    if (!adapters.transaction.refreshPendingStatuses) {
      return;
    }

    const pending = transactions.filter(
      (transaction) =>
        transaction.signature &&
        transaction.status !== "Settled",
    );

    if (pending.length === 0) return;

    let cancelled = false;

    void adapters.transaction.refreshPendingStatuses().then(() => {
      if (!cancelled) {
        void loadTransactions();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [adapters, loadTransactions, transactions]);

  const selected = txId
    ? transactions.find((transaction) => transaction.id === txId) ?? null
    : null;

  return {
    transactions,
    recent: transactions.slice(0, 5),
    selected,
    loading,
    refresh: loadTransactions,
  };
}
