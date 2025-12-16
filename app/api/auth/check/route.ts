import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

// Cache password version for 5 minutes to avoid hitting Firebase on every request
let cachedPasswordVersion: { version: number; timestamp: number } | null = null;
const VERSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Try Firebase Admin, fallback to REST API (with caching)
async function getCurrentPasswordVersion(): Promise<number> {
  // Return cached version if still valid
  if (cachedPasswordVersion && Date.now() - cachedPasswordVersion.timestamp < VERSION_CACHE_TTL) {
    return cachedPasswordVersion.version;
  }

  let version = 1;

  // Try Firebase Admin SDK first
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

    if (serviceAccount && databaseURL) {
      // Validate JSON before parsing
      let parsedServiceAccount;
      try {
        parsedServiceAccount = JSON.parse(serviceAccount);
      } catch (parseError) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", parseError);
        console.error("First 50 chars:", serviceAccount.substring(0, 50));
        throw parseError;
      }

      const { initializeApp, getApps, cert } = await import("firebase-admin/app");
      const { getDatabase } = await import("firebase-admin/database");

      if (getApps().length === 0) {
        initializeApp({
          credential: cert(parsedServiceAccount),
          databaseURL,
        });
      }

      const db = getDatabase();
      const snapshot = await db.ref("adminSettings/public/sitePasswordVersion").once("value");
      version = snapshot.val() || 1;
      cachedPasswordVersion = { version, timestamp: Date.now() };
      return version;
    }
  } catch (e) {
    console.error("Firebase Admin error:", e);
  }

  // Fallback to REST API
  try {
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (databaseURL) {
      const response = await fetch(`${databaseURL}/adminSettings/public/sitePasswordVersion.json`, {
        next: { revalidate: 300 }, // Cache for 5 minutes
      });
      if (response.ok) {
        version = (await response.json()) || 1;
        cachedPasswordVersion = { version, timestamp: Date.now() };
        return version;
      }
    }
  } catch (e) {
    console.error("Firebase REST error:", e);
  }

  return version;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("yumekai_session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false }, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    // Parse and verify signed session
    const [encodedData, signature] = sessionCookie.value.split(".");
    if (!encodedData || !signature) {
      return NextResponse.json({ authenticated: false }, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const sessionData = Buffer.from(encodedData, "base64").toString();
    const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || "";

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(sessionData)
      .digest("hex");

    // Use timing-safe comparison (must be same length)
    if (signature.length !== expectedSignature.length || 
        !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return NextResponse.json({ authenticated: false }, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const session = JSON.parse(sessionData);

    // Check expiration
    if (Date.now() > session.expiresAt) {
      return NextResponse.json({ authenticated: false }, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    // Check password version against current version (cached)
    const currentVersion = await getCurrentPasswordVersion();
    if (session.version < currentVersion) {
      return NextResponse.json({ authenticated: false }, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    // Return authenticated with short cache to reduce API calls
    return NextResponse.json({ authenticated: true }, {
      headers: { 'Cache-Control': 'private, max-age=60' },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
