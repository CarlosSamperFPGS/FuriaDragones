// src/lib/items.ts
// Helper oficial para renderizado y catálogo de ítems de Albion Online

import { ALBION_ITEMS as RAW_ALBION_ITEMS, getItemImageUrl as rawGetItemImageUrl } from "./items-data.js";

export interface AlbionItemLike {
  id: string;
  name: string;
  category?: string;
  slot: string;
  twoHanded?: boolean;
  fixedTier?: string;
  [key: string]: any;
}

export const ALBION_ITEMS: AlbionItemLike[] = RAW_ALBION_ITEMS as AlbionItemLike[];

export function getItemImageUrl(
  itemOrId: string | AlbionItemLike | null | undefined,
  tier: string = "T8",
  enchant: number = 0,
  quality: number = 4
): string {
  if (!itemOrId) return "";
  return rawGetItemImageUrl(itemOrId, tier, enchant, quality);
}
