"use client";

import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import PriceTag from "./PriceTag";
import { ConditionBadge } from "./Badge";
import ImagePlaceholder from "./ImagePlaceholder";
import type { Ad } from "@/types/ad";

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Akkurat nå";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min siden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} t siden`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} d siden`;
  const months = Math.floor(days / 30);
  return `${months} mnd siden`;
}

interface AdCardProps {
  ad: Ad;
  index?: number;
}

export default function AdCard({ ad, index = 0 }: AdCardProps) {
  const thumbnailUrl =
    ad.images.length > 0 ? ad.images[0].thumbnail_url : null;

  return (
    <Link href={`/ad/${ad.id}`}>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
        whileHover={{ y: -2 }}
        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden
          hover:shadow-lg hover:border-gray-200 transition-shadow duration-300"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ImagePlaceholder />
          )}
          <div className="absolute top-2 left-2">
            <ConditionBadge condition={ad.condition} />
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-2">
          <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 leading-snug">
            {ad.title}
          </h3>

          <PriceTag price={ad.price} priceType={ad.price_type} size="sm" />

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {ad.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {ad.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(ad.created_at)}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
