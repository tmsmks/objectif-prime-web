import { NextResponse } from "next/server";
import { mapProduct } from "@/lib/openfoodfacts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  if (!code) return NextResponse.json(null, { status: 400 });

  try {
    const r = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`,
      {
        headers: { "User-Agent": "ObjectifPrime/1.0 (web app)" },
        next: { revalidate: 3600 },
      },
    );
    if (!r.ok) return NextResponse.json(null, { status: 502 });
    const data = (await r.json()) as { status?: number; product?: Record<string, unknown> };
    if (data.status !== 1 || !data.product) return NextResponse.json(null);
    return NextResponse.json(mapProduct(data.product));
  } catch {
    return NextResponse.json(null, { status: 502 });
  }
}
