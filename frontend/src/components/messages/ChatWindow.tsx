"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import { motion } from "framer-motion";
import { useConversation, useSendMessage, useWebSocket } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import type { Message } from "@/types/message";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

function formatDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (msgDate.getTime() === today.getTime()) return "I dag";
  if (msgDate.getTime() === yesterday.getTime()) return "I går";
  return date.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year:
      date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function groupMessagesByDate(
  messages: Message[]
): Array<{ date: string; messages: Message[] }> {
  const groups: Map<string, Message[]> = new Map();

  // Messages come newest-first from API, reverse for display
  const sorted = [...messages].reverse();

  for (const msg of sorted) {
    const dateKey = new Date(msg.created_at).toDateString();
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(msg);
  }

  return Array.from(groups.entries()).map(([, msgs]) => ({
    date: formatDateGroup(msgs[0].created_at),
    messages: msgs,
  }));
}

interface ChatWindowProps {
  conversationId: string;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useConversation(conversationId);
  const sendMessageMutation = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useWebSocket(conversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  function handleSend(content: string) {
    if (!data?.conversation) return;
    sendMessageMutation.mutate({
      ad_id: data.conversation.ad.id,
      conversation_id: conversationId,
      content,
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="h-5 bg-gray-100 rounded w-32 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded w-48 mt-1 animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-sm text-gray-400">
            Laster meldinger...
          </div>
        </div>
      </div>
    );
  }

  if (!data?.conversation) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-sm text-gray-500">Samtalen ble ikke funnet.</p>
      </div>
    );
  }

  const { conversation, messages } = data;
  const dateGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/meldinger")}
            className="shrink-0 p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>

          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            {conversation.other_user.avatar_url ? (
              <img
                src={conversation.other_user.avatar_url}
                alt={conversation.other_user.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-blue-600" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {conversation.other_user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {conversation.ad.title}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {dateGroups.map((group) => (
          <div key={group.date}>
            <div className="flex items-center justify-center my-3">
              <span className="text-[11px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {group.date}
              </span>
            </div>
            <div className="space-y-2">
              {group.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender_id === user?.id}
                />
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={sendMessageMutation.isPending}
      />
    </div>
  );
}
