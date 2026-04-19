import type { MessagingService } from '@/src/domain/services/MessagingService';
import type { Message } from '@/src/domain/entities/Message';
import { fixtureThreads } from '@/src/fixtures/conversations';

export class FixtureMessagingAdapter implements MessagingService {
  async getThreads(): Promise<{ threadId: string; peerId: string; lastMessage: Message | null }[]> {
    return fixtureThreads.map(t => ({
      threadId: t.threadId,
      peerId: t.peerId,
      lastMessage: t.lastMessage,
    }));
  }

  async getMessages(threadId: string): Promise<Message[]> {
    const thread = fixtureThreads.find(t => t.threadId === threadId || t.peerId === threadId);
    return thread?.messages ?? [];
  }

  async send(recipientId: string, text: string): Promise<Message> {
    const msg: Message = {
      id: `msg-fixture-${Date.now()}`,
      threadId: `thread-${recipientId}`,
      senderId: 'self',
      recipientId,
      content: { type: 'text', text },
      status: 'sending',
      sentAt: Date.now(),
      deliveredAt: null,
    };
    return msg;
  }
}

export const fixtureMessagingAdapter = new FixtureMessagingAdapter();
