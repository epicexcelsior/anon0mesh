import { useState, useEffect, useCallback } from 'react';
import type { Message } from '@/src/domain/entities/Message';
import { useAdapters } from '@/src/providers/AdapterProvider';

export interface Thread {
  threadId: string;
  peerId: string;
  lastMessage: Message | null;
  unreadCount: number;
}

export function useMessages() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const adapters = useAdapters();

  useEffect(() => {
    adapters.messaging
      .getThreads()
      .then(raw => {
        const withUnread: Thread[] = raw.map(t => ({ ...t, unreadCount: 0 }));
        setThreads(withUnread);
      })
      .catch(() => {});
  }, [adapters]);

  return { threads };
}

export function useConversation(peerId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const adapters = useAdapters();

  useEffect(() => {
    adapters.messaging.getMessages(peerId).then(setMessages).catch(() => {});
  }, [adapters, peerId]);

  const send = useCallback(
    async (text: string) => {
      setSending(true);
      try {
        await adapters.messaging.send(peerId, text);
      } finally {
        setSending(false);
      }
    },
    [adapters, peerId],
  );

  return { messages, sending, send };
}
