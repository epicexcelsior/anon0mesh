import type { MessagingService } from '@/src/domain/services/MessagingService';
import type { Message } from '@/src/domain/entities/Message';
import {
  type FixtureThread,
  fixtureThreads,
} from '@/src/fixtures/conversations';

export class FixtureMessagingAdapter implements MessagingService {
  private readonly threads: FixtureThread[] = fixtureThreads.map((thread) => ({
    threadId: thread.threadId,
    peerId: thread.peerId,
    messages: thread.messages.map((message) => ({ ...message })),
    get lastMessage() {
      return this.messages[this.messages.length - 1] ?? null;
    },
  }));

  async getThreads(): Promise<{ threadId: string; peerId: string; lastMessage: Message | null }[]> {
    return this.threads.map(t => ({
      threadId: t.threadId,
      peerId: t.peerId,
      lastMessage: t.lastMessage,
    }));
  }

  async getMessages(threadId: string): Promise<Message[]> {
    const thread = this.threads.find(t => t.threadId === threadId || t.peerId === threadId);
    return thread?.messages.map((message) => ({ ...message })) ?? [];
  }

  async send(recipientId: string, text: string): Promise<Message> {
    let thread = this.threads.find(
      (candidate) => candidate.peerId === recipientId || candidate.threadId === recipientId,
    );

    if (!thread) {
      thread = {
        threadId: `thread-${recipientId}`,
        peerId: recipientId,
        messages: [],
        get lastMessage() {
          return this.messages[this.messages.length - 1] ?? null;
        },
      };
      this.threads.unshift(thread);
    }

    const msg: Message = {
      id: `msg-fixture-${Date.now()}`,
      threadId: thread.threadId,
      senderId: 'self',
      recipientId,
      content: { type: 'text', text },
      status: 'sending',
      sentAt: Date.now(),
      deliveredAt: null,
    };
    thread.messages.push(msg);

    setTimeout(() => {
      const targetThread = this.threads.find((candidate) => candidate.threadId === thread.threadId);
      const targetMessage = targetThread?.messages.find((candidate) => candidate.id === msg.id);
      if (!targetMessage) return;
      targetMessage.status = 'delivered';
      targetMessage.deliveredAt = Date.now();
    }, 1200);

    return msg;
  }
}

export const fixtureMessagingAdapter = new FixtureMessagingAdapter();
