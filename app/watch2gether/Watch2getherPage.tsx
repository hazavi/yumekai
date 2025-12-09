"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts";
import { ref, onValue, push, set, get } from "firebase/database";
import { database } from "@/lib/firebase";
import type { RoomPreview, Watch2getherRoom } from "@/types";

export function Watch2getherPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [rooms, setRooms] = useState<RoomPreview[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomPreview | null>(null);
  const [roomPassword, setRoomPassword] = useState("");
  const [error, setError] = useState("");

  // Create room form state
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [creating, setCreating] = useState(false);

  // Fetch public rooms
  useEffect(() => {
    if (!database) {
      setLoadingRooms(false);
      return;
    }

    const roomsRef = ref(database, "watch2gether/rooms");
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomList: RoomPreview[] = Object.entries(data)
          .map(([id, room]: [string, unknown]) => {
            const r = room as Watch2getherRoom;
            const participantCount = r.participants
              ? Object.keys(r.participants).length
              : 0;
            return {
              id,
              name: r.name,
              hostName: r.hostName,
              participantCount,
              maxParticipants: r.maxParticipants,
              isPrivate: r.isPrivate,
              anime: r.anime
                ? {
                    title: r.anime.title,
                    poster: r.anime.poster,
                    currentEpisode: r.anime.currentEpisode,
                  }
                : null,
              createdAt: r.createdAt,
            };
          })
          .filter((r) => r.participantCount < r.maxParticipants)
          .sort((a, b) => b.createdAt - a.createdAt);
        setRooms(roomList);
      } else {
        setRooms([]);
      }
      setLoadingRooms(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateRoom = async () => {
    if (!user || !userProfile || !database) return;
    if (!roomName.trim()) {
      setError("Room name is required");
      return;
    }
    if (isPrivate && !password.trim()) {
      setError("Password is required for private rooms");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const roomsRef = ref(database, "watch2gether/rooms");
      const newRoomRef = push(roomsRef);
      const roomId = newRoomRef.key;

      // Build room object without undefined values (Firebase doesn't accept undefined)
      const newRoom: Record<string, unknown> = {
        id: roomId!,
        name: roomName.trim(),
        hostId: user.uid,
        hostName: userProfile.displayName || "Anonymous",
        createdAt: Date.now(),
        isPrivate,
        maxParticipants,
        anime: null,
        videoState: {
          currentTime: 0,
          isPlaying: false,
          lastUpdated: Date.now(),
          updatedBy: user.uid,
        },
        participants: {
          [user.uid]: {
            odometer: user.uid,
            odometer_2: user.uid,
            displayName: userProfile.displayName || "Anonymous",
            photoURL: userProfile.photoURL || null,
            joinedAt: Date.now(),
            isHost: true,
          },
        },
        messages: {},
      };

      // Only add password if room is private
      if (isPrivate && password) {
        newRoom.password = password;
      }

      await set(newRoomRef, newRoom);
      router.push(`/watch2gether/${roomId}`);
    } catch (err) {
      console.error("Error creating room:", err);
      setError("Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async (room: RoomPreview) => {
    if (!user || !userProfile) {
      router.push("/login");
      return;
    }

    if (room.isPrivate) {
      setSelectedRoom(room);
      setShowJoinModal(true);
      return;
    }

    await joinRoom(room.id);
  };

  const joinRoom = async (roomId: string, pwd?: string) => {
    if (!user || !userProfile || !database) return;

    try {
      // Check password if private
      if (pwd !== undefined) {
        const roomRef = ref(database, `watch2gether/rooms/${roomId}`);
        const snapshot = await get(roomRef);
        if (snapshot.exists()) {
          const roomData = snapshot.val() as Watch2getherRoom;
          if (roomData.isPrivate && roomData.password !== pwd) {
            setError("Incorrect password");
            return;
          }
        }
      }

      // Add participant
      const participantRef = ref(
        database,
        `watch2gether/rooms/${roomId}/participants/${user.uid}`
      );
      await set(participantRef, {
        odometer: user.uid,
        odometer_2: user.uid,
        displayName: userProfile.displayName || "Anonymous",
        photoURL: userProfile.photoURL || null,
        joinedAt: Date.now(),
        isHost: false,
      });

      router.push(`/watch2gether/${roomId}`);
    } catch (err) {
      console.error("Error joining room:", err);
      setError("Failed to join room");
    }
  };

  const handlePasswordSubmit = async () => {
    if (!selectedRoom) return;
    await joinRoom(selectedRoom.id, roomPassword);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <svg
                className="w-8 h-8 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Watch2gether
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Watch anime together with friends in real-time
            </p>
          </div>
          {user ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Room
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
            >
              Sign in to Create Room
            </Link>
          )}
        </div>

        {/* Rooms Grid */}
        {loadingRooms ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-24 bg-white/10 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-white/10 rounded w-1/2 mb-3" />
                    <div className="h-3 bg-white/10 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 text-white/20 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              No active rooms
            </h3>
            <p className="text-white/50 mb-6">
              Be the first to create a watch party!
            </p>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Room
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors group"
              >
                <div className="flex gap-3">
                  {/* Anime Poster or Placeholder */}
                  <div className="w-16 h-24 bg-white/10 rounded-sm overflow-hidden flex-shrink-0">
                    {room.anime ? (
                      <Image
                        src={room.anime.poster}
                        alt={room.anime.title}
                        width={64}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white/20"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Room Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white truncate">
                        {room.name}
                      </h3>
                      {room.isPrivate && (
                        <svg
                          className="w-4 h-4 text-yellow-400 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 1C8.676 1 6 3.676 6 7v2H4a1 1 0 00-1 1v12a1 1 0 001 1h16a1 1 0 001-1V10a1 1 0 00-1-1h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-white/50 text-sm">
                      Host: {room.hostName}
                    </p>
                    {room.anime && (
                      <p className="text-purple-400 text-xs mt-1 truncate">
                        {room.anime.title} - Ep {room.anime.currentEpisode}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      {room.participantCount}/{room.maxParticipants}
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => handleJoinRoom(room)}
                  className="w-full mt-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 font-medium rounded-lg transition-colors text-sm cursor-pointer"
                >
                  Join Room
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              Create Watch Party
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="My Watch Party"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Max Participants
                </label>
                <select
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                >
                  {[5, 10, 15, 20, 25, 50].map((n) => (
                    <option key={n} value={n} className="bg-black">
                      {n} people
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500/50"
                />
                <label htmlFor="isPrivate" className="text-sm text-white/70">
                  Private Room (requires password)
                </label>
              </div>

              {isPrivate && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError("");
                  setRoomName("");
                  setIsPrivate(false);
                  setPassword("");
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={creating}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {creating ? "Creating..." : "Create Room"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Private Room Modal */}
      {showJoinModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-2">
              Join Private Room
            </h2>
            <p className="text-white/60 text-sm mb-4">
              Enter the password for &quot;{selectedRoom.name}&quot;
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <input
              type="password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setSelectedRoom(null);
                  setRoomPassword("");
                  setError("");
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors cursor-pointer"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
