import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://aniscraper-eta.vercel.app';

export async function GET(request: NextRequest) {
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