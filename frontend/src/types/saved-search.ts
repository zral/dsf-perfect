export interface SavedSearchFilters {
  price_min?: number;
  price_max?: number;
  condition?: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  query: string | null;
  category_slug: string | null;
  filters: SavedSearchFilters;
  notify: boolean;
  created_at: string;
}

export interface SavedSearchCreateRequest {
  query?: string;
  category_slug?: string;
  filters?: SavedSearchFilters;
  notify?: boolean;
}

export interface SavedSearchListResponse {
  items: SavedSearch[];
  total: number;
}
