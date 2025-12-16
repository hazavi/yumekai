import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

// Try Firebase Admin, fallback to REST API
async function getCurrentPasswordVersion(): Promise<number> {
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
      const snapshot = await db.ref("adminSettings/public/sitePasswordVersion").once("value");
      return snapshot.val() || 1;
    }
  } catch (e) {
    console.error("Firebase Admin error:", e);
  }

  // Fallback to REST API
  try {
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (databaseURL) {
      const response = await fetch(`${databaseURL}/adminSettings/public/sitePasswordVersion.json`);
      if (response.ok) {
        const version = await response.json();
        return version || 1;
      }
    }
  } catch (e) {
    console.error("Firebase REST error:", e);
  }

  return 1;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("yumekai_session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false });
    }

    // Parse and verify signed session
    const [encodedData, signature] = sessionCookie.value.split(".");
    if (!encodedData || !signature) {
      return NextResponse.json({ authenticated: false });
    }

    const sessionData = Buffer.from(encodedData, "base64").toString();
    const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || "";

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(sessionData)
      .digest("hex");

    // Use timing-safe comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      // Invalid signature - possible tampering
      return NextResponse.json({ authenticated: false });
    }

    const session = JSON.parse(sessionData);

    // Check expiration
    if (Date.now() > session.expiresAt) {
      return NextResponse.json({ authenticated: false });
    }

    // Check password version against current version
    const currentVersion = await getCurrentPasswordVersion();
    if (session.version < currentVersion) {
      // Password was changed, invalidate session
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false });
  }
}
