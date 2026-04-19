import type { Transaction } from "@/src/domain/entities/Transaction";
import type { Wallet } from "@/src/domain/entities/Wallet";

export interface SendParams {
  recipientAddress: string;
  amount: string;
  symbol: string;
  note?: string;
}

export interface WalletService {
  getWallet(): Promise<Wallet | null>;
  refreshBalances(): Promise<void>;
  send(params: SendParams): Promise<Transaction>;
  getHistory(): Promise<Transaction[]>;
}
