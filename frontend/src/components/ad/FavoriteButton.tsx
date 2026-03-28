"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useIsFavorited, useToggleFavorite } from "@/hooks/useFavorites";
import { useToastStore } from "@/stores/toastStore";

interface FavoriteButtonProps {
  adId: string;
  size?: "sm" | "md";
}

export default function FavoriteButton({
  adId,
  size = "sm",
}: FavoriteButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const isFavorited = useIsFavorited(adId);
  const toggleFavorite = useToggleFavorite();
  const addToast = useToastStore((s) => s.addToast);

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonSize =
    size === "sm" ? "h-8 w-8" : "h-10 w-10";

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    toggleFavorite.mutate(
      { adId, isFavorited },
      {
        onSuccess: ({ isFavorited: nowFavorited }) => {
          addToast(
            nowFavorited
              ? "Lagt til i favoritter"
              : "Fjernet fra favoritter",
            "success"
          );
        },
        onError: () => {
          addToast("Noe gikk galt. Prov igjen.", "error");
        },
      }
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      className={`${buttonSize} rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center
        shadow-sm hover:bg-white transition-colors cursor-pointer`}
      aria-label={isFavorited ? "Fjern fra favoritter" : "Legg til i favoritter"}
    >
      <motion.div
        animate={isFavorited ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Heart
          className={`${iconSize} transition-colors ${
            isFavorited
              ? "fill-red-500 text-red-500"
              : "fill-none text-gray-600"
          }`}
        />
      </motion.div>
    </motion.button>
  );
}
