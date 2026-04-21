import type {
  SendParams,
  WalletExportState,
  WalletService,
} from '@/src/domain/services/WalletService';
import type { Wallet } from '@/src/domain/entities/Wallet';
import type { Transaction } from '@/src/domain/entities/Transaction';
import { fixtureTransactionAdapter } from '@/src/infrastructure/fixtures/FixtureTransactionAdapter';

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

const FIXTURE_WALLET: Wallet = {
  address: '7Pu9MG4VbMLnHgxLqS3VsKdQFNm8BhXcRTwE2KyVfDp',
  balances: [
    { symbol: 'SOL', amount: '12.45', usdValue: '$1,992.00' },
    { symbol: 'USDC', amount: '850.00', usdValue: '$850.00' },
  ],
  identity: 'anon·9c7b',
};

function cloneWallet(wallet: Wallet): Wallet {
  return {
    ...wallet,
    balances: wallet.balances.map((balance) => ({ ...balance })),
  };
}

function randomBase58(length: number): string {
  return Array.from({ length }, () =>
    BASE58_ALPHABET[Math.floor(Math.random() * BASE58_ALPHABET.length)],
  ).join('');
}

export class FixtureWalletAdapter implements WalletService {
  private wallet: Wallet = cloneWallet(FIXTURE_WALLET);

  getMode() {
    return 'fixture' as const;
  }

  async getWallet(): Promise<Wallet | null> {
    return cloneWallet(this.wallet);
  }

  async getExportState(): Promise<WalletExportState> {
    return {
      available: false,
      kind: 'private-key',
      mode: 'fixture',
      reason: 'Fixture wallets do not expose private keys.',
    };
  }

  async exportPrivateKey(): Promise<string> {
    throw new Error('Fixture wallets do not expose private keys');
  }

  async refreshBalances(): Promise<void> {
    // no-op in fixtures
  }

  async send(params: SendParams): Promise<Transaction> {
    const now = Date.now();
    const tx: Transaction = {
      id: `fixture-tx-${now}`,
      direction: 'send',
      amount: params.amount,
      symbol: params.symbol,
      recipientId: params.recipientAddress,
      senderId: this.wallet.address,
      status: 'Queued on device',
      createdAt: now,
      settledAt: null,
      signature: randomBase58(88),
    };

    this.wallet = {
      ...this.wallet,
      balances: this.wallet.balances.map((balance) => {
        if (balance.symbol !== params.symbol) return balance;
        const nextAmount = Math.max(0, parseFloat(balance.amount) - parseFloat(params.amount));
        return {
          ...balance,
          amount: nextAmount.toFixed(balance.symbol === 'SOL' ? 2 : 2),
        };
      }),
    };

    fixtureTransactionAdapter.add(tx);

    return tx;
  }

  async getHistory(): Promise<Transaction[]> {
    return fixtureTransactionAdapter.list();
  }
}

export const fixtureWalletAdapter = new FixtureWalletAdapter();
