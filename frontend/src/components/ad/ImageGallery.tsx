"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AdImage } from "@/types/ad";

interface ImageGalleryProps {
  images: AdImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg
            className="h-16 w-16 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Ingen bilder</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[selectedIndex].id}
            src={images[selectedIndex].url}
            alt={`Bilde ${selectedIndex + 1}`}
            className="w-full h-full object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {/* Image counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
          {selectedIndex + 1}/{images.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                index === selectedIndex
                  ? "border-blue-500 ring-2 ring-blue-500/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={image.thumbnail_url}
                alt={`Minibilde ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
