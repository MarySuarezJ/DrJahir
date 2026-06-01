import { NextResponse } from "next/server";

const SOURCE_URL =
  "https://raw.githubusercontent.com/caticoa3/colombia_mapa/master/co_2018_MGN_MPIO_POLITICO.geojson";

let cache: unknown = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 24 * 1000; // 24 hours

export async function GET() {
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return NextResponse.json(cache);
  }

  try {
    const res = await fetch(SOURCE_URL, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const full = await res.json();

    const features = (full.features as Array<{ properties: { DPTO_CCDGO: string } }>).filter(
      (f) => f.properties.DPTO_CCDGO === "17"
    );

    const result = { type: "FeatureCollection", features };
    cache = result;
    cacheTime = Date.now();

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
