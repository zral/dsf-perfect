export enum PriceType {
  FIXED = "FIXED",
  BID = "BID",
  FREE = "FREE",
  CONTACT = "CONTACT",
}

export enum AdCondition {
  NEW = "NEW",
  LIKE_NEW = "LIKE_NEW",
  GOOD = "GOOD",
  FAIR = "FAIR",
}

export enum AdStatus {
  ACTIVE = "ACTIVE",
  SOLD = "SOLD",
  EXPIRED = "EXPIRED",
  DRAFT = "DRAFT",
}

export interface AdImage {
  id: string;
  url: string;
  thumbnail_url: string;
  position: number;
}

export interface SellerBrief {
  id: string;
  name: string;
  avatar_url: string | null;
  rating: number;
}

export interface CategoryBrief {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: PriceType;
  condition: AdCondition;
  status: AdStatus;
  location: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
  images: AdImage[];
  seller: SellerBrief;
  category: CategoryBrief;
}

export interface AdListResponse {
  items: Ad[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface AdCreateRequest {
  title: string;
  description: string;
  price: number;
  price_type: PriceType;
  condition: AdCondition;
  category_id: string;
  location?: string;
}

export interface AdUpdateRequest {
  title?: string;
  description?: string;
  price?: number;
  price_type?: PriceType;
  condition?: AdCondition;
  category_id?: string;
  location?: string;
}

export interface AdFilters {
  page?: number;
  per_page?: number;
  category?: string;
  price_min?: number;
  price_max?: number;
  condition?: AdCondition;
  sort?: "newest" | "price_asc" | "price_desc";
}
