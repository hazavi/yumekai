import { NextRequest, NextResponse } from 'next/server';

const getApiUrl = () => {
  const url = process.env.ANISCRAPER_API_URL;
  if (!url) {
    console.error('ANISCRAPER_API_URL environment variable is not set');
    return null;
  }
  return url;
};

export const revalidate = 300; // 5 minutes for schedule data

export async function GET(request: NextRequest) {
  const BASE_URL = getApiUrl();
  
  if (!BASE_URL) {
    console.error('Schedule API: Missing environment configuration');
    return NextResponse.json(
      { 
        error: 'API configuration missing',
        details: 'ANISCRAPER_API_URL environment variable not set',
      },
      { status: 500 }
    );
  }

  // Set up timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const url = `${BASE_URL}/schedule${query}`;
    
    const response = await fetch(url, {
      next: { revalidate: 300 },
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch schedule data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      );
    }
    
    console.error('Schedule API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}