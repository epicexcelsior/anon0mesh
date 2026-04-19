import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction as SolanaTransaction,
} from '@solana/web3.js';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { Wallet } from '@/src/domain/entities/Wallet';
import type { SendParams, WalletService } from '@/src/domain/services/WalletService';
import { LocalWallet } from './LocalWallet';

const SOLANA_RPC = 'https://api.devnet.solana.com';

export class LocalWalletAdapter implements WalletService {
  private wallet: LocalWallet;
  private connection: Connection;

  constructor() {
    this.wallet = new LocalWallet();
    this.connection = new Connection(SOLANA_RPC, 'confirmed');
  }

  async getWallet(): Promise<Wallet | null> {
    const exists = await LocalWallet.exists();
    if (!exists) return null;

    await this.wallet.connect();
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
    if (!this.wallet.isConnected()) {
      await this.wallet.connect();
    }
    const pubkey = this.wallet.getPublicKey();
    if (!pubkey) return;
    await this.connection.getBalance(pubkey);
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

    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = senderPubkey;

    // exportSecretKey triggers biometric prompt on real device — intentional
    const secretKey = await this.wallet.exportSecretKey();
    const keypair = Keypair.fromSecretKey(secretKey);
    tx.sign(keypair);
    secretKey.fill(0); // zero key material immediately after signing

    const rawTx = tx.serialize();
    const signature = await this.connection.sendRawTransaction(rawTx);

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

    return domainTx;
  }

  async getHistory(): Promise<Transaction[]> {
    return [];
  }
}
