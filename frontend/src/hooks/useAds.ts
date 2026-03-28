"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Ad,
  AdListResponse,
  AdCreateRequest,
  AdUpdateRequest,
  AdFilters,
  AdImage,
} from "@/types/ad";

function buildParams(filters: AdFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.page) params.page = String(filters.page);
  if (filters.per_page) params.per_page = String(filters.per_page);
  if (filters.category) params.category = filters.category;
  if (filters.price_min !== undefined)
    params.price_min = String(filters.price_min);
  if (filters.price_max !== undefined)
    params.price_max = String(filters.price_max);
  if (filters.condition) params.condition = filters.condition;
  if (filters.sort) params.sort = filters.sort;
  return params;
}

export function useAds(filters: AdFilters = {}) {
  return useQuery({
    queryKey: ["ads", filters],
    queryFn: async () => {
      const { data } = await api.get<AdListResponse>("/api/v1/ads", {
        params: buildParams(filters),
      });
      return data;
    },
  });
}

export function useAd(id: string) {
  return useQuery({
    queryKey: ["ad", id],
    queryFn: async () => {
      const { data } = await api.get<Ad>(`/api/v1/ads/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCategoryAds(slug: string, filters: AdFilters = {}) {
  return useQuery({
    queryKey: ["categoryAds", slug, filters],
    queryFn: async () => {
      const { data } = await api.get<AdListResponse>(
        `/api/v1/categories/${slug}/ads`,
        { params: buildParams(filters) }
      );
      return data;
    },
    enabled: !!slug,
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adData: AdCreateRequest) => {
      const { data } = await api.post<Ad>("/api/v1/ads", adData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useUpdateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: adData,
    }: {
      id: string;
      data: AdUpdateRequest;
    }) => {
      const { data } = await api.patch<Ad>(`/api/v1/ads/${id}`, adData);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ad", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/ads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ adId, file }: { adId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      // Don't set Content-Type manually — Axios sets it automatically with correct boundary for FormData
      const { data } = await api.post<AdImage>(
        `/api/v1/ads/${adId}/images`,
        formData
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ad", variables.adId] });
    },
  });
}
