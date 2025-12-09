// Watch2gether room and participant types

export interface RoomParticipant {
  odometer: string;
  odometer_2: string;
  displayName: string;
  photoURL: string | null;
  joinedAt: number;
  isHost: boolean;
}

export interface ChatMessage {
  id: string;
  odometer: string;
  odometer_2: string;
  displayName: string;
  photoURL: string | null;
  message: string;
  timestamp: number;
}

export interface VideoState {
  currentTime: number;
  isPlaying: boolean;
  lastUpdated: number;
  updatedBy: string;
}

export interface RoomAnime {
  slug: string;
  title: string;
  poster: string;
  currentEpisode: number;
  totalEpisodes: number;
  iframeSrc: string;
}

export interface Watch2getherRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  createdAt: number;
  isPrivate: boolean;
  password?: string;
  maxParticipants: number;
  anime: RoomAnime | null;
  videoState: VideoState;
  participants: Record<string, RoomParticipant>;
  messages: Record<string, ChatMessage>;
}

export interface RoomPreview {
  id: string;
  name: string;
  hostName: string;
  participantCount: number;
  maxParticipants: number;
  isPrivate: boolean;
  anime: {
    title: string;
    poster: string;
    currentEpisode: number;
  } | null;
  createdAt: number;
}
