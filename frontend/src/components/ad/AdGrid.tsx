"use client";

import AdCard from "./AdCard";
import type { Ad } from "@/types/ad";

interface AdGridProps {
  ads?: Ad[];
  isLoading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
        <div className="h-5 bg-blue-50 rounded-lg w-1/3 animate-pulse" />
      </div>
    </div>
  );
}

export default function AdGrid({ ads, isLoading }: AdGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
}
