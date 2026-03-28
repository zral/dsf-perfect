"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ChatWindow from "@/components/messages/ChatWindow";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-sm text-gray-400">
          Laster samtale...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="h-[calc(100vh-4rem)] md:max-w-2xl md:mx-auto md:my-4 md:h-[calc(100vh-6rem)] md:border md:border-gray-100 md:rounded-2xl md:overflow-hidden bg-white">
      <ChatWindow conversationId={id} />
    </div>
  );
}
