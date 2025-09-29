import { NextRequest, NextResponse } from 'next/server';

const getApiUrl = () => {
  const url = process.env.ANISCRAPER_API_URL;
  if (!url) {
    console.error('ANISCRAPER_API_URL environment variable is not set');
    return null;
  }
  return url;
};

export const revalidate = 60; // ISR / caching hint

async function fetchExternal(path: string) {
  const BASE_URL = getApiUrl();
  
  if (!BASE_URL) {
    throw new Error('API configuration missing');
  }
  
  const res = await fetch(`${BASE_URL}${path}`, {
    // Force server-side fetch; Next will handle caching via revalidate export
    headers: { Accept: 'application/json' },
    // Disable next: { revalidate } here because we expose at route level
  });
  return res;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const search = req.nextUrl.searchParams;
  const ep = search.get('ep') || '';
  const resolvedParams = await params;

  const externalPath = ep ? `/watch/${resolvedParams.slug}?ep=${encodeURIComponent(ep)}` : `/watch/${resolvedParams.slug}`;

  try {
    const upstream = await fetchExternal(externalPath);

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream error', status: upstream.status }, { status: upstream.status });
    }

    const data = await upstream.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: 'Fetch failed', message: errorMessage }, { status: 500 });
  }
}
