"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Bookmark, ArrowLeft, Search, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useSavedSearches,
  useDeleteSavedSearch,
} from "@/hooks/useSavedSearches";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";
import { useToastStore } from "@/stores/toastStore";

import type { SavedSearch, SavedSearchFilters } from "@/types/saved-search";

function formatFilters(search: SavedSearch): string {
  const parts: string[] = [];
  if (search.query) parts.push(`"${search.query}"`);
  if (search.category_slug) parts.push(search.category_slug);
  const f = search.filters;
  if (f.price_min || f.price_max) {
    const min = f.price_min ? `${f.price_min}` : "0";
    const max = f.price_max ? `${f.price_max}` : "";
    parts.push(`${min}–${max} kr`);
  }
  if (f.condition) parts.push(String(f.condition));
  return parts.join(" · ") || "Alle annonser";
}

export default function SavedSearchesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: savedSearches, isLoading } = useSavedSearches();
  const deleteSavedSearch = useDeleteSavedSearch();
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  function handleDelete(id: string) {
    deleteSavedSearch.mutate(id, {
      onSuccess: () => {
        addToast("Lagret sok slettet", "success");
      },
      onError: () => {
        addToast("Kunne ikke slette. Prov igjen.", "error");
      },
    });
  }

  function handleRunSearch(search: SavedSearch) {
    const sp = new URLSearchParams();
    if (search.query) sp.set("q", search.query);
    if (search.category_slug) sp.set("category", search.category_slug);
    const f = search.filters;
    if (f.price_min) sp.set("price_min", String(f.price_min));
    if (f.price_max) sp.set("price_max", String(f.price_max));
    if (f.condition) sp.set("condition", String(f.condition));
    const qs = sp.toString();
    router.push(`/search${qs ? `?${qs}` : ""}`);
  }

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="h-8 bg-gray-100 rounded-lg w-48 animate-pulse mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
          Lagrede sok
        </h1>

        {!isLoading && (!savedSearches || savedSearches.length === 0) ? (
          <EmptyState
            icon={Bookmark}
            title="Ingen lagrede sok"
            description="Nar du soker etter noe kan du lagre soket for a enkelt finne det igjen."
            action={{
              label: "Ga til sok",
              onClick: () => router.push("/search"),
            }}
          />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {savedSearches?.map((search) => (
              <motion.div
                key={search.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex items-center gap-4"
              >
                <button
                  onClick={() => handleRunSearch(search)}
                  className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer text-left"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Search className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formatFilters(search)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Lagret{" "}
                      {new Date(search.created_at).toLocaleDateString("nb-NO")}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(search.id)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                  aria-label="Slett lagret sok"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
