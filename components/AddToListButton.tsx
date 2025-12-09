"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  addAnimeToList,
  updateAnimeStatus,
  removeAnimeFromList,
  getAnimeFromList,
  AnimeListStatus,
  LIST_STATUS_LABELS,
  LIST_STATUS_COLORS,
} from "@/services/animeListService";

// SVG Icons for each status
const StatusIcons: Record<AnimeListStatus, React.ReactNode> = {
  watching: (
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
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  completed: (
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
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  "on-hold": (
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
        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  dropped: (
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
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  "plan-to-watch": (
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
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
};

interface AddToListButtonProps {
  anime: {
    animeId: string;
    title: string;
    poster: string;
    type?: string;
  };
  variant?: "icon" | "button" | "compact" | "large";
  onAuthRequired?: () => void;
  className?: string;
}

export function AddToListButton({
  anime,
  variant = "icon",
  onAuthRequired,
  className = "",
}: AddToListButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<AnimeListStatus | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      try {
        const existingAnime = await getAnimeFromList(user.uid, anime.animeId);
        setCurrentStatus(existingAnime?.status || null);
      } catch (error) {
        console.error("Error fetching anime status:", error);
      }
    };
    fetchStatus();
  }, [user, anime.animeId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        router.push("/login");
      }
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleStatusSelect = async (status: AnimeListStatus) => {
    if (!user) return;
    setLoading(true);

    try {
      if (currentStatus === status) {
        await removeAnimeFromList(user.uid, anime.animeId);
        setCurrentStatus(null);
      } else if (currentStatus) {
        await updateAnimeStatus(user.uid, anime.animeId, status);
        setCurrentStatus(status);
      } else {
        await addAnimeToList(user.uid, {
          animeId: anime.animeId,
          title: anime.title,
          thumbnail: anime.poster,
          type: anime.type || "TV",
          status,
        });
        setCurrentStatus(status);
      }
    } catch (error) {
      console.error("Error updating anime status:", error);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const statuses: AnimeListStatus[] = [
    "watching",
    "completed",
    "on-hold",
    "dropped",
    "plan-to-watch",
  ];

  // Dropdown component shared across variants
  const Dropdown = ({
    position = "bottom",
    showTitle = false,
  }: {
    position?: "top" | "bottom";
    showTitle?: boolean;
  }) => (
    <div
      className={`absolute ${
        position === "top" ? "bottom-full mb-2" : "top-full mt-2"
      } right-0 w-52 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-[100]`}
    >
      {showTitle && (
        <div className="p-3 border-b border-white/5">
          <p className="text-sm font-medium text-white">Add to list</p>
          <p className="text-xs text-white/40 mt-1 truncate">{anime.title}</p>
        </div>
      )}
      <div className="p-1.5">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusSelect(status)}
            disabled={loading}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
              currentStatus === status
                ? `${LIST_STATUS_COLORS[status]} text-white`
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            {StatusIcons[status]}
            <span className="text-sm">{LIST_STATUS_LABELS[status]}</span>
            {currentStatus === status && (
              <svg
                className="w-4 h-4 ml-auto"
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
            )}
          </button>
        ))}
      </div>
      {currentStatus && (
        <div className="p-1.5 border-t border-white/5">
          <button
            onClick={() => handleStatusSelect(currentStatus)}
            disabled={loading}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer text-sm"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Remove from list
          </button>
        </div>
      )}
    </div>
  );

  if (variant === "icon") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={handleClick}
          className={`p-3 rounded-xl transition-all cursor-pointer ${
            currentStatus
              ? `${LIST_STATUS_COLORS[currentStatus]} text-white shadow-lg`
              : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
          }`}
          title={
            currentStatus ? LIST_STATUS_LABELS[currentStatus] : "Add to list"
          }
        >
          {currentStatus ? (
            StatusIcons[currentStatus]
          ) : (
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
          )}
        </button>

        {isOpen && <Dropdown position="top" />}
      </div>
    );
  }

  if (variant === "button") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={handleClick}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
            currentStatus
              ? `${LIST_STATUS_COLORS[currentStatus]} text-white shadow-lg`
              : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
          }`}
        >
          {currentStatus ? (
            <>
              {StatusIcons[currentStatus]}
              <span>{LIST_STATUS_LABELS[currentStatus]}</span>
            </>
          ) : (
            <>
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
              <span>Add to List</span>
            </>
          )}
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && <Dropdown position="bottom" showTitle />}
      </div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={handleClick}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            currentStatus
              ? `${LIST_STATUS_COLORS[currentStatus]} text-white`
              : "bg-black/60 hover:bg-black/80 text-white/80 hover:text-white"
          }`}
          title={
            currentStatus ? LIST_STATUS_LABELS[currentStatus] : "Add to list"
          }
        >
          {currentStatus ? (
            <span className="scale-75 inline-block">
              {StatusIcons[currentStatus]}
            </span>
          ) : (
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
        </button>

        {isOpen && <Dropdown position="bottom" />}
      </div>
    );
  }

  // Large variant (for anime detail pages)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-5 h-11 rounded-full font-medium text-sm transition cursor-pointer ${
          currentStatus
            ? `${LIST_STATUS_COLORS[currentStatus]} text-white shadow-lg`
            : "bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm ring-1 ring-white/15 hover:ring-white/25"
        }`}
      >
        {currentStatus ? (
          <>
            {StatusIcons[currentStatus]}
            <span>{LIST_STATUS_LABELS[currentStatus]}</span>
          </>
        ) : (
          <>
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Add to List</span>
          </>
        )}
      </button>

      {isOpen && <Dropdown position="bottom" />}
    </div>
  );
}
