export interface FavoriteResponse {
  id: string;
  ad_id: string;
  created_at: string;
}

// GET /api/v1/favorites returns Ad[] directly (not wrapped)
// See useFavorites hook for usage
