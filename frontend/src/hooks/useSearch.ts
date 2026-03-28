"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AdListResponse } from "@/types/ad";

export interface SearchParams {
  q?: string;
  category?: string;
  location?: string;
  price_min?: number;
  price_max?: number;
  condition?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  per_page?: number;
}

export interface SearchResponse extends AdListResponse {
  query: string;
}

export interface Suggestion {
  text: string;
  category: string;
  count: number;
}

export interface SuggestResponse {
  suggestions: Suggestion[];
}

function buildSearchParams(params: SearchParams): Record<string, string> {
  const result: Record<string, string> = {};
  if (params.q) result.q = params.q;
  if (params.category) result.category = params.category;
  if (params.location) result.location = params.location;
  if (params.price_min !== undefined)
    result.price_min = String(params.price_min);
  if (params.price_max !== undefined)
    result.price_max = String(params.price_max);
  if (params.condition) result.condition = params.condition;
  if (params.sort) result.sort = params.sort;
  if (params.page) result.page = String(params.page);
  if (params.per_page) result.per_page = String(params.per_page);
  return result;
}

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ["search", params],
    queryFn: async () => {
      const { data } = await api.get<SearchResponse>("/api/v1/search", {
        params: buildSearchParams(params),
      });
      return data;
    },
  });
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useSuggest(query: string) {
  const debouncedQuery = useDebouncedValue(query, 300);

  return useQuery({
    queryKey: ["suggest", debouncedQuery],
    queryFn: async () => {
      const { data } = await api.get<SuggestResponse>(
        "/api/v1/search/suggest",
        {
          params: { q: debouncedQuery, limit: 5 },
        }
      );
      return data;
    },
    enabled: debouncedQuery.length >= 2,
  });
}
