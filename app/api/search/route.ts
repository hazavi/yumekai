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
export const dynamic = 'force-dynamic'; // Ensure fresh data for search

async function fetchExternal(path: string, signal?: AbortSignal) {
  const BASE_URL = getApiUrl();
  
  if (!BASE_URL) {
    throw new Error('API configuration missing');
  }
  
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  return res;
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const keyword = search.get('keyword') || '';
  const page = search.get('page') || '1';

  if (!keyword) {
    return NextResponse.json(
      { results: [], pagination: { currentPage: 1, hasNextPage: false, totalPages: 1 } }, 
      { 
        status: 400,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }

  const externalPath = `/search?keyword=${encodeURIComponent(keyword)}&page=${page}`;

  // Set up timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

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
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    
    // Return cached error response quickly
    if (e instanceof Error && e.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout', results: [] }, 
        { status: 504 }
      );
    }
    
    console.error('Search API error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
