"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";
import { useInfiniteSearch } from "@/hooks/useSearch";
import type { SearchParams } from "@/hooks/useSearch";
import AdGrid from "@/components/ad/AdGrid";
import FilterPanel from "@/components/search/FilterPanel";
import type { FilterValues } from "@/components/search/FilterPanel";
import type { AdCondition } from "@/types/ad";
import EmptyState from "@/components/common/EmptyState";

function parseSearchParams(sp: URLSearchParams): SearchParams {
  const params: SearchParams = {};
  const q = sp.get("q");
  if (q) params.q = q;
  const category = sp.get("category");
  if (category) params.category = category;
  const location = sp.get("location");
  if (location) params.location = location;
  const priceMin = sp.get("price_min");
  if (priceMin) params.price_min = Number(priceMin);
  const priceMax = sp.get("price_max");
  if (priceMax) params.price_max = Number(priceMax);
  const condition = sp.get("condition");
  if (condition) params.condition = condition;
  const sort = sp.get("sort");
  if (sort) params.sort = sort as SearchParams["sort"];
  return params;
}

function searchParamsToFilterValues(params: SearchParams): FilterValues {
  return {
    price_min: params.price_min,
    price_max: params.price_max,
    conditions: params.condition
      ? [params.condition as AdCondition]
      : [],
    sort: params.sort || "newest",
    location: params.location,
  };
}

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const params = parseSearchParams(searchParams);
  const filters = searchParamsToFilterValues(params);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearch({
    ...params,
    per_page: 20,
  });

  const allAds = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const total = data?.pages[0]?.total;

  const updateUrl = useCallback(
    (newParams: Record<string, string | undefined>) => {
      const sp = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          sp.delete(key);
        } else {
          sp.set(key, value);
        }
      });

      // Remove page param — infinite scroll handles pagination
      sp.delete("page");

      const queryString = sp.toString();
      router.push(`/search${queryString ? `?${queryString}` : ""}`);
    },
    [searchParams, router]
  );

  const handleFilterChange = useCallback(
    (newFilters: FilterValues) => {
      updateUrl({
        price_min:
          newFilters.price_min !== undefined
            ? String(newFilters.price_min)
            : undefined,
        price_max:
          newFilters.price_max !== undefined
            ? String(newFilters.price_max)
            : undefined,
        condition:
          newFilters.conditions.length > 0
            ? newFilters.conditions[0]
            : undefined,
        sort: newFilters.sort !== "newest" ? newFilters.sort : undefined,
        location: newFilters.location || undefined,
        q: params.q,
      });
    },
    [updateUrl, params.q]
  );

  const handleResetAll = useCallback(() => {
    router.push("/search");
  }, [router]);

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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {params.q ? (
                <>Sokeresultater</>
              ) : (
                <>Alle annonser</>
              )}
            </h1>
            {params.q && (
              <p className="text-sm text-gray-500 mt-1">
                {total !== undefined
                  ? `${total} annonser funnet for \u00AB${params.q}\u00BB`
                  : "Soker..."}
              </p>
            )}
            {!params.q && total !== undefined && (
              <p className="text-sm text-gray-500 mt-1">
                {total} annonser
              </p>
            )}
          </div>

          {/* Mobile filter button */}
          <div className="lg:hidden">
            <FilterPanel filters={filters} onChange={handleFilterChange} />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop filter sidebar */}
          <div className="hidden lg:block">
            <FilterPanel filters={filters} onChange={handleFilterChange} />
          </div>

          {/* Results */}
          <div className="flex-1 space-y-6">
            {!isLoading && allAds.length === 0 ? (
              <EmptyState
                icon={PackageOpen}
                title="Ingen treff"
                description={
                  params.q
                    ? `Vi fant ingen annonser som matcher \u00AB${params.q}\u00BB. Prov et annet sokeord eller fjern noen filtre.`
                    : "Ingen annonser matcher de valgte filtrene. Prov a justere filtrene."
                }
                action={{
                  label: "Nullstill alle filtre",
                  onClick: handleResetAll,
                }}
              />
            ) : (
              <AdGrid
                ads={allAds}
                isLoading={isLoading}
                onLoadMore={handleLoadMore}
                hasMore={!!hasNextPage}
                isFetchingMore={isFetchingNextPage}
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
