'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface UserMenuProps {
  onLoginClick?: () => void;
}

export function UserMenu({ onLoginClick }: UserMenuProps) {
  const { user, userProfile, loading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
    );
  }

  if (!user) {
    return onLoginClick ? (
      <button
        onClick={onLoginClick}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-lg shadow-purple-500/25"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <span className="hidden sm:inline">Sign In</span>
      </button>
    ) : null;
  }

  const displayName = userProfile?.displayName || user.displayName || 'User';
  const photoURL = user.photoURL;
  const username = userProfile?.username || user.uid.slice(0, 8);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-all duration-200"
      >
        {photoURL ? (
          <Image
            src={photoURL}
            alt={displayName}
            width={40}
            height={40}
            className="rounded-full border-2 border-purple-500/50"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          {/* User Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {photoURL ? (
                <Image
                  src={photoURL}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{displayName}</p>
                <p className="text-sm text-white/50 truncate">@{username}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href={`/user/${username}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>
            <Link
              href={`/user/${username}/lists`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Lists
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </div>

          {/* Logout */}
          <div className="p-2 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
