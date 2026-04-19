import type { WalletService } from '@/src/domain/services/WalletService';
import type { Wallet } from '@/src/domain/entities/Wallet';
import type { Transaction } from '@/src/domain/entities/Transaction';
import { fixtureTransactions } from '@/src/fixtures/transactions';

const FIXTURE_WALLET: Wallet = {
  address: 'AnoN7xMesh3R4ND0Mk3y1234567890abcdef',
  balances: [
    { symbol: 'SOL', amount: '4.20', usdValue: '$672.00' },
    { symbol: 'USDC', amount: '100.00', usdValue: '$100.00' },
  ],
  identity: 'fixture-identity-1',
};

export class FixtureWalletAdapter implements WalletService {
  async getWallet(): Promise<Wallet | null> {
    return FIXTURE_WALLET;
  }

  async refreshBalances(): Promise<void> {
    // no-op in fixtures
  }

  async send(): Promise<Transaction> {
    throw new Error('send not implemented in fixtures');
  }

  async getHistory(): Promise<Transaction[]> {
    return fixtureTransactions;
  }
}

export const fixtureWalletAdapter = new FixtureWalletAdapter();
