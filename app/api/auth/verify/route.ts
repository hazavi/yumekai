import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

// Try Firebase Admin, fallback to REST API
async function getAdminSettings(): Promise<{ sitePassword?: string; sitePasswordVersion?: number } | null> {
  // Try Firebase Admin SDK first
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

    if (serviceAccount && databaseURL) {
      const { initializeApp, getApps, cert } = await import("firebase-admin/app");
      const { getDatabase } = await import("firebase-admin/database");

      if (getApps().length === 0) {
        const parsedServiceAccount = JSON.parse(serviceAccount);
        initializeApp({
          credential: cert(parsedServiceAccount),
          databaseURL,
        });
      }

      const db = getDatabase();
      const snapshot = await db.ref("adminSettings/public").once("value");
      return snapshot.val();
    }
  } catch (e) {
    console.error("Firebase Admin error:", e);
  }

  // Fallback to REST API (less secure but works without service account)
  try {
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (databaseURL) {
      const response = await fetch(`${databaseURL}/adminSettings/public.json`);
      if (response.ok) {
        return await response.json();
      }
    }
  } catch (e) {
    console.error("Firebase REST error:", e);
  }

  return null;
}

// Simple in-memory rate limiting (use Redis in production for distributed systems)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5; // 5 attempts per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= MAX_ATTEMPTS) {
    return true;
  }

  record.count++;
  return false;
}

// Generate secure session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Hash password for comparison (constant-time comparison)
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Pad to same length to prevent timing attacks
    const maxLen = Math.max(a.length, b.length);
    a = a.padEnd(maxLen, "\0");
    b = b.padEnd(maxLen, "\0");
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "unknown";

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Get password from Firebase (server-side)
    const settings = await getAdminSettings();
    if (!settings) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const sitePassword = settings?.sitePassword;
    const passwordVersion = settings?.sitePasswordVersion || 1;

    if (!sitePassword) {
      return NextResponse.json(
        { error: "Site password not configured" },
        { status: 500 }
      );
    }

    // Use constant-time comparison to prevent timing attacks
    if (!secureCompare(password, sitePassword)) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // Store session data (token hash + version) in a signed cookie
    const sessionData = JSON.stringify({
      token: sessionToken,
      version: passwordVersion,
      expiresAt,
    });

    // Create HMAC signature for the session
    const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || crypto.randomBytes(32).toString("hex");
    const signature = crypto
      .createHmac("sha256", secret)
      .update(sessionData)
      .digest("hex");

    const signedSession = `${Buffer.from(sessionData).toString("base64")}.${signature}`;

    // Set HttpOnly secure cookie
    const cookieStore = await cookies();
    cookieStore.set("yumekai_session", signedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
