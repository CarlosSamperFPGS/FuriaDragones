// src/lib/albion.ts
// Utilidades para la API Oficial de Render de Albion Online (Ítems y Hechizos)

export function getAlbionItemUrl(rawId?: string | null, tier: string = "T8"): string {
  if (!rawId) return "https://render.albiononline.com/v1/item/T8_BAG.png";
  const id = rawId.trim();

  // Si ya es una URL completa
  if (id.startsWith("http://") || id.startsWith("https://")) {
    return id;
  }

  // Si ya contiene el prefijo de Tier (T4_, T5_, T6_, T7_, T8_)
  if (/^T[1-8]_/.test(id)) {
    return `https://render.albiononline.com/v1/item/${id}.png`;
  }

  // Casos especiales (ítems únicos o misiones)
  if (id.startsWith("UNIQUE_") || id.startsWith("QUESTITEM_")) {
    return `https://render.albiononline.com/v1/item/${id}.png`;
  }

  // Prepend de Tier estándar T8 (Sobresaliente)
  return `https://render.albiononline.com/v1/item/${tier}_${id}.png`;
}

export function getAlbionSpellUrl(spellId?: string | null): string {
  if (!spellId) return "";
  if (spellId.startsWith("http://") || spellId.startsWith("https://")) {
    return spellId;
  }
  return `https://render.albiononline.com/v1/spell/${spellId}.png`;
}
