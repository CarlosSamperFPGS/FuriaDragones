// src/lib/items.ts
// Helper oficial para renderizado y catálogo de ítems de Albion Online

export interface AlbionItemLike {
  id?: string;
  name?: string;
  slot?: string;
  fixedTier?: string;
  twoHanded?: boolean;
  [key: string]: any;
}

export const ALBION_CATALOG = {
  weapons: [
    { id: "2H_AXE_AVALON", name: "Hacha Romperreinos", twoHanded: true },
    { id: "2H_MACE", name: "Maza Pesada", twoHanded: true },
    { id: "MAIN_HOLYSTAFF_AVALON", name: "Bastón de Caída Sagrada", twoHanded: false },
    { id: "2H_CURSEDSTAFF_MORGANA", name: "Llamador de Sombras", twoHanded: true },
    { id: "2H_ENIGMATICORB_MORGANA", name: "Locus Maléfico", twoHanded: true },
    { id: "2H_CLEAVER_HELL", name: "Espada Tallada", twoHanded: true },
    { id: "MAIN_SWORD", name: "Espada Ancha", twoHanded: false },
    { id: "2H_CLAYMORE", name: "Claymore", twoHanded: true },
    { id: "2H_DUALSWORD", name: "Dos Espadas", twoHanded: true },
    { id: "2H_BOW", name: "Arco de Guerra", twoHanded: true },
    { id: "2H_CROSSBOW", name: "Ballesta Pesada", twoHanded: true },
    { id: "2H_FIRESTAFF", name: "Gran Bastón de Fuego", twoHanded: true },
    { id: "2H_FROSTSTAFF", name: "Gran Bastón de Hielo", twoHanded: true },
    { id: "2H_HAMMER", name: "Gran Martillo", twoHanded: true },
    { id: "2H_SPEAR", name: "Pica", twoHanded: true },
  ],
  heads: [
    { id: "HEAD_CLOTH_SET2", name: "Hábito de Erudito" },
    { id: "HEAD_PLATE_SET2", name: "Yelmo de Soldado" },
    { id: "HEAD_LEATHER_SET1", name: "Capucha de Asesino" },
    { id: "HEAD_CLOTH_SET1", name: "Capucha de Clérigo" },
    { id: "HEAD_LEATHER_ROYAL", name: "Capucha Real" },
    { id: "HEAD_PLATE_SET1", name: "Yelmo de Caballero" },
    { id: "HEAD_PLATE_SET3", name: "Yelmo de Guardián" },
  ],
  armors: [
    { id: "ARMOR_LEATHER_HELL", name: "Chaqueta de Vándalo" },
    { id: "ARMOR_PLATE_SET3", name: "Armadura de Guardián" },
    { id: "ARMOR_CLOTH_SET2", name: "Túnica de Clérigo" },
    { id: "ARMOR_CLOTH_SET3", name: "Túnica de Mago" },
    { id: "ARMOR_CLOTH_ROYAL", name: "Túnica Real" },
    { id: "ARMOR_PLATE_SET1", name: "Armadura de Soldado" },
    { id: "ARMOR_LEATHER_SET1", name: "Chaqueta de Asesino" },
  ],
  shoes: [
    { id: "SHOES_CLOTH_SET1", name: "Sandalias de Erudito" },
    { id: "SHOES_LEATHER_SET2", name: "Botas de Cazador" },
    { id: "SHOES_CLOTH_SET2", name: "Zapatos de Clérigo" },
    { id: "SHOES_PLATE_SET1", name: "Botas de Soldado" },
    { id: "SHOES_LEATHER_SET1", name: "Zapatos de Asesino" },
    { id: "SHOES_PLATE_SET2", name: "Botas de Caballero" },
  ],
  capes: [
    { id: "CAPEITEM_FW_FORTSTERLING", name: "Capa de Fort Sterling" },
    { id: "CAPEITEM_FW_MARTLOCK", name: "Capa de Martlock" },
    { id: "CAPEITEM_FW_CAERLEON", name: "Capa de Caerleon" },
    { id: "CAPEITEM_FW_LYMHURST", name: "Capa de Lymhurst" },
    { id: "CAPEITEM_FW_MORGANA", name: "Capa de Morgana" },
    { id: "CAPEITEM_FW_THETFORD", name: "Capa de Thetford" },
    { id: "CAPEITEM_FW_BRIDGEWATCH", name: "Capa de Bridgewatch" },
  ],
  offhands: [
    { id: "OFF_BOOK", name: "Tomo de Hechizos" },
    { id: "OFF_SHIELD", name: "Escudo" },
    { id: "OFF_TORCH", name: "Antorcha" },
    { id: "OFF_HORN_KEEPER", name: "Brumario" },
    { id: "OFF_TOTEM_KEEPER", name: "Raíz Tapada" },
  ],
  potions: [
    { id: "POTION_REVIVE", name: "Poción de Resurrección" },
    { id: "POTION_STONESKIN", name: "Poción de Piel de Piedra" },
    { id: "POTION_COOLDOWN", name: "Poción de Veneno" },
    { id: "POTION_ENERGY", name: "Poción de Energía" },
    { id: "POTION_HEAL", name: "Poción de Curación" },
  ],
  foods: [
    { id: "MEAL_STEW", name: "Guiso de Ternera" },
    { id: "MEAL_OMELETTE", name: "Tortilla de Cerdo" },
    { id: "MEAL_ROAST", name: "Cerdo Asado" },
    { id: "MEAL_SANDWICH", name: "Sándwich de Buey" },
  ],
  bags: [
    { id: "BAG", name: "Bolsa T8" },
  ],
};

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
