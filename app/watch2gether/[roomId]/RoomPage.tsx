"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts";
import {
  ref,
  onValue,
  set,
  update,
  remove,
  push,
  get,
  onDisconnect,
} from "firebase/database";
import { database } from "@/lib/firebase";
import type {
  Watch2getherRoom,
  RoomParticipant,
  ChatMessage,
  RoomAnime,
  ServerItem,
  SimpleServer,
} from "@/types";
import { api } from "@/services/api";

/**
 * Helper function to extract iframe source from an episode
 * Same logic as watch page for consistency
 */
function getIframeSrc(
  episode:
    | {
        iframe_src?: string;
        servers?: {
          sub?: ServerItem[] | SimpleServer;
          dub?: ServerItem[] | SimpleServer;
        };
      }
    | undefined
): string | null {
  if (!episode) return null;

  // Check direct iframe_src first
  if (episode.iframe_src) {
    return episode.iframe_src;
  }

  // Check sub servers
  if (episode.servers?.sub) {
    if (Array.isArray(episode.servers.sub)) {
      const serverItem = episode.servers.sub[0] as ServerItem;
      if (serverItem?.ifram_src) {
        return serverItem.ifram_src;
      }
    } else if ("src" in episode.servers.sub) {
      return (episode.servers.sub as SimpleServer).src;
    }
  }

  // Check dub servers
  if (episode.servers?.dub) {
    if (Array.isArray(episode.servers.dub)) {
      const serverItem = episode.servers.dub[0] as ServerItem;
      if (serverItem?.ifram_src) {
        return serverItem.ifram_src;
      }
    } else if ("src" in episode.servers.dub) {
      return (episode.servers.dub as SimpleServer).src;
    }
  }

  return null;
}

