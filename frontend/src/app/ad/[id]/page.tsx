import type { Metadata } from "next";
import AdPageClient from "./AdPageClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("nb-NO").format(priceInCents / 100);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/api/v1/ads/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { title: "Annonse ikke funnet | Markedsplass" };
    }

    const ad = await res.json();
    const price = formatPrice(ad.price);
    const title = `${ad.title} — ${price} kr | Markedsplass`;
    const description = `${ad.description?.slice(0, 150)}${ad.description?.length > 150 ? "..." : ""}${ad.location ? ` ${ad.category?.name} i ${ad.location}` : ""}`;
    const imageUrl = ad.images?.[0]?.url || ad.images?.[0]?.thumbnail_url;

    return {
      title,
      description,
      openGraph: {
        title: `${ad.title} — ${price} kr`,
        description,
        ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
      },
    };
  } catch {
    return { title: "Markedsplass" };
  }
}

export default function AdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <AdPageClient params={params} />;
}
