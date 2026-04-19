import { useEffect, useState } from "react";

import type { Transaction } from "@/src/domain/entities/Transaction";
import { useAdapters } from "@/src/providers/AdapterProvider";

export function useTransaction() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const adapters = useAdapters();

  useEffect(() => {
    adapters.transaction
      .list(5)
      .then((txs) => {
        setTransactions(txs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [adapters]);

  return { transactions, recent: transactions.slice(0, 5), loading };
}
