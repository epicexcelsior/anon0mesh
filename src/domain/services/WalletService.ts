import type { Transaction } from "@/src/domain/entities/Transaction";
import type { Wallet } from "@/src/domain/entities/Wallet";

export type WalletMode = "local" | "mwa" | "fixture";

export interface WalletExportState {
  available: boolean;
  kind: "private-key";
  mode: WalletMode;
  reason?: string;
}

export interface SendParams {
  recipientAddress: string;
  amount: string;
  symbol: string;
  note?: string;
}

export interface WalletService {
  getMode(): WalletMode;
  canCreateLocalWallet(): boolean;
  canConnectExternalWallet(): boolean;
  createLocalWallet(): Promise<Wallet>;
  connectExternalWallet(): Promise<Wallet>;
  getWallet(): Promise<Wallet | null>;
  getExportState(): Promise<WalletExportState>;
  exportPrivateKey(): Promise<string>;
  refreshBalances(): Promise<void>;
  send(params: SendParams): Promise<Transaction>;
  getHistory(): Promise<Transaction[]>;
}
