"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface SettingsPageProps {
  username: string;
}

// SVG Icons as components
const Icons = {
  arrowLeft: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  ),
  user: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  at: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
      />
    </svg>
  ),
  edit: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  ),
  shield: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  mail: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  calendar: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  clock: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  logout: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  check: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  x: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  eye: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  eyeOff: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  ),
  camera: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  trash: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  upload: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
  key: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  ),
  userGroup: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  cog: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
};

// Import admin UIDs
import { ADMIN_UIDS } from "@/constants/config";

export function SettingsPage({ username }: SettingsPageProps) {
  const {
    user,
    userProfile,
    updateUsername,
    canChangeUsername,
    updateDisplayName,
    canChangeDisplayName,
    updateUserProfile,
    updateProfilePhoto,
    removeProfilePhoto,
    logout,
  } = useAuth();
  const router = useRouter();

  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin settings state
  const [newSitePassword, setNewSitePassword] = useState("");
  const [confirmSitePassword, setConfirmSitePassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const isAuthorized =
    user && userProfile?.username?.toLowerCase() === username.toLowerCase();

  // Check if current user is an admin
  const isAdmin = user && ADMIN_UIDS.includes(user.uid);

  useEffect(() => {
    if (userProfile) {
      setNewUsername(userProfile.username || "");
      setNewDisplayName(userProfile.displayName || "");
      setBio(userProfile.bio || "");
      setIsPublic(userProfile.isPublic);
    }
  }, [userProfile]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (userProfile && !isAuthorized) {
      router.push(`/user/${userProfile.username}`);
    }
  }, [user, userProfile, isAuthorized, router]);

  const usernameStatus = canChangeUsername();
  const displayNameStatus = canChangeDisplayName();

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || newUsername === userProfile?.username) return;

    setLoading("username");
    const result = await updateUsername(newUsername.trim());

    if (result.success) {
      showMessage("success", "Username updated successfully");
      setTimeout(
        () => router.push(`/user/${newUsername.trim()}/settings`),
        1500
      );
    } else {
      showMessage("error", result.error || "Failed to update username");
    }
    setLoading(null);
  };

  const handleDisplayNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim() || newDisplayName === userProfile?.displayName)
      return;

    setLoading("displayName");
    const result = await updateDisplayName(newDisplayName.trim());

    if (result.success) {
      showMessage("success", "Display name updated successfully");
    } else {
      showMessage("error", result.error || "Failed to update display name");
    }
    setLoading(null);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("profile");

    try {
      await updateUserProfile({ bio, isPublic });
      showMessage("success", "Profile updated successfully");
    } catch {
      showMessage("error", "Failed to update profile");
    }
    setLoading(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading("photo");
    const result = await updateProfilePhoto(file);

    if (result.success) {
      showMessage("success", "Profile photo updated successfully");
    } else {
      showMessage("error", result.error || "Failed to update profile photo");
    }
    setLoading(null);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setLoading("photo");
    const result = await removeProfilePhoto();

    if (result.success) {
      showMessage("success", "Profile photo removed");
    } else {
      showMessage("error", result.error || "Failed to remove profile photo");
    }
    setLoading(null);
  };

  // Admin: Change site password
  const handleChangeSitePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSitePassword.trim() || !user) return;

    if (newSitePassword !== confirmSitePassword) {
      showMessage("error", "Passwords do not match");
      return;
    }

    if (newSitePassword.length < 4) {
      showMessage("error", "Password must be at least 4 characters");
      return;
    }

    setLoading("sitePassword");
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-uid": user.uid,
        },
        body: JSON.stringify({
          action: "changePassword",
          newPassword: newSitePassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          "success",
          data.message || "Site password changed successfully"
        );
        setNewSitePassword("");
        setConfirmSitePassword("");
      } else {
        showMessage("error", data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing site password:", error);
      showMessage("error", "Failed to change site password");
    }
    setLoading(null);
  };

  // Admin: Logout all users
  const handleLogoutAllUsers = async () => {
    if (!user) return;

    if (
      !confirm(
        "Are you sure you want to log out all users? They will need to re-enter the site password."
      )
    ) {
      return;
    }

    setLoading("logoutAll");
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-uid": user.uid,
        },
        body: JSON.stringify({
          action: "logoutAll",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          "success",
          data.message || "All users have been logged out"
        );
      } else {
        showMessage("error", data.error || "Failed to logout users");
      }
    } catch (error) {
      console.error("Error logging out users:", error);
      showMessage("error", "Failed to logout all users");
    }
    setLoading(null);
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/10" />
        </div>
        <div className="container-padded py-12 max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-32 glass rounded-lg" />
            <div className="h-64 glass rounded-2xl" />
            <div className="h-48 glass rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-12">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-black to-blue-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.15),transparent_50%)]" />
      </div>

      <div className="container-padded max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/user/${userProfile.username}`}
            className="glass-soft p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            {Icons.arrowLeft}
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-white/40 mt-0.5">Manage your account</p>
          </div>
          {userProfile.photoURL ? (
            <Image
              src={userProfile.photoURL}
              alt=""
              width={44}
              height={44}
              className="rounded-full ring-2 ring-white/10"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500/50 to-blue-500/50 flex items-center justify-center text-white font-medium">
              {(userProfile.displayName || userProfile.username || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
        </div>

        {/* Toast Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl glass flex items-center gap-3 animate-fadeIn ${
              message.type === "success"
                ? "border-green-500/30 bg-green-500/10"
                : "border-red-500/30 bg-red-500/10"
            }`}
          >
            <span
              className={
                message.type === "success" ? "text-green-400" : "text-red-400"
              }
            >
              {message.type === "success" ? Icons.check : Icons.x}
            </span>
            <span
              className={`text-sm ${
                message.type === "success" ? "text-green-300" : "text-red-300"
              }`}
            >
              {message.text}
            </span>
          </div>
        )}

        {/* Profile Photo Section */}
        <section className="glass rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-white/60">{Icons.camera}</span>
            <h2 className="text-lg font-medium text-white">Profile Photo</h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Photo Preview */}
            <div className="relative group">
              {userProfile.photoURL ? (
                <Image
                  src={userProfile.photoURL}
                  alt="Profile photo"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover ring-2 ring-white/10"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/50 to-blue-500/50 flex items-center justify-center text-white text-3xl font-medium">
                  {(userProfile.displayName || userProfile.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              {/* Overlay on hover */}
              <div
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-white">{Icons.camera}</span>
              </div>
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading === "photo"}
                className="w-full py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-medium hover:bg-white/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading === "photo" ? (
                  "Uploading..."
                ) : (
                  <>
                    {Icons.upload}
                    Upload Photo
                  </>
                )}
              </button>

              {userProfile.photoURL && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={loading === "photo"}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {Icons.trash}
                  Remove Photo
                </button>
              )}

              <p className="text-xs text-white/30">
                JPEG, PNG, GIF, or WebP. Max 500KB.
              </p>
            </div>
          </div>
        </section>

        {/* Display Name Section */}
        <section className="glass rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-white/60">{Icons.user}</span>
            <h2 className="text-lg font-medium text-white">Display Name</h2>
          </div>

          <form onSubmit={handleDisplayNameChange} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-white/50">
                  Name shown on your profile
                </label>
                {!displayNameStatus.canChange && (
                  <span className="text-xs text-white/30 flex items-center gap-1.5">
                    {Icons.clock}
                    {displayNameStatus.daysRemaining}d remaining
                  </span>
                )}
              </div>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                disabled={
                  !displayNameStatus.canChange || loading === "displayName"
                }
                placeholder="Enter display name"
                maxLength={32}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-white/30 mt-2">2-32 characters</p>
            </div>

            <button
              type="submit"
              disabled={
                !displayNameStatus.canChange ||
                loading === "displayName" ||
                !newDisplayName.trim() ||
                newDisplayName === userProfile.displayName
              }
              className="w-full py-3 rounded-xl bg-white/10 border border-white/10 text-white font-medium hover:bg-white/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading === "displayName"
                ? "Updating..."
                : "Update Display Name"}
            </button>
          </form>
        </section>

        {/* Username Section */}
        <section className="glass rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-white/60">{Icons.at}</span>
            <h2 className="text-lg font-medium text-white">Username</h2>
          </div>

          <form onSubmit={handleUsernameChange} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-white/50">
                  Current:{" "}
                  <span className="text-white/70">@{userProfile.username}</span>
                </label>
                {!usernameStatus.canChange && (
                  <span className="text-xs text-white/30 flex items-center gap-1.5">
                    {Icons.clock}
                    {usernameStatus.daysRemaining}d remaining
                  </span>
                )}
              </div>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                disabled={!usernameStatus.canChange || loading === "username"}
                placeholder="Enter new username"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-white/30 mt-2">
                3-20 characters. Letters, numbers, underscores only.
              </p>
            </div>

            <button
              type="submit"
              disabled={
                !usernameStatus.canChange ||
                loading === "username" ||
                !newUsername.trim() ||
                newUsername === userProfile.username
              }
              className="w-full py-3 rounded-xl bg-white/10 border border-white/10 text-white font-medium hover:bg-white/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading === "username" ? "Updating..." : "Update Username"}
            </button>
          </form>
        </section>

        {/* Bio & Privacy Section */}
        <section className="glass rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-white/60">{Icons.edit}</span>
            <h2 className="text-lg font-medium text-white">Profile</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div>
              <label className="text-sm text-white/50 mb-2 block">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all resize-none"
              />
              <p className="text-xs text-white/30 mt-1 text-right">
                {bio.length}/500
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <span className="text-white/50">
                  {isPublic ? Icons.eye : Icons.eyeOff}
                </span>
                <div>
                  <p className="text-white text-sm font-medium">
                    Public Profile
                  </p>
                  <p className="text-xs text-white/40">
                    Others can view your lists and rankings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isPublic ? "bg-purple-500/60" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    isPublic ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading === "profile"}
              className="w-full py-3 rounded-xl bg-white/10 border border-white/10 text-white font-medium hover:bg-white/15 transition-all disabled:opacity-40"
            >
              {loading === "profile" ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        {/* Admin Settings Section - Only visible to admins */}
        {isAdmin && (
          <section className="glass rounded-2xl p-6 border border-amber-500/20">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-amber-500">{Icons.cog}</span>
              <h2 className="text-lg font-medium text-white">Admin Settings</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                Admin Only
              </span>
            </div>

            {/* Change Site Password */}
            <form
              onSubmit={handleChangeSitePassword}
              className="space-y-4 mb-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-white/60">{Icons.key}</span>
                <h3 className="text-sm font-medium text-white">
                  Change Site Password
                </h3>
              </div>

              <div className="relative">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  value={newSitePassword}
                  onChange={(e) => setNewSitePassword(e.target.value)}
                  placeholder="New site password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showAdminPassword ? Icons.eyeOff : Icons.eye}
                </button>
              </div>

              <input
                type={showAdminPassword ? "text" : "password"}
                value={confirmSitePassword}
                onChange={(e) => setConfirmSitePassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors"
              />

              <p className="text-xs text-white/40">
                Changing the site password will require all users to re-enter
                the new password.
              </p>

              <button
                type="submit"
                disabled={loading === "sitePassword" || !newSitePassword.trim()}
                className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-medium hover:cursor-pointer hover:bg-amber-500/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {Icons.key}
                {loading === "sitePassword"
                  ? "Changing..."
                  : "Change Site Password"}
              </button>
            </form>

            {/* Logout All Users */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-white/60">{Icons.userGroup}</span>
                <h3 className="text-sm font-medium text-white">
                  Session Management
                </h3>
              </div>

              <p className="text-xs text-white/40 mb-4">
                Force all users to re-authenticate by invalidating their site
                access sessions.
              </p>

              <button
                onClick={handleLogoutAllUsers}
                disabled={loading === "logoutAll"}
                className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:cursor-pointer hover:bg-red-500/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {Icons.logout}
                {loading === "logoutAll"
                  ? "Logging out..."
                  : "Logout All Users"}
              </button>
            </div>
          </section>
        )}

        {/* Account Info Section */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-white/60">{Icons.shield}</span>
            <h2 className="text-lg font-medium text-white">Account</h2>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <span className="text-white/40">{Icons.mail}</span>
              <div>
                <p className="text-xs text-white/40">Email</p>
                <p className="text-sm text-white/80">
                  {userProfile.email || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <span className="text-white/40">{Icons.calendar}</span>
              <div>
                <p className="text-xs text-white/40">Member since</p>
                <p className="text-sm text-white/80">
                  {new Date(userProfile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            {Icons.logout}
            Sign Out
          </button>
        </section>
      </div>
    </div>
  );
}
