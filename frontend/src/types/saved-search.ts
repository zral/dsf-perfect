export interface SavedSearchFilters {
  price_min?: number;
  price_max?: number;
  condition?: string;
}

export interface SavedSearch {
  id: string;
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

// GET /api/v1/saved-searches returns SavedSearch[] directly (not wrapped)
// See useSavedSearches hook for usage
