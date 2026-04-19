import type { TransactionService } from '@/src/domain/services/TransactionService';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { TransferStatus } from '@/src/domain/status/TransferStatus';
import { fixtureTransactions } from '@/src/fixtures/transactions';

export class FixtureTransactionAdapter implements TransactionService {
  private transactions: Transaction[] = [...fixtureTransactions];

  async getById(id: string): Promise<Transaction | null> {
    return this.transactions.find(t => t.id === id) ?? null;
  }

  async list(limit?: number): Promise<Transaction[]> {
    if (limit !== undefined) {
      return this.transactions.slice(0, limit);
    }
    return this.transactions;
  }

  async updateStatus(id: string, status: TransferStatus): Promise<void> {
    const tx = this.transactions.find(t => t.id === id);
    if (tx) tx.status = status;
  }
}

export const fixtureTransactionAdapter = new FixtureTransactionAdapter();
