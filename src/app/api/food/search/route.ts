import { NextResponse } from "next/server";
import { mapProduct, type OFFProduct } from "@/lib/openfoodfacts";

// On utilise search-a-licious (https://search.openfoodfacts.org), la nouvelle API
// de recherche d'Open Food Facts. L'ancien endpoint /cgi/search.pl est instable
// (retourne souvent « Page temporarily unavailable »).
const SEARCH_URL = "https://search.openfoodfacts.org/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json([]);

  const url = `${SEARCH_URL}?q=${encodeURIComponent(q)}&page_size=30&langs=fr`;

  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "ObjectifPrime/1.0 (web app)" },
      next: { revalidate: 60 },
    });
    if (!r.ok) return NextResponse.json([], { status: 502 });
    const data = (await r.json()) as { hits?: Record<string, unknown>[] };
    const products: OFFProduct[] = (data.hits ?? []).map(mapProduct);
    // On garde d'abord les produits avec calories renseignées
    products.sort((a, b) => {
      const aHas = a.kcal_per_100g != null ? 0 : 1;
      const bHas = b.kcal_per_100g != null ? 0 : 1;
      return aHas - bHas;
    });
    return NextResponse.json(products.slice(0, 20));
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
