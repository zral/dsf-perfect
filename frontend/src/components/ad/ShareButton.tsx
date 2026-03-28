"use client";

import { Share2 } from "lucide-react";
import { useToastStore } from "@/stores/toastStore";

interface ShareButtonProps {
  ad: { id: string; title: string };
  size?: "sm" | "md";
}

export default function ShareButton({ ad, size = "md" }: ShareButtonProps) {
  const addToast = useToastStore((s) => s.addToast);

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/ad/${ad.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: `Se pa denne annonsen: ${ad.title}`,
          url,
        });
      } catch (err) {
        // User cancelled share — ignore
        if ((err as Error)?.name === "AbortError") return;
        // Fallback to clipboard
        await copyToClipboard(url);
      }
    } else {
      await copyToClipboard(url);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      addToast("Lenke kopiert!", "success");
    } catch {
      addToast("Kunne ikke kopiere lenke", "error");
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`${buttonSize} rounded-full bg-gray-100 flex items-center justify-center
        hover:bg-gray-200 transition-colors cursor-pointer`}
      aria-label="Del annonse"
    >
      <Share2 className={`${iconSize} text-gray-600`} />
    </button>
  );
}
