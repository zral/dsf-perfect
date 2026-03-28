"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import AdGrid from "@/components/ad/AdGrid";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: favorites, isLoading } = useFavorites();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="h-8 bg-gray-100 rounded-lg w-48 animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                <div className="h-5 bg-blue-50 rounded w-1/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push("/profile")}
          >
            Tilbake til profil
          </Button>
        </div>

        <h1
          className="text-xl sm:text-2xl font-bold text-gray-900 mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Mine favoritter
        </h1>

        {!isLoading && (!favorites || favorites.length === 0) ? (
          <EmptyState
            icon={Heart}
            title="Ingen favoritter enna"
            description="Trykk pa hjerteikonet pa en annonse for a legge den til i favorittene dine."
            action={{
              label: "Utforsk annonser",
              onClick: () => router.push("/"),
            }}
          />
        ) : (
          <AdGrid ads={favorites} isLoading={isLoading} />
        )}
      </motion.div>
    </div>
  );
}
