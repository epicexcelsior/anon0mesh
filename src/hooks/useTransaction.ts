import { useEffect, useState } from "react";

import type { Transaction } from "@/src/domain/entities/Transaction";
import { useAdapters } from "@/src/providers/AdapterProvider";

export function useTransaction() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const adapters = useAdapters();

  useEffect(() => {
    adapters.transaction.list(5).then(setTransactions).catch(() => {});
  }, [adapters]);

  return { transactions, recent: transactions.slice(0, 5) };
}
