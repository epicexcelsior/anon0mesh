import type { TransactionService } from '@/src/domain/services/TransactionService';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { TransferStatus } from '@/src/domain/status/TransferStatus';
import { fixtureTransactions } from '@/src/fixtures/transactions';

export class FixtureTransactionAdapter implements TransactionService {
  private transactions: Transaction[] = [...fixtureTransactions];

  add(tx: Transaction): void {
    this.transactions = [tx, ...this.transactions];
    this.scheduleLifecycle(tx.id);
  }

  async getById(id: string): Promise<Transaction | null> {
    return this.transactions.find(t => t.id === id) ?? null;
  }

  async list(limit?: number): Promise<Transaction[]> {
    const all = [...this.transactions].sort((left, right) => right.createdAt - left.createdAt);
    if (limit !== undefined) {
      return all.slice(0, limit);
    }
    return all;
  }

  async updateStatus(id: string, status: TransferStatus): Promise<void> {
    const tx = this.transactions.find(t => t.id === id);
    if (!tx) return;
    tx.status = status;
    if (status === 'Settled') {
      tx.settledAt = Date.now();
    }
  }

  async refreshPendingStatuses(): Promise<void> {}

  private scheduleLifecycle(id: string): void {
    setTimeout(() => {
      void this.updateStatus(id, 'Settled');
    }, 2800);
  }
}

export const fixtureTransactionAdapter = new FixtureTransactionAdapter();
