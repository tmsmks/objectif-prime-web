// Types + helpers Open Food Facts.
// Les fonctions client (`searchFood`, `getByBarcode`) passent par /api/food/*
// pour éviter les blocages CORS et permettre l'envoi d'un User-Agent.

export type OFFProduct = {
  code: string;
  name: string;
  brand: string | null;
  kcal_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  // Portion d'une unité (ex: 60g pour un yaourt, 100g pour un magnum). null si inconnu.
  serving_quantity: number | null;
  // Description libre de la portion (ex: "1 magnum (100g)", "30 g (1 portion)")
  serving_size: string | null;
  // Calories par portion si renseigné directement par OFF
  kcal_per_serving: number | null;
  // Quantité totale du paquet en texte libre ("316 g", "1 banane de 14 cm minimum", "4 Fruits")
  quantity_text: string | null;
  image_url: string | null;
};

/** Extrait un poids en grammes depuis un texte OFF (ex. "125 g", "1 portion (60g)", "0,5kg"). */
export function parseGramsFromText(text: string | null | undefined): number | null {
  if (!text) return null;
  const kg = text.match(/(\d+(?:[.,]\d+)?)\s*kg\b/i);
  if (kg) {
    const g = parseFloat(kg[1].replace(",", ".")) * 1000;
    return g > 0 && g <= 5000 ? Math.round(g) : null;
  }
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*g(?:\b|$)/i);
  if (!m) return null;
  const g = parseFloat(m[1].replace(",", "."));
  return g > 0 && g <= 5000 ? Math.round(g) : null;
}

/** Quantité paquet (ex. "500 g", "1 kg") — pas une portion à manger d'un coup */
function isLikelyPackageQuantity(quantityText: string | null, grams: number): boolean {
  if (!quantityText) return grams > 350;
  if (grams > 350) return true;
  return /\d+\s*x\s*\d|multipack|pack de|lot de|sachet|bouteille|bouteilles|\d+\s*(?:pots|paquets|bo[iî]tes)/i.test(
    quantityText,
  );
}

/** Portions moyennes — produits frais */
const FRESH_PORTIONS: { pattern: RegExp; grams: number }[] = [
  { pattern: /banan/i, grams: 120 },
  { pattern: /pomme(?!\s*de\s*terre)/i, grams: 150 },
  { pattern: /poire/i, grams: 130 },
  { pattern: /orange|mandarine|clémentine|clementine/i, grams: 130 },
  { pattern: /kiwi/i, grams: 75 },
  { pattern: /avocat/i, grams: 150 },
  { pattern: /tomate/i, grams: 120 },
  { pattern: /carotte/i, grams: 80 },
  { pattern: /œuf|oeuf/i, grams: 60 },
  { pattern: /yaourt|yogurt|yoghurt/i, grams: 125 },
  { pattern: /fromage blanc/i, grams: 100 },
  { pattern: /magnum/i, grams: 75 },
  { pattern: /pêche|peche/i, grams: 150 },
  { pattern: /abricot/i, grams: 35 },
  { pattern: /fraise/i, grams: 12 },
  { pattern: /pain|baguette|tartine/i, grams: 30 },
  { pattern: /poulet|dinde|canard/i, grams: 150 },
  { pattern: /boeuf|bœuf|steak|viande/i, grams: 150 },
  { pattern: /poisson|saumon|thon|cabillaud/i, grams: 150 },
  { pattern: /pizza/i, grams: 300 },
  { pattern: /pâtes|pates(?!\s*à)/i, grams: 200 },
  { pattern: /riz|couscous|quinoa/i, grams: 180 },
  { pattern: /lentille|haricot|pois chiche/i, grams: 150 },
  { pattern: /soupe|potage/i, grams: 300 },
  { pattern: /lait(?!.*concentr)/i, grams: 250 },
  { pattern: /fromage(?!.*blanc)/i, grams: 30 },
  { pattern: /beurre/i, grams: 10 },
  { pattern: /huile/i, grams: 10 },
  { pattern: /chocolat(?!.*chaud)/i, grams: 25 },
  { pattern: /biscuit|cookie|gâteau|gateau/i, grams: 30 },
  { pattern: /chips|crisp/i, grams: 30 },
  { pattern: /nutella|pâte à tartiner|tartiner/i, grams: 15 },
  { pattern: /confiture/i, grams: 20 },
  { pattern: /miel/i, grams: 15 },
  { pattern: /céréale|cereale/i, grams: 40 },
  { pattern: /barre (?:céréale|energie|protéine)/i, grams: 35 },
];

/** Aliments qu'on journalise volontairement « par 100 g » (sec / ingrédient) */
const PER_100G_REFERENCE = /farine|sucre glace|levure|maïzena|fecule|fécule|cacao en poudre|proteine en poudre|whey/i;

