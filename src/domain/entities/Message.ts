export type MessageStatus = "sending" | "delivered" | "failed";
export type MessageContent =
  | { type: "text"; text: string }
  | { type: "transfer"; transactionId: string };

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  recipientId: string;
  content: MessageContent;
  status: MessageStatus;
  sentAt: number;
  deliveredAt: number | null;
}
