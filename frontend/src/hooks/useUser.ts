"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { User } from "@/types/user";
import type { Ad, AdListResponse } from "@/types/ad";

export interface PublicUser {
  id: string;
  name: string;
  avatar_url: string | null;
  location: string | null;
  rating: number;
  is_verified: boolean;
  created_at: string;
}

export function usePublicUser(userId: string) {
  return useQuery({
    queryKey: ["publicUser", userId],
    queryFn: async () => {
      const { data } = await api.get<PublicUser>(`/api/v1/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
}

export function useUserAds(userId: string) {
  return useQuery({
    queryKey: ["userAds", userId],
    queryFn: async () => {
      const { data } = await api.get<AdListResponse>(
        `/api/v1/users/${userId}/ads`
      );
      return data;
    },
    enabled: !!userId,
  });
}
