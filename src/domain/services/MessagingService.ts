import type { Message } from "@/src/domain/entities/Message";

export interface MessagingService {
  getThreads(): Promise<{ threadId: string; peerId: string; lastMessage: Message | null }[]>;
  getMessages(threadId: string): Promise<Message[]>;
  send(recipientId: string, text: string): Promise<Message>;
}
