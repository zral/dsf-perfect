"use client";

import Link from "next/link";
import { MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { useConversations } from "@/hooks/useMessages";
import type { Conversation } from "@/types/message";

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Nå";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} t`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  return date.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

function ConversationItem({ conversation }: { conversation: Conversation }) {
  const hasUnread = conversation.unread_count > 0;
  const adImage = conversation.ad.images?.[0]?.thumbnail_url;

  return (
    <Link href={`/meldinger/${conversation.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors ${
          hasUnread ? "bg-blue-50/50" : ""
        }`}
      >
        {/* Ad thumbnail or avatar */}
        <div className="h-12 w-12 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
          {adImage ? (
            <img
              src={adImage}
              alt={conversation.ad.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-sm truncate ${
                hasUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"
              }`}
            >
              {conversation.other_user.name}
            </span>
            <span className="text-[11px] text-gray-400 shrink-0">
              {timeAgo(conversation.updated_at)}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {conversation.ad.title}
          </p>
          {conversation.last_message && (
            <p
              className={`text-sm mt-0.5 truncate ${
                hasUnread ? "font-medium text-gray-900" : "text-gray-500"
              }`}
            >
              {truncate(conversation.last_message.content, 60)}
            </p>
          )}
        </div>

        {/* Unread badge */}
        {hasUnread && (
          <div className="shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">
              {conversation.unread_count > 99
                ? "99+"
                : conversation.unread_count}
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
          <div className="h-12 w-12 rounded-lg bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ConversationList() {
  const { data: conversations, isLoading, error } = useConversations();

  if (isLoading) return <ConversationListSkeleton />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">
          Kunne ikke laste meldinger. Prøv igjen senere.
        </p>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Ingen meldinger ennå
        </h3>
        <p className="text-sm text-gray-500">
          Finn en annonse og kontakt selgeren for å starte en samtale.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {conversations.map((conv) => (
        <ConversationItem key={conv.id} conversation={conv} />
      ))}
    </div>
  );
}
