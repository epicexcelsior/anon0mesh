import type { Message } from '@/src/domain/entities/Message';

/** Fixture threads: 3 peer conversations with messages. */
export interface FixtureThread {
  threadId: string;
  peerId: string;
  lastMessage: Message | null;
  messages: Message[];
}

const now = Date.now();
const min = 60 * 1000;

export const fixtureThreads: FixtureThread[] = [
  {
    threadId: 'thread-peer-001',
    peerId: 'peer-001',
    messages: [
      {
        id: 'msg-001-a',
        threadId: 'thread-peer-001',
        senderId: 'peer-001',
        recipientId: 'self',
        content: { type: 'text', text: 'Hey, can you relay this packet?' },
        status: 'delivered',
        sentAt: now - 30 * min,
        deliveredAt: now - 29 * min,
      },
      {
        id: 'msg-001-b',
        threadId: 'thread-peer-001',
        senderId: 'self',
        recipientId: 'peer-001',
        content: { type: 'text', text: 'On it. Routing via BLE.' },
        status: 'delivered',
        sentAt: now - 28 * min,
        deliveredAt: now - 27 * min,
      },
      {
        id: 'msg-001-c',
        threadId: 'thread-peer-001',
        senderId: 'peer-001',
        recipientId: 'self',
        content: { type: 'text', text: 'Thanks, mesh is clear.' },
        status: 'delivered',
        sentAt: now - 5 * min,
        deliveredAt: now - 4 * min,
      },
    ],
    get lastMessage() {
      return this.messages[this.messages.length - 1] ?? null;
    },
  },
  {
    threadId: 'thread-peer-002',
    peerId: 'peer-002',
    messages: [
      {
        id: 'msg-002-a',
        threadId: 'thread-peer-002',
        senderId: 'self',
        recipientId: 'peer-002',
        content: { type: 'text', text: 'LXMF link active?' },
        status: 'delivered',
        sentAt: now - 90 * min,
        deliveredAt: now - 89 * min,
      },
      {
        id: 'msg-002-b',
        threadId: 'thread-peer-002',
        senderId: 'peer-002',
        recipientId: 'self',
        content: { type: 'text', text: 'Barely. Signal is weak but holding.' },
        status: 'delivered',
        sentAt: now - 88 * min,
        deliveredAt: now - 87 * min,
      },
    ],
    get lastMessage() {
      return this.messages[this.messages.length - 1] ?? null;
    },
  },
  {
    threadId: 'thread-peer-003',
    peerId: 'peer-003',
    messages: [
      {
        id: 'msg-003-a',
        threadId: 'thread-peer-003',
        senderId: 'peer-003',
        recipientId: 'self',
        content: { type: 'text', text: 'Frost Mesh here. Need your public key.' },
        status: 'delivered',
        sentAt: now - 10 * min,
        deliveredAt: now - 9 * min,
      },
      {
        id: 'msg-003-b',
        threadId: 'thread-peer-003',
        senderId: 'self',
        recipientId: 'peer-003',
        content: { type: 'text', text: 'Sending now.' },
        status: 'sending',
        sentAt: now - 1 * min,
        deliveredAt: null,
      },
    ],
    get lastMessage() {
      return this.messages[this.messages.length - 1] ?? null;
    },
  },
];
