// src/lib/items.ts
// Helper oficial para renderizado de ítems con la API de Albion Online

export interface AlbionItemLike {
  id?: string;
  slot?: string;
  fixedTier?: string;
  [key: string]: any;
}

export function getItemImageUrl(
  itemOrId: string | AlbionItemLike | null | undefined,
  tier: string = "T8",
  enchant: number = 0,
  quality: number = 4
): string {
  if (!itemOrId) return "";
  const itemId =
    typeof itemOrId === "string" ? itemOrId.trim() : itemOrId?.id?.trim() || "";
  if (!itemId) return "";

  if (itemId.startsWith("http://") || itemId.startsWith("https://")) {
    return itemId;
  }

  const enchantSuffix = enchant > 0 ? `@${enchant}` : "";
  const isNoQuality =
    itemId.includes("POTION") ||
    itemId.includes("MEAL") ||
    itemId.includes("MOUNT") ||
    itemId.includes("BAG");
  const qualityParam = !isNoQuality && quality > 1 ? `?quality=${quality}` : "";

  if (itemId.startsWith("UNIQUE_") || itemId.startsWith("QUESTITEM_")) {
    return `https://render.albiononline.com/v1/item/${itemId}.png${qualityParam}`;
  }

  if (/^T[1-8]_/.test(itemId)) {
    return `https://render.albiononline.com/v1/item/${itemId}${enchantSuffix}.png${qualityParam}`;
  }

  return `https://render.albiononline.com/v1/item/${tier}_${itemId}${enchantSuffix}.png${qualityParam}`;
}
