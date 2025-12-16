import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_ANISCRAPER_API_URL || process.env.ANISCRAPER_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ animeId: string }> }
) {
  const { animeId } = await params;

  if (!animeId) {
    return NextResponse.json(
      { error: "Anime ID is required" },
      { status: 400 }
    );
  }

  if (!API_URL) {
    return NextResponse.json(
      { error: "API URL not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/qtip/${encodeURIComponent(animeId)}`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch qtip data: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching qtip data:", error);
    return NextResponse.json(
      { error: "Failed to fetch qtip data" },
      { status: 500 }
    );
  }
}
