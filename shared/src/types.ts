export const CATEGORIES = [
  "top",
  "bottom",
  "shoes",
  "outerwear",
  "accessory",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface ClothingItem {
  id: string;
  userId: string;
  name: string;
  category: Category;
  imageUrl: string;
  createdAt: string;
}

export interface Outfit {
  id: string;
  userId: string;
  name: string;
  tags: string[];
  itemIds: string[];
  createdAt: string;
}

// ---- API request / response types ----

export interface CreateItemRequest {
  name: string;
  category: Category;
  contentType: string;
}

export interface CreateItemResponse {
  item: ClothingItem;
  uploadUrl: string;
}

export interface CreateOutfitRequest {
  name: string;
  tags: string[];
  itemIds: string[];
}

export interface UpdateOutfitRequest {
  name?: string;
  tags?: string[];
  itemIds?: string[];
}

export interface WearEvent {
  id: string;
  userId: string;
  outfitId: string;
  itemIds: string[];
  wornAt: string;
}

export interface WearStats {
  outfitId: string;
  lastWornAt: string | null;
  totalWears: number;
}

export interface ItemWearStats {
  itemId: string;
  lastWornAt: string | null;
  totalWears: number;
}
