import type { Ad } from "./ad";

export interface Favorite {
  id: string;
  user_id: string;
  ad_id: string;
  created_at: string;
  ad: Ad;
}

export interface FavoriteListResponse {
  items: Favorite[];
  total: number;
}
