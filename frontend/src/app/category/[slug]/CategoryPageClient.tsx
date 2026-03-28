"use client";

import { use, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useInfiniteCategoryAds } from "@/hooks/useAds";
import AdGrid from "@/components/ad/AdGrid";
import FilterPanel from "@/components/search/FilterPanel";
import type { FilterValues } from "@/components/search/FilterPanel";
import type { AdCondition } from "@/types/ad";

const categoryNames: Record<string, string> = {
  "bil-og-motor": "Bil og motor",
  eiendom: "Eiendom",
  "klaer-og-mote": "Klær og mote",
  elektronikk: "Elektronikk",
  "mobler-og-interior": "Møbler og interiør",
  "sport-og-fritid": "Sport og fritid",
  "barn-og-baby": "Barn og baby",
  sykkel: "Sykkel",
  "boker-og-media": "Bøker og media",
  "kunst-og-hobby": "Kunst og hobby",
  verktoy: "Verktøy",
  gaming: "Gaming",
};

export default function CategoryPageClient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [filters, setFilters] = useState<FilterValues>({
    conditions: [],
    sort: "newest",
  });

  const queryFilters = useMemo(
    () => ({
      per_page: 20,
      price_min: filters.price_min ? filters.price_min * 100 : undefined,
      price_max: filters.price_max ? filters.price_max * 100 : undefined,
      condition: filters.conditions[0] as AdCondition | undefined,
      sort: filters.sort,
    }),
    [filters]
  );

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCategoryAds(slug, queryFilters);

  const allAds = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const total = data?.pages[0]?.total;
  const categoryName = categoryNames[slug] || slug;

  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {categoryName}
            </h1>
            {total !== undefined && (
              <p className="text-sm text-gray-500 mt-1">
                {total} annonser
              </p>
            )}
          </div>
          <div className="lg:hidden">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop filter sidebar */}
          <div className="hidden lg:block">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>

          {/* Results */}
          <div className="flex-1 space-y-6">
            <AdGrid
              ads={allAds}
              isLoading={isLoading}
              onLoadMore={handleLoadMore}
              hasMore={!!hasNextPage}
              isFetchingMore={isFetchingNextPage}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