export function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();

  const [room, setRoom] = useState<Watch2getherRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showAnimeSearch, setShowAnimeSearch] = useState(false);
  const [animeSearch, setAnimeSearch] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ title: string; slug: string; poster: string }>
  >([]);
  const [searching, setSearching] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isHost = room?.hostId === user?.uid;

  // Subscribe to room data
  useEffect(() => {
    if (!database || !params.roomId) {
      setLoading(false);
      return;
    }

    const roomRef = ref(database, `watch2gether/rooms/${params.roomId}`);
    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setRoom(snapshot.val() as Watch2getherRoom);
        } else {
          setError("Room not found");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching room:", err);
        setError("Failed to load room");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [params.roomId]);

  // Auto-join room and setup disconnect
  useEffect(() => {
    if (!user || !userProfile || !database || !room || !params.roomId) return;

    const participantRef = ref(
      database,
      `watch2gether/rooms/${params.roomId}/participants/${user.uid}`
    );

    // Check if user is already a participant
    const existingParticipant = room.participants?.[user.uid];
    if (!existingParticipant) {
      // Join room
      set(participantRef, {
        odometer: user.uid,
        odometer_2: user.uid,
        displayName: userProfile.displayName || "Anonymous",
        photoURL: userProfile.photoURL || null,
        joinedAt: Date.now(),
        isHost: room.hostId === user.uid,
      });
    }

    // Setup onDisconnect to remove participant when they leave
    const disconnectRef = onDisconnect(participantRef);
    disconnectRef.remove();

    return () => {
      disconnectRef.cancel();
    };
  }, [user, userProfile, room?.hostId, params.roomId]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [room?.messages]);

  const handleLeaveRoom = async () => {
    if (!user || !database || !params.roomId) return;

    try {
      const participantRef = ref(
        database,
        `watch2gether/rooms/${params.roomId}/participants/${user.uid}`
      );
      await remove(participantRef);

      // If host leaves, delete room or transfer host
      if (isHost) {
        const participants = room?.participants
          ? Object.entries(room.participants).filter(
              ([uid]) => uid !== user.uid
            )
          : [];

        if (participants.length === 0) {
          // Delete room
          await remove(ref(database, `watch2gether/rooms/${params.roomId}`));
        } else {
          // Transfer host to first participant
          const [newHostId, newHostData] = participants[0];
          await update(ref(database, `watch2gether/rooms/${params.roomId}`), {
            hostId: newHostId,
            hostName: newHostData.displayName,
          });
          await update(
            ref(
              database,
              `watch2gether/rooms/${params.roomId}/participants/${newHostId}`
            ),
            { isHost: true }
          );
        }
      }

      router.push("/watch2gether");
    } catch (err) {
      console.error("Error leaving room:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !userProfile || !database || !params.roomId || !message.trim())
      return;

    try {
      const messagesRef = ref(
        database,
        `watch2gether/rooms/${params.roomId}/messages`
      );
      const newMessageRef = push(messagesRef);

      const newMessage: ChatMessage = {
        id: newMessageRef.key!,
        odometer: user.uid,
        odometer_2: user.uid,
        displayName: userProfile.displayName || "Anonymous",
        photoURL: userProfile.photoURL,
        message: message.trim(),
        timestamp: Date.now(),
      };

      await set(newMessageRef, newMessage);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleSearchAnime = async () => {
    if (!animeSearch.trim()) return;

    setSearching(true);
    try {
      const results = await api.search(animeSearch);
      if (results && results.results) {
        setSearchResults(
          results.results.slice(0, 10).map((r) => ({
            title: r.title,
            slug: r.link,
            poster: r.thumbnail,
          }))
        );
      }
    } catch (err) {
      console.error("Error searching:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectAnime = async (anime: {
    title: string;
    slug: string;
    poster: string;
  }) => {
    if (!isHost || !database || !params.roomId) return;

    try {
      // Clean up the slug - remove leading slash if present
      const cleanSlug = anime.slug.startsWith("/")
        ? anime.slug.slice(1)
        : anime.slug;

      // Fetch anime details with episode 1 to get iframe source
      const watchData = await api.watch(cleanSlug, "1");

      // Find episode 1 in the returned data, or fallback to first episode
      const episode1 =
        watchData?.episodes?.find(
          (e: { episode_nr: number }) => e.episode_nr === 1
        ) || watchData?.episodes?.[0];

      // Use helper function to extract iframe source (same as watch page)
      const iframeSrc = getIframeSrc(episode1) || "";

      console.log("Watch data:", watchData);
      console.log("Episode 1:", episode1);
      console.log("Iframe src:", iframeSrc);

      const roomAnime: RoomAnime = {
        slug: anime.slug,
        title: anime.title,
        poster: anime.poster,
        currentEpisode: 1,
        totalEpisodes: watchData?.total_episodes || 1,
        iframeSrc,
      };

      await update(ref(database, `watch2gether/rooms/${params.roomId}`), {
        anime: roomAnime,
        videoState: {
          currentTime: 0,
          isPlaying: false,
          lastUpdated: Date.now(),
          updatedBy: user?.uid,
        },
      });

      setShowAnimeSearch(false);
      setAnimeSearch("");
      setSearchResults([]);
    } catch (err) {
      console.error("Error selecting anime:", err);
    }
  };

  const handleChangeEpisode = async (episode: number) => {
    if (!isHost || !database || !params.roomId || !room?.anime) return;

    try {
      // Clean up the slug - remove leading slash if present
      const cleanSlug = room.anime.slug.startsWith("/")
        ? room.anime.slug.slice(1)
        : room.anime.slug;

      const watchData = await api.watch(cleanSlug, String(episode));

      // Find the episode in the returned data, or fallback to first episode
      const ep =
        watchData?.episodes?.find(
          (e: { episode_nr: number }) => e.episode_nr === episode
        ) || watchData?.episodes?.[0];

      // Use helper function to extract iframe source (same as watch page)
      const iframeSrc = getIframeSrc(ep) || "";

      await update(ref(database, `watch2gether/rooms/${params.roomId}/anime`), {
        currentEpisode: episode,
        iframeSrc,
      });

      await update(
        ref(database, `watch2gether/rooms/${params.roomId}/videoState`),
        {
          currentTime: 0,
          isPlaying: false,
          lastUpdated: Date.now(),
          updatedBy: user?.uid,
        }
      );
    } catch (err) {
      console.error("Error changing episode:", err);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          {error || "Room not found"}
        </h1>
        <Link
          href="/watch2gether"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
        >
          Back to Rooms
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          Sign in to join room
        </h1>
        <Link
          href="/login"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const participants = room.participants
    ? Object.values(room.participants)
    : [];
  const messages = room.messages
    ? Object.values(room.messages).sort((a, b) => a.timestamp - b.timestamp)
    : [];

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
      </div>

      <div className="container mx-auto px-3 md:px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/watch2gether"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                {room.name}
              </h1>
              <p className="text-white/50 text-xs sm:text-sm">
                Host: {room.hostName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Participants Toggle */}
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4 text-white"
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
              <span className="text-white text-sm">{participants.length}</span>
            </button>

            {/* Leave Button */}
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors cursor-pointer"
            >
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline text-sm">Leave</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Video Player Section */}
          <div className="lg:col-span-3">
            {room.anime ? (
              <div className="bg-black rounded-xl overflow-hidden">
                {/* Video Player */}
                <div className="relative aspect-video bg-black">
                  {room.anime.iframeSrc ? (
                    <iframe
                      src={room.anime.iframeSrc}
                      className="w-full h-full"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-orientation-lock allow-presentation allow-top-navigation allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads"
                      referrerPolicy="origin"
                      allow="autoplay *; encrypted-media *; fullscreen *; picture-in-picture *"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-white/50">No video source available</p>
                    </div>
                  )}
                </div>

                {/* Episode Controls */}
                <div className="p-3 bg-white/5 border-t border-white/10">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="text-white font-medium text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                          {room.anime.title}
                        </h3>
                        <p className="text-white/50 text-xs sm:text-sm">
                          Episode {room.anime.currentEpisode} of{" "}
                          {room.anime.totalEpisodes}
                        </p>
                      </div>
                      {/* Episode List Toggle */}
                      {room.anime.totalEpisodes > 1 && (
                        <button
                          onClick={() => setShowEpisodeList(!showEpisodeList)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
                            showEpisodeList
                              ? "bg-purple-600 text-white"
                              : "bg-white/10 hover:bg-white/15 text-white"
                          }`}
                        >
                          <svg
                            className="w-4 h-4 inline-block mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6h16M4 10h16M4 14h16M4 18h16"
                            />
                          </svg>
                          Episodes
                        </button>
                      )}
                    </div>

                    {isHost && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleChangeEpisode(room.anime!.currentEpisode - 1)
                          }
                          disabled={room.anime.currentEpisode <= 1}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() =>
                            handleChangeEpisode(room.anime!.currentEpisode + 1)
                          }
                          disabled={
                            room.anime.currentEpisode >=
                            room.anime.totalEpisodes
                          }
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Next
                        </button>
                        <button
                          onClick={() => setShowAnimeSearch(true)}
                          className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm rounded-lg cursor-pointer"
                        >
                          Change Anime
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Episode List */}
                  {showEpisodeList && room.anime.totalEpisodes > 1 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {Array.from(
                          { length: room.anime.totalEpisodes },
                          (_, i) => i + 1
                        ).map((epNum) => (
                          <button
                            key={epNum}
                            onClick={() => {
                              if (isHost) {
                                handleChangeEpisode(epNum);
                                setShowEpisodeList(false);
                              }
                            }}
                            disabled={!isHost}
                            className={`px-2 py-1.5 text-xs sm:text-sm rounded transition-colors ${
                              epNum === room.anime!.currentEpisode
                                ? "bg-purple-600 text-white"
                                : isHost
                                ? "bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                                : "bg-white/5 text-white/50 cursor-not-allowed"
                            }`}
                          >
                            {epNum}
                          </button>
                        ))}
                      </div>
                      {!isHost && (
                        <p className="text-white/40 text-xs mt-2 text-center">
                          Only the host can change episodes
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl aspect-video flex flex-col items-center justify-center">
                <svg
                  className="w-16 h-16 text-white/20 mb-4"
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
                <p className="text-white/50 mb-4">No anime selected</p>
                {isHost && (
                  <button
                    onClick={() => setShowAnimeSearch(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors cursor-pointer"
                  >
                    Select Anime
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Chat & Participants Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-xl h-[400px] lg:h-[calc(100vh-200px)] flex flex-col">
              {/* Participants List (Collapsible) */}
              {showParticipants && (
                <div className="p-3 border-b border-white/10 max-h-40 overflow-y-auto">
                  <h3 className="text-white font-medium text-sm mb-2">
                    Participants ({participants.length})
                  </h3>
                  <div className="space-y-2">
                    {participants.map((p) => (
                      <div key={p.odometer} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
                          {p.photoURL ? (
                            <Image
                              src={p.photoURL}
                              alt={p.displayName}
                              width={24}
                              height={24}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-xs">
                              {p.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-white text-sm truncate">
                          {p.displayName}
                        </span>
                        {p.isHost && (
                          <span className="text-purple-400 text-xs">
                            (Host)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-3 space-y-3"
              >
                {messages.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">
                    No messages yet
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {msg.photoURL ? (
                          <Image
                            src={msg.photoURL}
                            alt={msg.displayName}
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xs">
                            {msg.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-purple-400 text-xs font-medium">
                          {msg.displayName}
                        </p>
                        <p className="text-white text-sm break-words">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-white/10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anime Search Modal */}
      {showAnimeSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Select Anime</h2>
              <button
                onClick={() => {
                  setShowAnimeSearch(false);
                  setAnimeSearch("");
                  setSearchResults([]);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5 text-white/60"
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
              </button>
            </div>

            {/* Search Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={animeSearch}
                onChange={(e) => setAnimeSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchAnime()}
                placeholder="Search anime..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                autoFocus
              />
              <button
                onClick={handleSearchAnime}
                disabled={searching || !animeSearch.trim()}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {searching ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Search"
                )}
              </button>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    className="w-12 h-12 text-white/10 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-white/40 text-sm">
                    Search for anime to watch together
                  </p>
                </div>
              ) : (
                searchResults.map((anime) => (
                  <button
                    key={anime.slug}
                    onClick={() => handleSelectAnime(anime)}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer group"
                  >
                    <div className="relative w-12 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">
                      <Image
                        src={anime.poster}
                        alt={anime.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-sm line-clamp-2 group-hover:text-purple-300 transition-colors">
                        {anime.title}
                      </span>
                    </div>
                    <svg
                      className="w-4 h-4 text-white/20 group-hover:text-purple-400 transition-colors flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))
              )}
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => {
                setShowAnimeSearch(false);
                setAnimeSearch("");
                setSearchResults([]);
              }}
              className="mt-4 w-full py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
