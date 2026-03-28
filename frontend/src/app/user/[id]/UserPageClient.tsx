"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, MapPin, Star, Calendar, ArrowLeft, ShieldCheck } from "lucide-react";
import { usePublicUser, useUserAds } from "@/hooks/useUser";
import AdGrid from "@/components/ad/AdGrid";
import Button from "@/components/common/Button";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-200"
          }`}
        />
      ))}
      <span className="text-sm text-gray-500 ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function formatMemberSince(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("nb-NO", {
    month: "long",
    year: "numeric",
  });
}

export default function UserPageClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: user, isLoading: userLoading, error: userError } = usePublicUser(id);
  const { data: adsResponse, isLoading: adsLoading } = useUserAds(id);

  if (userLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </div>
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

  if (userError || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center py-16">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Brukeren ble ikke funnet
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Brukeren finnes ikke eller har blitt fjernet.
          </p>
          <Button variant="primary" onClick={() => router.push("/")}>
            Ga til forsiden
          </Button>
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
        className="space-y-6"
      >
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.back()}
        >
          Tilbake
        </Button>

        {/* User card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className="text-lg font-bold text-gray-900"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {user.name}
                </h1>
                {user.is_verified && (
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {user.location && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.location}
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Medlem siden {formatMemberSince(user.created_at)}
                </span>
              </div>
              <div className="mt-1.5">
                <StarRating rating={user.rating} />
              </div>
            </div>
          </div>
        </div>

        {/* User's ads */}
        <div>
          <h2
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Annonser fra {user.name}
          </h2>
          <AdGrid
            ads={adsResponse?.items}
            isLoading={adsLoading}
          />
        </div>
      </motion.div>
    </div>
  );
}
