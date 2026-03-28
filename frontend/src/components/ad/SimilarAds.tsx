"use client";

import { useSimilarAds } from "@/hooks/useAds";
import AdCard from "./AdCard";
import AdCardSkeleton from "./AdCardSkeleton";

interface SimilarAdsProps {
  adId: string;
}

export default function SimilarAds({ adId }: SimilarAdsProps) {
  const { data: ads, isLoading } = useSimilarAds(adId);

  if (!isLoading && (!ads || ads.length === 0)) return null;

  return (
    <section className="mt-10">
      <h2
        className="text-lg sm:text-xl font-bold text-gray-900 mb-6"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Lignende annonser
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Mobile: horizontal scroll */}
          <div className="sm:hidden flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
            {ads!.map((ad, index) => (
              <div key={ad.id} className="w-[70vw] shrink-0 snap-start">
                <AdCard ad={ad} index={index} />
              </div>
            ))}
          </div>

          {/* Desktop: grid */}
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ads!.map((ad, index) => (
              <AdCard key={ad.id} ad={ad} index={index} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
