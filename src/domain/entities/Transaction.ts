import type { TransferStatus } from "@/src/domain/status/TransferStatus";

export type TransactionDirection = "send" | "receive";

export interface Transaction {
  id: string;
  direction: TransactionDirection;
  amount: string;
  symbol: string;
  recipientId: string;
  senderId: string;
  status: TransferStatus;
  createdAt: number;
  settledAt: number | null;
  signature: string | null;
}
