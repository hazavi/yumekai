import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.ANISCRAPER_API_URL;

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const keyword = search.get('keyword') || '';
  const page = search.get('page') || '1';

  if (!keyword) {
    return NextResponse.json(
      { results: [], pagination: { currentPage: 1, hasNextPage: false, totalPages: 1 } }, 
      { 
        status: 200, // Return 200 with empty results, not 400
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  }

  if (!API_URL) {
    return NextResponse.json(
      { error: 'API configuration missing', results: [] },
      { status: 500 }
    );
  }

  const externalPath = `/search?keyword=${encodeURIComponent(keyword)}&page=${page}`;

  // Set up timeout - 12s (slightly less than client's 15s to ensure server responds first)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const upstream = await fetch(`${API_URL}${externalPath}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Upstream error', results: [], status: upstream.status }, 
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    
    if (e instanceof Error && e.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout', results: [] }, 
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Search failed', results: [] }, 
      { status: 500 }
    );
  }
}
