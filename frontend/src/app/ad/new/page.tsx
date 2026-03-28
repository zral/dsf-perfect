"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdForm from "@/components/ad/AdForm";
import { useAuth } from "@/hooks/useAuth";
import { useCreateAd } from "@/hooks/useAds";
import { useUploadImage } from "@/hooks/useAds";
import type { AdCreateRequest } from "@/types/ad";
import type { UploadedImage } from "@/components/ad/ImageUpload";
import { useToastStore } from "@/stores/toastStore";

export default function NewAdPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const createAd = useCreateAd();
  const uploadImage = useUploadImage();
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (
    data: AdCreateRequest,
    images: UploadedImage[]
  ) => {
    try {
      const ad = await createAd.mutateAsync(data);

      // Upload images sequentially
      for (const image of images) {
        await uploadImage.mutateAsync({
          adId: ad.id,
          file: image.file,
        });
      }

      addToast("Annonsen er publisert!", "success");
      router.push(`/ad/${ad.id}`);
    } catch {
      addToast("Kunne ikke opprette annonsen. Prøv igjen.", "error");
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/3" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1
          className="text-2xl font-bold text-gray-900 mb-8 text-center"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Opprett ny annonse
        </h1>
        <AdForm
          onSubmit={handleSubmit}
          isSubmitting={createAd.isPending || uploadImage.isPending}
        />
      </motion.div>
    </div>
  );
}
