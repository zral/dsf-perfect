"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type {
  SavedSearch,
  SavedSearchCreateRequest,
} from "@/types/saved-search";

export function useSavedSearches() {
  const token = getAccessToken();
  return useQuery({
    queryKey: ["savedSearches"],
    queryFn: async () => {
      const { data } = await api.get<SavedSearch[]>("/api/v1/saved-searches");
      return data;
    },
    enabled: !!token,
  });
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: SavedSearchCreateRequest) => {
      const { data } = await api.post<SavedSearch>(
        "/api/v1/saved-searches",
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedSearches"] });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/saved-searches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedSearches"] });
    },
  });
}
