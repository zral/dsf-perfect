"use client";

import { PriceType } from "@/types/ad";

interface PriceTagProps {
  price: number;
  priceType: PriceType;
  size?: "sm" | "md" | "lg";
}

function formatPrice(priceInOre: number): string {
  const kroner = Math.floor(priceInOre / 100);
  return kroner.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function PriceTag({
  price,
  priceType,
  size = "md",
}: PriceTagProps) {
  const sizeClasses = {
    sm: "text-sm font-semibold",
    md: "text-base font-bold",
    lg: "text-2xl font-bold",
  };

  const label = (() => {
    switch (priceType) {
      case PriceType.FREE:
        return "Gratis";
      case PriceType.BID:
        return "Bud";
      case PriceType.CONTACT:
        return "Ta kontakt";
      case PriceType.FIXED:
      default:
        return `${formatPrice(price)} kr`;
    }
  })();

  return (
    <span className={`text-blue-600 ${sizeClasses[size]}`}>{label}</span>
  );
}
