import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction as SolanaTransaction,
} from '@solana/web3.js';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { Wallet } from '@/src/domain/entities/Wallet';
import type {
  SendParams,
  WalletExportState,
  WalletService,
} from '@/src/domain/services/WalletService';
import { LocalWallet } from './LocalWallet';
import { WalletFactory } from './WalletFactory';
import {
  getWalletTransferHistory,
  solanaConnection,
  solanaTransactionService,
} from '@/src/infrastructure/solana';

export class LocalWalletAdapter implements WalletService {
  private wallet: LocalWallet;

  constructor() {
    this.wallet = new LocalWallet();
  }

  getMode() {
    return 'local' as const;
  }

  canCreateLocalWallet() {
    return true;
  }

  canConnectExternalWallet() {
    return false;
  }

  async createLocalWallet(): Promise<Wallet> {
    this.wallet = await WalletFactory.createLocal();
    const wallet = await this.getWallet();
    if (!wallet) {
      throw new Error('Local wallet was created, but no address was returned');
    }
    return wallet;
  }

  async connectExternalWallet(): Promise<Wallet> {
    throw new Error('External wallet connect is unavailable in local wallet mode');
  }

  async getWallet(): Promise<Wallet | null> {
    const exists = await LocalWallet.exists();
    if (!exists) return null;

    await this.wallet.connect();
    const pubkey = this.wallet.getPublicKey();
    if (!pubkey) return null;

    const balance = await solanaConnection.getBalance(pubkey);
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
    const exists = await LocalWallet.exists();
    if (!exists) {
      return {
        available: false,
        kind: 'private-key',
        mode: 'local',
        reason: 'No local wallet found on this device.',
      };
    }

    return {
      available: true,
      kind: 'private-key',
      mode: 'local',
    };
  }

  async exportPrivateKey(): Promise<string> {
    if (!this.wallet.isConnected()) {
      await this.wallet.connect();
    }

    const secretKey = await this.wallet.exportSecretKey();
    try {
      return Buffer.from(secretKey).toString('hex');
    } finally {
      secretKey.fill(0);
    }
  }

  async refreshBalances(): Promise<void> {
    if (!this.wallet.isConnected()) {
      await this.wallet.connect();
    }
    const pubkey = this.wallet.getPublicKey();
    if (!pubkey) return;
    await solanaConnection.getBalance(pubkey);
  }

  async send(params: SendParams): Promise<Transaction> {
    if (params.symbol !== 'SOL') {
      throw new Error('Only SOL sends supported');
    }

    if (!this.wallet.isConnected()) {
      await this.wallet.connect();
    }
    const senderPubkey = this.wallet.getPublicKey();
    if (!senderPubkey) throw new Error('Wallet not connected');

    const recipientPubkey = new PublicKey(params.recipientAddress);
    const lamports = Math.round(parseFloat(params.amount) * LAMPORTS_PER_SOL);

    const tx = new SolanaTransaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: recipientPubkey,
        lamports,
      }),
    );

    const { blockhash } = await solanaConnection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = senderPubkey;

    // exportSecretKey triggers biometric prompt on real device — intentional
    const secretKey = await this.wallet.exportSecretKey();
    const keypair = Keypair.fromSecretKey(secretKey);
    tx.sign(keypair);
    secretKey.fill(0); // zero key material immediately after signing

    const rawTx = tx.serialize();
    const signature = await solanaConnection.sendRawTransaction(rawTx);

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
    if (!this.wallet.isConnected()) {
      const exists = await LocalWallet.exists();
      if (!exists) return [];
      await this.wallet.connect();
    }

    const pubkey = this.wallet.getPublicKey();
    if (!pubkey) return [];

    return getWalletTransferHistory(pubkey);
  }
}
