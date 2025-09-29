import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      hasAniscraperUrl: !!process.env.ANISCRAPER_API_URL,
      aniscraperUrl: process.env.ANISCRAPER_API_URL ? 'SET' : 'NOT SET',
      hasPublicUrl: !!process.env.NEXT_PUBLIC_ANISCRAPER_API_URL,
      publicUrl: process.env.NEXT_PUBLIC_ANISCRAPER_API_URL ? 'SET' : 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
    };

    return NextResponse.json(envCheck);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Debug check failed' },
      { status: 500 }
    );
  }
}