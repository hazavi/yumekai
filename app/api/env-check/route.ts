import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env_check: {
      ANISCRAPER_API_URL: process.env.ANISCRAPER_API_URL ? 'SET' : 'NOT_SET',
      NEXT_PUBLIC_ANISCRAPER_API_URL: process.env.NEXT_PUBLIC_ANISCRAPER_API_URL ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV,
    }
  });
}