"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useAd } from "@/hooks/useAds";
import AdDetail from "@/components/ad/AdDetail";
import Button from "@/components/common/Button";

function AdDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-[4/3] bg-gray-100 rounded-2xl" />
          <div className="space-y-3">
            <div className="h-6 bg-gray-100 rounded w-3/4" />
            <div className="h-8 bg-gray-100 rounded w-1/4" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="h-6 bg-gray-100 rounded w-3/4" />
            <div className="h-8 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-100" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
            <div className="h-10 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: ad, isLoading, error } = useAd(id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.back()}
        >
          Tilbake
        </Button>
      </motion.div>

      {isLoading && <AdDetailSkeleton />}

      {error && (
        <div className="text-center py-16">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Annonsen ble ikke funnet
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Annonsen kan ha blitt fjernet eller lenken er feil.
          </p>
          <Button variant="primary" onClick={() => router.push("/")}>
            Gå til forsiden
          </Button>
        </div>
      )}

      {ad && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AdDetail ad={ad} />
        </motion.div>
      )}
    </div>
  );
}
