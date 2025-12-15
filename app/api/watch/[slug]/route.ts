import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.ANISCRAPER_API_URL;
const TIMEOUT_MS = 10000; // 10 second timeout for watch data

export const revalidate = 120; // Cache for 2 minutes

async function fetchExternal(path: string, signal: AbortSignal) {
  if (!API_URL) {
    throw new Error('API configuration missing');
  }
  
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  return res;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const search = req.nextUrl.searchParams;
  const ep = search.get('ep') || '';
  const resolvedParams = await params;

  const externalPath = ep 
    ? `/watch/${resolvedParams.slug}?ep=${encodeURIComponent(ep)}` 
    : `/watch/${resolvedParams.slug}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetchExternal(externalPath, controller.signal);
    clearTimeout(timeoutId);

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Upstream error', status: upstream.status }, 
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
      }
    });
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    
    if (e instanceof Error && e.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' }, 
        { status: 504 }
      );
    }
    
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Fetch failed', message: errorMessage }, 
      { status: 500 }
    );
  }
}
