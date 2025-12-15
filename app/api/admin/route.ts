import { NextRequest, NextResponse } from 'next/server';
import { ref, set, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { ADMIN_UIDS } from '@/constants/config';

// Helper to check if user is admin
function isAdmin(uid: string): boolean {
  return ADMIN_UIDS.includes(uid);
}

// GET - Get admin settings (site password version, etc.)
export async function GET(req: NextRequest) {
  const uid = req.headers.get('x-user-uid');
  
  if (!uid || !isAdmin(uid)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!database) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const settingsRef = ref(database, 'adminSettings/private');
    const snapshot = await get(settingsRef);
    
    const settings = snapshot.exists() ? snapshot.val() : {
      sitePasswordVersion: 1,
      lastPasswordChange: null,
      lastLogoutAll: null,
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST - Update admin settings
export async function POST(req: NextRequest) {
  const uid = req.headers.get('x-user-uid');
  
  console.log('[Admin API] POST request received');
  console.log('[Admin API] UID from header:', uid);
  console.log('[Admin API] ADMIN_UIDS:', ADMIN_UIDS);
  console.log('[Admin API] Is admin?:', uid ? isAdmin(uid) : false);
  
  if (!uid || !isAdmin(uid)) {
    console.log('[Admin API] Unauthorized - UID not in ADMIN_UIDS');
    return NextResponse.json({ error: 'Unauthorized', receivedUid: uid, adminUids: ADMIN_UIDS }, { status: 401 });
  }

  if (!database) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { action, newPassword } = body;

    // Get current settings from private path
    const privateRef = ref(database, 'adminSettings/private');
    const publicRef = ref(database, 'adminSettings/public');
    
    const snapshot = await get(privateRef);
    const currentSettings = snapshot.exists() ? snapshot.val() : {
      sitePasswordVersion: 1,
      lastPasswordChange: null,
      lastLogoutAll: null,
    };

    if (action === 'changePassword') {
      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
      }

      // Increment password version to invalidate all sessions
      const newVersion = (currentSettings.sitePasswordVersion || 1) + 1;
      
      // Store sensitive data in private path (admin only)
      await set(privateRef, {
        ...currentSettings,
        sitePasswordVersion: newVersion,
        sitePassword: newPassword,
        lastPasswordChange: Date.now(),
        lastPasswordChangeBy: uid,
      });

      // Store public data (readable by all for site lock check)
      await set(publicRef, {
        sitePasswordVersion: newVersion,
        sitePassword: newPassword,
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Password changed successfully. All users will need to re-enter the new password.',
        newVersion,
      });
    }

    if (action === 'logoutAll') {
      // Increment password version to invalidate all sessions
      const newVersion = (currentSettings.sitePasswordVersion || 1) + 1;
      
      // Update private settings
      await set(privateRef, {
        ...currentSettings,
        sitePasswordVersion: newVersion,
        lastLogoutAll: Date.now(),
        lastLogoutAllBy: uid,
      });

      // Update public settings (just the version)
      const publicSnapshot = await get(publicRef);
      const publicSettings = publicSnapshot.exists() ? publicSnapshot.val() : {};
      await set(publicRef, {
        ...publicSettings,
        sitePasswordVersion: newVersion,
      });

      return NextResponse.json({ 
        success: true, 
        message: 'All users have been logged out. They will need to re-enter the site password.',
        newVersion,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to update settings', 
      details: errorMessage,
      hint: 'Check Firebase database rules - adminSettings/public and adminSettings/private need write permissions for admins'
    }, { status: 500 });
  }
}
