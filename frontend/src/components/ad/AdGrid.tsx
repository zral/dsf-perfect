"use client";

import AdCard from "./AdCard";
import AdCardSkeleton from "./AdCardSkeleton";
import InfiniteScroll from "@/components/common/InfiniteScroll";
import type { Ad } from "@/types/ad";

interface AdGridProps {
  ads?: Ad[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
}

export default function AdGrid({
  ads,
  isLoading,
  onLoadMore,
  hasMore = false,
  isFetchingMore = false,
}: AdGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <AdCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm">Ingen annonser funnet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ads.map((ad, index) => (
          <AdCard key={ad.id} ad={ad} index={index} />
        ))}
      </div>

      {onLoadMore && (
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          isLoading={isFetchingMore}
        />
      )}
    </div>
  );
}
