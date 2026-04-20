import type { WalletService } from '@/src/domain/services/WalletService';
import type { Wallet } from '@/src/domain/entities/Wallet';
import type { Transaction } from '@/src/domain/entities/Transaction';
import { fixtureTransactions } from '@/src/fixtures/transactions';

const FIXTURE_WALLET: Wallet = {
  address: '7Pu9MG4VbMLnHgxLqS3VsKdQFNm8BhXcRTwE2KyVfDp',
  balances: [
    { symbol: 'SOL', amount: '12.45', usdValue: '$1,992.00' },
    { symbol: 'USDC', amount: '850.00', usdValue: '$850.00' },
  ],
  identity: 'anon·9c7b',
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
