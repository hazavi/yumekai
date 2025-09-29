import { NextRequest, NextResponse } from 'next/server';

const getApiUrl = () => {
  const url = process.env.ANISCRAPER_API_URL;
  if (!url) {
    console.error('ANISCRAPER_API_URL environment variable is not set');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('API')));
    return null;
  }
  return url;
};

export async function GET(request: NextRequest) {
  const BASE_URL = getApiUrl();
  
  if (!BASE_URL) {
    console.error('Schedule API: Missing environment configuration');
    return NextResponse.json(
      { 
        error: 'API configuration missing',
        details: 'ANISCRAPER_API_URL environment variable not set',
        help: 'Check Vercel environment variables configuration'
      },
      { status: 500 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const url = `${BASE_URL}/schedule${query}`;
    
    console.log('Proxying schedule request to:', url);
    
    const response = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch schedule data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Schedule API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}