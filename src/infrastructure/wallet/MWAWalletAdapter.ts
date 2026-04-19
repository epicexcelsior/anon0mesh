import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction as SolanaTransaction,
} from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Platform } from 'react-native';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { Wallet } from '@/src/domain/entities/Wallet';
import type { SendParams, WalletService } from '@/src/domain/services/WalletService';
import { MWAWallet } from './MWAWallet';

const SOLANA_RPC = 'https://api.devnet.solana.com';

export class MWAWalletAdapter implements WalletService {
  private wallet: MWAWallet;
  private connection: Connection;

  constructor() {
    if (Platform.OS !== 'android') {
      // Methods below guard individually — construction is allowed so the class
      // can be instantiated cross-platform, but every call throws on iOS.
    }
    this.wallet = new MWAWallet();
    this.connection = new Connection(SOLANA_RPC, 'confirmed');
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

    const balance = await this.connection.getBalance(pubkey);
    const solAmount = (balance / LAMPORTS_PER_SOL).toFixed(6);

    return {
      address: pubkey.toBase58(),
      balances: [
        { symbol: 'SOL', amount: solAmount, usdValue: '$0.00' },
      ],
      identity: pubkey.toBase58(),
    };
  }

  async refreshBalances(): Promise<void> {
    this.assertAndroid();

    if (!this.wallet.isConnected()) {
      await this.wallet.connect();
    }
    const pubkey = this.wallet.getPublicKey();
    if (!pubkey) return;
    await this.connection.getBalance(pubkey);
  }

  async send(params: SendParams): Promise<Transaction> {
    this.assertAndroid();

    if (params.symbol !== 'SOL') {
      throw new Error('Only SOL sends supported');
    }

    if (!this.wallet.isConnected()) {
      await this.wallet.connect();
    }
    const senderPubkey = this.wallet.getPublicKey();
    if (!senderPubkey) throw new Error('MWA wallet not connected');

    const recipientPubkey = new PublicKey(params.recipientAddress);
    const lamports = Math.round(parseFloat(params.amount) * LAMPORTS_PER_SOL);

    const { blockhash } = await this.connection.getLatestBlockhash();

    const tx = new SolanaTransaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: recipientPubkey,
        lamports,
      }),
    );
    tx.recentBlockhash = blockhash;
    tx.feePayer = senderPubkey;

    let signature: string | null = null;

    await transact(async (mwaWallet) => {
      const signatures = await mwaWallet.signAndSendTransactions({
        transactions: [tx],
      });
      signature = signatures[0] ?? null;
    });

    const now = Date.now();
    const domainTx: Transaction = {
      id: signature ?? `mwa-${now}`,
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

    return domainTx;
  }

  async getHistory(): Promise<Transaction[]> {
    return [];
  }
}
