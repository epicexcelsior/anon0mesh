import { useCallback, useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true);
  const adapters = useAdapters();

  const loadThreads = useCallback(async () => {
    try {
      const raw = await adapters.messaging.getThreads();
      const withUnread: Thread[] = raw
        .map((thread) => ({
          ...thread,
          unreadCount: 0,
        }))
        .sort(
          (left, right) =>
            (right.lastMessage?.sentAt ?? 0) - (left.lastMessage?.sentAt ?? 0),
        );
      setThreads(withUnread);
    } finally {
      setLoading(false);
    }
  }, [adapters]);

  useEffect(() => {
    void loadThreads();
    const intervalId = setInterval(() => {
      void loadThreads();
    }, 1500);
    return () => {
      clearInterval(intervalId);
    };
  }, [loadThreads]);

  return { threads, loading };
}

export function useConversation(peerId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const adapters = useAdapters();

  const loadMessages = useCallback(async () => {
    try {
      const nextMessages = await adapters.messaging.getMessages(peerId);
      setMessages(nextMessages);
    } catch {
      setMessages([]);
    }
  }, [adapters, peerId]);

  useEffect(() => {
    void loadMessages();
    const intervalId = setInterval(() => {
      void loadMessages();
    }, 1500);
    return () => {
      clearInterval(intervalId);
    };
  }, [loadMessages]);

  const send = useCallback(
    async (text: string) => {
      setSending(true);
      const optimisticId = `msg-local-${Date.now()}`;
      const optimisticMessage: Message = {
        id: optimisticId,
        threadId: peerId,
        senderId: "self",
        recipientId: peerId,
        content: { type: "text", text },
        status: "sending",
        sentAt: Date.now(),
        deliveredAt: null,
      };

      setMessages((current) => [...current, optimisticMessage]);

      try {
        const sent = await adapters.messaging.send(peerId, text);
        setMessages((current) => {
          const withoutOptimistic = current.filter((message) => message.id !== optimisticId);
          if (withoutOptimistic.some((message) => message.id === sent.id)) {
            return withoutOptimistic;
          }
          return [...withoutOptimistic, sent];
        });
      } catch {
        setMessages((current) =>
          current.map((message) =>
            message.id === optimisticId
              ? { ...message, status: "failed" }
              : message,
          ),
        );
      } finally {
        setSending(false);
      }
    },
    [adapters, peerId],
  );

  return { messages, sending, send };
}
