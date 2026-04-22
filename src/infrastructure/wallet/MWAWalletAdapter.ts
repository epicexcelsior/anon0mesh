import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction as SolanaTransaction,
} from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { Wallet } from '@/src/domain/entities/Wallet';
import type {
  SendParams,
  WalletExportState,
  WalletService,
} from '@/src/domain/services/WalletService';
import { MWAWallet } from './MWAWallet';
import {
  getWalletBalance,
  getWalletTransferHistory,
  solanaConnection,
  solanaTransactionService,
} from '@/src/infrastructure/solana';

export class MWAWalletAdapter implements WalletService {
  private wallet: MWAWallet;

  constructor() {
    this.wallet = new MWAWallet();
  }

  getMode() {
    return 'mwa' as const;
  }

  canCreateLocalWallet() {
    return false;
  }

  canConnectExternalWallet() {
    return true;
  }

  async createLocalWallet(): Promise<Wallet> {
    throw new Error('Local wallet creation is unavailable in external wallet mode');
  }

  async connectExternalWallet(): Promise<Wallet> {
    this.assertAndroid();
    await this.wallet.connect();

    const wallet = await this.getWallet();
    if (!wallet) {
      throw new Error('MWA wallet connected, but no account was returned');
    }
    return wallet;
  }

  private assertAndroid(): void {
    if (Platform.OS !== 'android') {
      throw new Error('MWA not supported on iOS');
    }
  }

  async getWallet(): Promise<Wallet | null> {
    this.assertAndroid();

    if (!this.wallet.isConnected()) {
      const hasCached = await MWAWallet.hasCachedToken();
      if (hasCached) {
        await this.wallet.connect();
      } else {
        return null;
      }
    }

    const pubkey = this.wallet.getPublicKey();
    if (!pubkey) return null;

    const balance = await getWalletBalance(pubkey);
    const solAmount = (balance / LAMPORTS_PER_SOL).toFixed(6);

    return {
      address: pubkey.toBase58(),
      balances: [
        { symbol: 'SOL', amount: solAmount, usdValue: '$0.00' },
      ],
      identity: pubkey.toBase58(),
    };
  }

  async getExportState(): Promise<WalletExportState> {
    return {
      available: false,
      kind: 'private-key',
      mode: 'mwa',
      reason: 'External MWA wallets keep private keys inside the wallet app.',
    };
  }

  async exportPrivateKey(): Promise<string> {
    throw new Error('MWA wallets do not expose private keys');
  }

  async refreshBalances(): Promise<void> {
    this.assertAndroid();

    if (!this.wallet.isConnected()) {
      const hasCached = await MWAWallet.hasCachedToken();
      if (!hasCached) return;
      await this.wallet.connect();
    }
    const pubkey = this.wallet.getPublicKey();
    if (!pubkey) return;
    await getWalletBalance(pubkey, { force: true });
  }

  async send(params: SendParams): Promise<Transaction> {
    this.assertAndroid();

    if (params.symbol !== 'SOL') {
      throw new Error('Only SOL sends supported');
    }

    if (!this.wallet.isConnected()) {
      const hasCached = await MWAWallet.hasCachedToken();
      if (!hasCached) throw new Error('MWA wallet not authorized');
      await this.wallet.connect();
    }
    const senderPubkey = this.wallet.getPublicKey();
    if (!senderPubkey) throw new Error('MWA wallet not connected');

    const recipientPubkey = new PublicKey(params.recipientAddress);
    const lamports = Math.round(parseFloat(params.amount) * LAMPORTS_PER_SOL);

    const { blockhash } = await solanaConnection.getLatestBlockhash();

    const tx = new SolanaTransaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: recipientPubkey,
        lamports,
      }),
    );
    tx.recentBlockhash = blockhash;

    let signature: string | null = null;

    await transact(async (mwaWallet) => {
      const auth = await mwaWallet.reauthorize({
        auth_token: (await SecureStore.getItemAsync('anon_mwa_auth_token_v1')) ?? '',
        identity: { name: 'anonmesh', uri: 'https://anonme.sh', icon: '/favicon.ico' },
      });
      const sessionPubkey = new PublicKey(Buffer.from(auth.accounts[0].address, 'base64'));
      // I5 — the wallet app may return a different selected account on reauthorize than
      // the one cached at connect(). Submitting with a feePayer that doesn't match the
      // tx's fromPubkey produces a malformed tx that fails on-chain. Abort early with a
      // clear error instead of sending a broken tx.
      if (sessionPubkey.toBase58() !== senderPubkey.toBase58()) {
        throw new Error(
          `MWA account mismatch — expected ${senderPubkey.toBase58().slice(0, 8)}…, wallet returned ${sessionPubkey.toBase58().slice(0, 8)}…. Please reconnect the correct account.`,
        );
      }
      tx.feePayer = sessionPubkey;
      const signatures = await mwaWallet.signAndSendTransactions({
        transactions: [tx],
      });
      signature = signatures[0] ?? null;
    });

    if (!signature) {
      throw new Error('MWA wallet returned no signature — transaction may not have been submitted');
    }

    const now = Date.now();
    const domainTx: Transaction = {
      id: signature,
      direction: 'send',
      amount: params.amount,
      symbol: params.symbol,
      recipientId: params.recipientAddress,
      senderId: senderPubkey.toBase58(),
      status: 'Queued on device',
      createdAt: now,
      settledAt: null,
      signature,
    };

    solanaTransactionService.add(domainTx);

    return domainTx;
  }

  async getHistory(): Promise<Transaction[]> {
    this.assertAndroid();

    if (!this.wallet.isConnected()) {
      const hasCached = await MWAWallet.hasCachedToken();
      if (!hasCached) return [];
      await this.wallet.connect();
    }

    const pubkey = this.wallet.getPublicKey();
    if (!pubkey) return [];

    return getWalletTransferHistory(pubkey);
  }
}