/** Portions moyennes — plats préparés / fast-food (OFF met souvent les kcal totales en « /100g ») */
const MEAL_PORTIONS: { pattern: RegExp; grams: number }[] = [
  { pattern: /fries.*medium|medium.*fries|frites.*moyenne|moyenne.*frit/i, grams: 153 },
  { pattern: /fries.*small|small.*fries|petite.*frit|frit.*petite/i, grams: 100 },
  { pattern: /fries.*large|large.*fries|grande.*frit|frit.*grande/i, grams: 180 },
  { pattern: /\bfries\b|\bfrites\b/i, grams: 150 },
  { pattern: /whopper|big\s*king|country\s*burger|king\s*burger|steakhouse/i, grams: 270 },
  { pattern: /burger|wrap|sandwich/i, grams: 250 },
  { pattern: /nugget/i, grams: 80 },
  { pattern: /salade|bowl/i, grams: 350 },
  { pattern: /\bdip\b|sauce/i, grams: 30 },
];

function parseServingQuantity(raw: unknown): number | null {
  if (typeof raw === "number" && raw > 0) return Math.round(raw);
  if (typeof raw === "string") {
    const n = parseFloat(raw.replace(",", "."));
    if (n > 0 && n <= 5000) return Math.round(n);
  }
  return null;
}

function portionFromName(name: string, quantityText: string | null): number | null {
  const text = `${name} ${quantityText ?? ""}`;
  for (const { pattern, grams } of [...MEAL_PORTIONS, ...FRESH_PORTIONS]) {
    if (pattern.test(text)) return grams;
  }
  return null;
}

/** OFF indique parfois les kcal totales d'un plat en « kcal/100g » (>300 pour un burger, etc.) */
export function kcalLikelyPerServing(p: OFFProduct): boolean {
  if (p.kcal_per_serving != null) return true;
  const k = p.kcal_per_100g;
  if (k == null) return false;
  if (k > 300 && /burger|whopper|fries|frites|nugget|wrap|menu|salade|bowl/i.test(p.name)) {
    return true;
  }
  return false;
}

/** kcal d'une portion de référence (OFF correct ou mal étiqueté) */
export function servingKcal(p: OFFProduct): number | null {
  if (p.kcal_per_serving != null) return p.kcal_per_serving;
  if (kcalLikelyPerServing(p) && p.kcal_per_100g != null) return p.kcal_per_100g;
  return null;
}

export type DefaultPortion = {
  grams: number;
  /** true → mode « unités » (1 pièce), false → mode grammes */
  preferUnit: boolean;
  /** true si la portion est estimée (pas fournie par OFF) */
  estimated: boolean;
};

/** Déduit une portion par défaut : OFF d'abord, puis parsing, puis heuristique nom. */
export function inferDefaultPortion(p: OFFProduct): DefaultPortion {
  if (p.serving_quantity && p.serving_quantity > 0) {
    return { grams: p.serving_quantity, preferUnit: true, estimated: false };
  }

  const fromServing = parseGramsFromText(p.serving_size);
  if (fromServing) {
    return { grams: fromServing, preferUnit: true, estimated: false };
  }

  if (p.kcal_per_serving != null && p.kcal_per_100g != null && p.kcal_per_100g > 0) {
    const g = Math.round((p.kcal_per_serving / p.kcal_per_100g) * 100);
    if (g > 0 && g <= 2000) {
      return { grams: g, preferUnit: true, estimated: false };
    }
  }

  // Heuristiques nom (avant quantity = souvent le poids du paquet)
  const heuristic = portionFromName(p.name, p.quantity_text);
  if (heuristic) {
    return { grams: heuristic, preferUnit: true, estimated: true };
  }

  // Plats préparés : kcal totales mal rangées en /100g
  if (kcalLikelyPerServing(p)) {
    return { grams: 250, preferUnit: true, estimated: true };
  }

  const fromQty = parseGramsFromText(p.quantity_text);
  if (fromQty && !isLikelyPackageQuantity(p.quantity_text, fromQty)) {
    return { grams: fromQty, preferUnit: fromQty <= 250, estimated: true };
  }

  // Dernier recours : 100 g seulement pour ingrédients secs ; sinon ~1 portion type assiette
  if (PER_100G_REFERENCE.test(p.name)) {
    return { grams: 100, preferUnit: false, estimated: false };
  }
  return { grams: 150, preferUnit: true, estimated: true };
}

