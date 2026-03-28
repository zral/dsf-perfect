"use client";

import { AdCondition, AdStatus, PriceType } from "@/types/ad";

type BadgeVariant = "green" | "red" | "blue" | "yellow" | "gray";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: "bg-green-50 text-green-700 border-green-200",
  red: "bg-red-50 text-red-700 border-red-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  gray: "bg-gray-50 text-gray-700 border-gray-200",
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: AdStatus }) {
  switch (status) {
    case AdStatus.ACTIVE:
      return <Badge variant="green">Aktiv</Badge>;
    case AdStatus.SOLD:
      return <Badge variant="red">Solgt</Badge>;
    case AdStatus.EXPIRED:
      return <Badge variant="gray">Utl&oslash;pt</Badge>;
    case AdStatus.DRAFT:
      return <Badge variant="yellow">Kladd</Badge>;
  }
}

export function ConditionBadge({ condition }: { condition: AdCondition }) {
  switch (condition) {
    case AdCondition.NEW:
      return <Badge variant="green">Ny</Badge>;
    case AdCondition.LIKE_NEW:
      return <Badge variant="blue">Som ny</Badge>;
    case AdCondition.GOOD:
      return <Badge variant="yellow">God</Badge>;
    case AdCondition.FAIR:
      return <Badge variant="gray">Brukbar</Badge>;
  }
}

export function PriceTypeBadge({ priceType }: { priceType: PriceType }) {
  switch (priceType) {
    case PriceType.FREE:
      return <Badge variant="blue">Gratis</Badge>;
    case PriceType.BID:
      return <Badge variant="yellow">Bud</Badge>;
    case PriceType.CONTACT:
      return <Badge variant="gray">Ta kontakt</Badge>;
    default:
      return null;
  }
}

export default Badge;
