// In-memory transaction log implementing TransactionService.
// Transactions are added by wallet adapters after submission.
// Status updates are called when confirmation is detected.

import type { Transaction } from '@/src/domain/entities/Transaction';
import type { TransactionService } from '@/src/domain/services/TransactionService';
import type { TransferStatus } from '@/src/domain/status/TransferStatus';

export class SolanaTransactionService implements TransactionService {
  private readonly store = new Map<string, Transaction>();

  /** Called by wallet adapters to register a newly submitted transaction. */
  add(tx: Transaction): void {
    this.store.set(tx.id, { ...tx });
  }

  async getById(id: string): Promise<Transaction | null> {
    return this.store.get(id) ?? null;
  }

  async list(limit?: number): Promise<Transaction[]> {
    const all = Array.from(this.store.values()).sort(
      (a, b) => b.createdAt - a.createdAt,
    );
    if (limit !== undefined && limit > 0) {
      return all.slice(0, limit);
    }
    return all;
  }

  async updateStatus(id: string, status: TransferStatus): Promise<void> {
    const tx = this.store.get(id);
    if (!tx) return;
    tx.status = status;
    if (status === 'Settled') {
      tx.settledAt = Date.now();
    }
  }
}

export const solanaTransactionService = new SolanaTransactionService();
