"use client";

import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import type { Message } from "@/types/message";

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] sm:max-w-[65%] px-3.5 py-2.5 rounded-2xl ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div
          className={`flex items-center justify-end gap-1 mt-1 ${
            isOwn ? "text-blue-200" : "text-gray-400"
          }`}
        >
          <span className="text-[10px]">{formatTime(message.created_at)}</span>
          {isOwn &&
            (message.is_read ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            ))}
        </div>
      </div>
    </motion.div>
  );
}
