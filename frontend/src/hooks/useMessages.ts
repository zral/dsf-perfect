"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type {
  Conversation,
  ConversationDetail,
  Message,
  SendMessageRequest,
} from "@/types/message";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await api.get<Conversation[]>(
        "/api/v1/messages/conversations"
      );
      return data;
    },
  });
}

export function useConversation(id: string, page = 1) {
  return useQuery({
    queryKey: ["conversation", id, page],
    queryFn: async () => {
      const { data } = await api.get<ConversationDetail>(
        `/api/v1/messages/conversations/${id}`,
        { params: { page } }
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req: SendMessageRequest) => {
      const { data } = await api.post<Message>("/api/v1/messages", req);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      if (variables.conversation_id) {
        queryClient.invalidateQueries({
          queryKey: ["conversation", variables.conversation_id],
        });
      }
    },
  });
}

export function useUnreadCount() {
  const token = getAccessToken();
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      const { data } = await api.get<{ count: number }>(
        "/api/v1/messages/unread-count"
      );
      return data.count;
    },
    enabled: !!token,
    refetchInterval: 30_000,
  });
}

export function useWebSocket(conversationId: string | null) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    const token = getAccessToken();
    if (!token) return;

    const baseUrl = (
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    ).replace(/^http/, "ws");
    const ws = new WebSocket(`${baseUrl}/api/v1/messages/ws?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "new_message") {
          const msg: Message = payload.message;

          // Update conversation detail cache if viewing this conversation
          if (
            conversationId &&
            msg.conversation_id === conversationId
          ) {
            queryClient.setQueryData<ConversationDetail>(
              ["conversation", conversationId, 1],
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  messages: [msg, ...old.messages],
                  total: old.total + 1,
                };
              }
            );
          }

          // Refresh conversation list and unread count
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
        }

        if (payload.type === "messages_read") {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
          if (payload.conversation_id) {
            queryClient.invalidateQueries({
              queryKey: ["conversation", payload.conversation_id],
            });
          }
        }
      } catch {
        // Ignore invalid messages
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [conversationId, queryClient]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "message",
            conversation_id: conversationId,
            content,
          })
        );
      }
    },
    []
  );

  return { sendMessage };
}
