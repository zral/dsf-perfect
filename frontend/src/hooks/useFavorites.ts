"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type { Ad } from "@/types/ad";

export function useFavorites() {
  const token = getAccessToken();
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data } = await api.get<Ad[]>("/api/v1/favorites");
      return data;
    },
    enabled: !!token,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      adId,
      isFavorited,
    }: {
      adId: string;
      isFavorited: boolean;
    }) => {
      if (isFavorited) {
        await api.delete(`/api/v1/ads/${adId}/favorite`);
      } else {
        await api.post(`/api/v1/ads/${adId}/favorite`);
      }
      return { adId, isFavorited: !isFavorited };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useIsFavorited(adId: string): boolean {
  const { data: favorites } = useFavorites();
  if (!favorites) return false;
  return favorites.some((ad) => ad.id === adId);
}
