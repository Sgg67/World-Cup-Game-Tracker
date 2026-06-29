import Constants from 'expo-constants';
import io from 'socket.io-client';

// Automatically detect the host running the Expo packager to connect to the backend
const getBackendUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.50:8081"
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }
  // Fallback for production or web
  return 'http://localhost:3000';
};

export const API_BASE_URL = getBackendUrl();
console.log(`[API] Connecting to backend at: ${API_BASE_URL}`);

// Types
export interface Team {
  id: number;
  name: string;
  code: string;
  flagUrl: string;
  groupName: string;
}

export interface MatchEvent {
  id: number;
  matchId: number;
  teamId: number | null;
  playerName: string;
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUB';
  minute: number;
  extraTime: number;
  createdAt: string;
}

export interface Match {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED' | 'POSTPONED';
  minute: number;
  kickoffTime: string;
  venue: string;
  isFeatured: boolean;
  events?: MatchEvent[];
}

// HTTP API Requests
export const fetchMatchesByDate = async (dateStr: string): Promise<Match[]> => {
  const response = await fetch(`${API_BASE_URL}/api/matches?date=${dateStr}`);
  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }
  return response.json();
};

export const fetchFeaturedMatch = async (): Promise<Match> => {
  const response = await fetch(`${API_BASE_URL}/api/matches/featured`);
  if (!response.ok) {
    throw new Error('Failed to fetch featured match');
  }
  return response.json();
};

// WebSocket Client Instance
export const socket = io(API_BASE_URL, {
  transports: ['websocket'],
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('[Socket] Connected to backend WebSocket server');
});

socket.on('disconnect', () => {
  console.log('[Socket] Disconnected from WebSocket server');
});
