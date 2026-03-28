import type { Metadata } from "next";
import CategoryPageClient from "./CategoryPageClient";

const categoryNames: Record<string, string> = {
  "bil-og-motor": "Bil og motor",
  eiendom: "Eiendom",
  "klaer-og-mote": "Klær og mote",
  elektronikk: "Elektronikk",
  "mobler-og-interior": "Møbler og interiør",
  "sport-og-fritid": "Sport og fritid",
  "barn-og-baby": "Barn og baby",
  sykkel: "Sykkel",
  "boker-og-media": "Bøker og media",
  "kunst-og-hobby": "Kunst og hobby",
  verktoy: "Verktøy",
  gaming: "Gaming",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = categoryNames[slug] || slug;

  return {
    title: `${categoryName} — Markedsplass`,
    description: `Kjøp og selg ${categoryName.toLowerCase()}. Finn gode tilbud på Markedsplass.`,
    openGraph: {
      title: `${categoryName} — Markedsplass`,
      description: `Kjøp og selg ${categoryName.toLowerCase()}. Finn gode tilbud på Markedsplass.`,
    },
  };
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <CategoryPageClient params={params} />;
}
