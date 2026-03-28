"use client";

import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import PriceTag from "./PriceTag";
import { ConditionBadge } from "./Badge";
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
}

export default function AdCard({ ad }: AdCardProps) {
  const thumbnailUrl =
    ad.images.length > 0 ? ad.images[0].thumbnail_url : null;

  return (
    <Link href={`/ad/${ad.id}`}>
      <motion.article
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
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
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg
                className="h-12 w-12"
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
            </div>
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
