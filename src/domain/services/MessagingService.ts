import type { Message } from "@/src/domain/entities/Message";

/**
 * MessagingService — domain contract for conversation / message operations.
 *
 * Thread addressing convention (v3-full MVP):
 *   For 1:1 conversations, which is the only kind in scope for the MVP, the threadId
 *   is the counterparty peerId. Callers may pass either and adapters are expected to
 *   treat them equivalently. When group messaging lands, a distinct threadId becomes
 *   necessary and this contract should be revised to a ThreadRef discriminated union.
 */
export interface MessagingService {
  getThreads(): Promise<{ threadId: string; peerId: string; lastMessage: Message | null }[]>;
  /** For 1:1 threads, pass the peerId (equivalent to threadId in MVP). */
  getMessages(threadOrPeerId: string): Promise<Message[]>;
  send(recipientId: string, text: string): Promise<Message>;
}
