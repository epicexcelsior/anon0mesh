import type { Transaction } from "@/src/domain/entities/Transaction";
import type { TransferStatus } from "@/src/domain/status/TransferStatus";

export interface TransactionService {
  getById(id: string): Promise<Transaction | null>;
  list(limit?: number): Promise<Transaction[]>;
  updateStatus(id: string, status: TransferStatus): Promise<void>;
  refreshPendingStatuses?(): Promise<void>;
}
