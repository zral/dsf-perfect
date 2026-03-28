"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ConversationList from "@/components/messages/ConversationList";

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-40" />
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-16 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h1
            className="text-xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Meldinger
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100">
          <ConversationList />
        </div>
      </motion.div>
    </div>
  );
}
