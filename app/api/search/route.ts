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
    headers: { Accept: 'application/json' },
  });
  return res;
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const keyword = search.get('keyword') || '';
  const page = search.get('page') || '1';

  if (!keyword) {
    return NextResponse.json({ results: [], pagination: { currentPage: 1, hasNextPage: false, totalPages: 1 } }, { status: 400 });
  }

  const externalPath = `/search?keyword=${encodeURIComponent(keyword)}&page=${page}`;

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
    console.error('Search API error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
