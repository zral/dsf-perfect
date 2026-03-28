import type { Metadata } from "next";
import UserPageClient from "./UserPageClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/api/v1/users/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { title: "Bruker ikke funnet | Markedsplass" };
    }

    const user = await res.json();
    const title = `${user.name} | Markedsplass`;
    const description = `Se annonser fra ${user.name}${user.location ? ` i ${user.location}` : ""} pa Markedsplass.`;

    return {
      title,
      description,
      openGraph: {
        title: user.name,
        description,
      },
    };
  } catch {
    return { title: "Markedsplass" };
  }
}

export default function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <UserPageClient params={params} />;
}