/** Fusionne recherche + fiche produit (évite de perdre quantity/serving si l'enrichissement est incomplet) */
export function mergeOFFProducts(base: OFFProduct, enriched: OFFProduct | null): OFFProduct {
  if (!enriched) return base;
  return {
    ...enriched,
    name: enriched.name || base.name,
    brand: enriched.brand ?? base.brand,
    quantity_text: enriched.quantity_text || base.quantity_text,
    serving_size: enriched.serving_size || base.serving_size,
    serving_quantity: enriched.serving_quantity ?? base.serving_quantity,
    kcal_per_serving: enriched.kcal_per_serving ?? base.kcal_per_serving,
    kcal_per_100g: enriched.kcal_per_100g ?? base.kcal_per_100g,
    protein_per_100g: enriched.protein_per_100g ?? base.protein_per_100g,
    carbs_per_100g: enriched.carbs_per_100g ?? base.carbs_per_100g,
    fat_per_100g: enriched.fat_per_100g ?? base.fat_per_100g,
    image_url: enriched.image_url ?? base.image_url,
  };
}

/** Calcule kcal et macros pour une portion donnée (referenceGrams = poids d'1 portion de référence) */
export function computeNutrition(
  p: OFFProduct,
  totalGrams: number,
  referenceGrams: number,
): { kcal: number; protein: number; carbs: number; fat: number } {
  const fromPer100 = (per100: number | null | undefined) =>
    per100 != null ? (per100 * totalGrams) / 100 : 0;

  const sk = servingKcal(p);
  const kcal =
    sk != null && referenceGrams > 0
      ? Math.round(sk * (totalGrams / referenceGrams))
      : Math.round(fromPer100(p.kcal_per_100g));

  return {
    kcal,
    protein: Number(fromPer100(p.protein_per_100g).toFixed(1)),
    carbs: Number(fromPer100(p.carbs_per_100g).toFixed(1)),
    fat: Number(fromPer100(p.fat_per_100g).toFixed(1)),
  };
}

/** Libellé pour la liste de recherche */
export function formatProductNutritionLabel(p: OFFProduct): string {
  const portion = inferDefaultPortion(p);
  const sk = servingKcal(p);
  if (sk != null && portion.grams > 0 && portion.grams !== 100) {
    return `${Math.round(sk)} kcal · ~${portion.grams} g`;
  }
  if (portion.grams > 0 && portion.grams !== 100 && p.kcal_per_100g != null) {
    const est = Math.round((p.kcal_per_100g * portion.grams) / 100);
    return `${est} kcal · ~${portion.grams} g`;
  }
  if (p.kcal_per_100g != null) {
    return `${Math.round(p.kcal_per_100g)} kcal / 100g`;
  }
  return "kcal inconnues";
}

export const mapProduct = (p: Record<string, unknown>): OFFProduct => {
  const nut = (p.nutriments ?? {}) as Record<string, number | undefined>;
  // brands est `string` côté API v2 (barcode) et `string[]` côté search-a-licious
  const rawBrands = p.brands as string | string[] | undefined;
  const brand = Array.isArray(rawBrands) ? rawBrands[0] ?? null : rawBrands ?? null;
  const servingSizeText = (p.serving_size as string) || null;
  const sq =
    parseServingQuantity(p.serving_quantity) ?? parseGramsFromText(servingSizeText);
  const productQty =
    typeof p.product_quantity === "number"
      ? p.product_quantity
      : parseFloat(String(p.product_quantity ?? "").replace(",", "."));
  const productUnit = String(p.product_quantity_unit ?? "").toLowerCase();
  const quantityFromProduct =
    productQty > 0 && productUnit === "g" ? `${Math.round(productQty)} g` : null;
  return {
    code: String(p.code ?? ""),
    name: (p.product_name_fr as string) || (p.product_name as string) || "Sans nom",
    brand,
    kcal_per_100g: nut["energy-kcal_100g"] ?? null,
    protein_per_100g: nut.proteins_100g ?? null,
    carbs_per_100g: nut.carbohydrates_100g ?? null,
    fat_per_100g: nut.fat_100g ?? null,
    serving_quantity: sq,
    serving_size: servingSizeText,
    kcal_per_serving: nut["energy-kcal_serving"] ?? null,
    quantity_text: (p.quantity as string) || quantityFromProduct || null,
    image_url:
      (p.image_front_small_url as string) ||
      (p.image_small_url as string) ||
      (p.image_front_url as string) ||
      null,
  };
};

export async function searchFood(query: string): Promise<OFFProduct[]> {
  if (!query.trim()) return [];
  try {
    const r = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
    if (!r.ok) return [];
    return (await r.json()) as OFFProduct[];
  } catch {
    return [];
  }
}

export async function getByBarcode(barcode: string): Promise<OFFProduct | null> {
  try {
    const r = await fetch(`/api/food/barcode/${encodeURIComponent(barcode)}`);
    if (!r.ok) return null;
    const data = await r.json();
    return (data as OFFProduct | null) ?? null;
  } catch {
    return null;
  }
}
