import { useCallback, useEffect, useState } from "react";

import type { Transaction } from "@/src/domain/entities/Transaction";
import { useAdapters } from "@/src/providers/AdapterProvider";

const HISTORY_REFRESH_MS = 6000;
const PENDING_REFRESH_MS = 1500;

function mergeTransactions(
  walletHistory: Transaction[],
  runtimeTransactions: Transaction[],
): Transaction[] {
  const merged = new Map<string, Transaction>();

  for (const tx of walletHistory) {
    merged.set(tx.signature ?? tx.id, tx);
  }

  for (const tx of runtimeTransactions) {
    const key = tx.signature ?? tx.id;
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, tx);
      continue;
    }

    merged.set(key, {
      ...existing,
      ...tx,
      amount: existing.amount || tx.amount,
      createdAt: Math.min(existing.createdAt, tx.createdAt),
      recipientId: existing.recipientId || tx.recipientId,
      senderId: existing.senderId || tx.senderId,
      settledAt: existing.settledAt ?? tx.settledAt,
      signature: existing.signature ?? tx.signature,
      status:
        existing.status === "Settled" || tx.status === "Settled"
          ? "Settled"
          : tx.status,
    });
  }

  return Array.from(merged.values()).sort((left, right) => right.createdAt - left.createdAt);
}

export function useTransaction(txId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const adapters = useAdapters();

  const loadTransactions = useCallback(async () => {
    try {
      const [runtimeTransactions, walletHistory] = await Promise.all([
        adapters.transaction.list(),
        adapters.wallet.getHistory().catch(() => []),
      ]);

      setTransactions(mergeTransactions(walletHistory, runtimeTransactions));
    } finally {
      setLoading(false);
    }
  }, [adapters]);

  useEffect(() => {
    void loadTransactions();
    const intervalId = setInterval(() => {
      void loadTransactions();
    }, HISTORY_REFRESH_MS);
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

    const refreshPending = () => {
      void adapters.transaction.refreshPendingStatuses?.().then(() => {
        if (!cancelled) {
          void loadTransactions();
        }
      });
    };

    refreshPending();
    const intervalId = setInterval(refreshPending, PENDING_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
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
