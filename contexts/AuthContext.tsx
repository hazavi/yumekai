"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { ref, set, get, update, remove } from "firebase/database";
import {
  auth,
  database,
  googleProvider,
  isFirebaseConfigured,
} from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username: string | null;
  bio: string | null;
  createdAt: number;
  isPublic: boolean;
  lastUsernameChange?: number;
  lastDisplayNameChange?: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUsername: (
    newUsername: string
  ) => Promise<{ success: boolean; error?: string }>;
  canChangeUsername: () => { canChange: boolean; daysRemaining?: number };
  updateDisplayName: (
    newDisplayName: string
  ) => Promise<{ success: boolean; error?: string }>;
  canChangeDisplayName: () => { canChange: boolean; daysRemaining?: number };
  updateProfilePhoto: (
    file: File
  ) => Promise<{ success: boolean; error?: string }>;
  removeProfilePhoto: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if username is available
  const isUsernameAvailable = async (username: string): Promise<boolean> => {
    if (!database) return false;
    const usernameRef = ref(database, `usernames/${username.toLowerCase()}`);
    const snapshot = await get(usernameRef);
    return !snapshot.exists();
  };

  // Generate unique username
  const generateUniqueUsername = async (base: string): Promise<string> => {
    let username = base;
    let counter = 1;
    while (!(await isUsernameAvailable(username))) {
      username = `${base}${counter}`;
      counter++;
    }
    return username;
  };

  // Create or update user profile in database
  const createOrUpdateUserProfile = async (
    firebaseUser: User,
    additionalData?: Partial<UserProfile>
  ) => {
    if (!database) return;

    const userRef = ref(database, `users/${firebaseUser.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      // Generate unique username
      const baseUsername =
        firebaseUser.displayName?.toLowerCase().replace(/[^a-z0-9_]/g, "_") ||
        `user_${firebaseUser.uid.slice(0, 8)}`;
      const username = await generateUniqueUsername(baseUsername);

      // Create new user profile
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName:
          firebaseUser.displayName || additionalData?.displayName || null,
        photoURL: firebaseUser.photoURL,
        username,
        bio: null,
        createdAt: Date.now(),
        isPublic: true,
        lastUsernameChange: 0, // Allow immediate change for new users
        ...additionalData,
      };

      // Create user and username index atomically
      await set(userRef, newProfile);
      await set(
        ref(database, `usernames/${username.toLowerCase()}`),
        firebaseUser.uid
      );
      setUserProfile(newProfile);
    } else {
      // Update existing profile - PRESERVE custom displayName and photoURL
      const existingProfile = snapshot.val() as UserProfile;
      const updatedProfile = {
        ...existingProfile,
        email: firebaseUser.email,
        // Only use Google values if user hasn't set custom ones
        // Keep existing displayName and photoURL (user's custom values)
        ...additionalData,
      };
      await update(userRef, updatedProfile);
      setUserProfile(updatedProfile);
    }
  };

  // Fetch user profile from database and ensure username index exists
  const fetchUserProfile = async (uid: string, firebaseUser?: User | null) => {
    if (!database) return;

    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const profile = snapshot.val() as UserProfile;

      // Ensure username index exists for existing users
      if (profile.username) {
        const usernameRef = ref(
          database,
          `usernames/${profile.username.toLowerCase()}`
        );
        const usernameSnapshot = await get(usernameRef);
        if (!usernameSnapshot.exists()) {
          // Create the username index entry
          await set(usernameRef, uid);
        }
      }

      setUserProfile(profile);
    } else if (firebaseUser) {
      // Profile doesn't exist, create one for this authenticated user
      const baseUsername =
        firebaseUser.displayName?.toLowerCase().replace(/[^a-z0-9_]/g, "_") ||
        `user_${uid.slice(0, 8)}`;
      const username = await generateUniqueUsername(baseUsername);

      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || null,
        photoURL: firebaseUser.photoURL,
        username,
        bio: null,
        createdAt: Date.now(),
        isPublic: true,
        lastUsernameChange: 0,
      };

      await set(userRef, newProfile);
      await set(ref(database, `usernames/${username.toLowerCase()}`), uid);
      setUserProfile(newProfile);
    }
  };

  useEffect(() => {
    // If Firebase is not configured, just set loading to false
    if (!isFirebaseConfigured() || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid, firebaseUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not configured");
    const result = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserProfile(result.user.uid, result.user);
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    if (!auth) throw new Error("Firebase not configured");
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await createOrUpdateUserProfile(result.user, { displayName });
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) throw new Error("Firebase not configured");
    const result = await signInWithPopup(auth, googleProvider);
    await createOrUpdateUserProfile(result.user);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase not configured");
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !database) return;
    const userRef = ref(database, `users/${user.uid}`);
    await update(userRef, data);
    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  // Check if user can change username (30 day cooldown)
  const canChangeUsername = () => {
    if (!userProfile) return { canChange: false };

    const lastChange = userProfile.lastUsernameChange || 0;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const timeSinceChange = Date.now() - lastChange;

    if (timeSinceChange >= thirtyDaysMs) {
      return { canChange: true };
    }

    const daysRemaining = Math.ceil(
      (thirtyDaysMs - timeSinceChange) / (24 * 60 * 60 * 1000)
    );
    return { canChange: false, daysRemaining };
  };

  // Update username with validation
  const updateUsername = async (
    newUsername: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !database || !userProfile) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(newUsername)) {
      return {
        success: false,
        error:
          "Username must be 3-20 characters and contain only letters, numbers, and underscores",
      };
    }

    // Check cooldown
    const { canChange, daysRemaining } = canChangeUsername();
    if (!canChange) {
      return {
        success: false,
        error: `You can change your username again in ${daysRemaining} days`,
      };
    }

    // Check availability
    const available = await isUsernameAvailable(newUsername);
    if (
      !available &&
      newUsername.toLowerCase() !== userProfile.username?.toLowerCase()
    ) {
      return { success: false, error: "Username is already taken" };
    }

    try {
      const oldUsername = userProfile.username;

      // Remove old username from index
      if (oldUsername) {
        await remove(ref(database, `usernames/${oldUsername.toLowerCase()}`));
      }

      // Add new username to index
      await set(
        ref(database, `usernames/${newUsername.toLowerCase()}`),
        user.uid
      );

      // Update user profile
      const updateData = {
        username: newUsername,
        lastUsernameChange: Date.now(),
      };
      await update(ref(database, `users/${user.uid}`), updateData);
      setUserProfile((prev) => (prev ? { ...prev, ...updateData } : null));

      return { success: true };
    } catch (error) {
      console.error("Error updating username:", error);
      return { success: false, error: "Failed to update username" };
    }
  };

  // Check if user can change display name (5 day cooldown)
  const canChangeDisplayName = () => {
    if (!userProfile) return { canChange: false };

    const lastChange = userProfile.lastDisplayNameChange || 0;
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    const timeSinceChange = Date.now() - lastChange;

    if (timeSinceChange >= fiveDaysMs) {
      return { canChange: true };
    }

    const daysRemaining = Math.ceil(
      (fiveDaysMs - timeSinceChange) / (24 * 60 * 60 * 1000)
    );
    return { canChange: false, daysRemaining };
  };

  // Update display name with validation
  const updateDisplayName = async (
    newDisplayName: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !database || !userProfile) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate display name
    const trimmedName = newDisplayName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 32) {
      return { success: false, error: "Display name must be 2-32 characters" };
    }

    // Check cooldown
    const { canChange, daysRemaining } = canChangeDisplayName();
    if (!canChange) {
      return {
        success: false,
        error: `You can change your display name again in ${daysRemaining} days`,
      };
    }

    try {
      const updateData = {
        displayName: trimmedName,
        lastDisplayNameChange: Date.now(),
      };
      await update(ref(database, `users/${user.uid}`), updateData);
      setUserProfile((prev) => (prev ? { ...prev, ...updateData } : null));

      return { success: true };
    } catch (error) {
      console.error("Error updating display name:", error);
      return { success: false, error: "Failed to update display name" };
    }
  };

  // Update profile photo - stores as base64 in database
  const updateProfilePhoto = async (
    file: File
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !database) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Please upload a valid image (JPEG, PNG, GIF, or WebP)",
      };
    }

    // Validate file size (max 500KB for base64 storage)
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: "Image must be less than 500KB" };
    }

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Update user profile in database
      await update(ref(database, `users/${user.uid}`), { photoURL: base64 });
      setUserProfile((prev) => (prev ? { ...prev, photoURL: base64 } : null));

      return { success: true };
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload profile photo";
      return { success: false, error: errorMessage };
    }
  };

  // Remove profile photo
  const removeProfilePhoto = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!user || !database) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      // Update user profile to remove photo URL
      await update(ref(database, `users/${user.uid}`), { photoURL: null });
      setUserProfile((prev) => (prev ? { ...prev, photoURL: null } : null));

      return { success: true };
    } catch (error) {
      console.error("Error removing profile photo:", error);
      return { success: false, error: "Failed to remove profile photo" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        resetPassword,
        updateUserProfile,
        updateUsername,
        canChangeUsername,
        updateDisplayName,
        canChangeDisplayName,
        updateProfilePhoto,
        removeProfilePhoto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
