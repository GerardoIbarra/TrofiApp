import { useState, useEffect, useRef } from 'react';
import { AuthStorage } from '@/features/auth/services/authStorage';
import { Match } from '@/features/tournaments/types/match';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';
const WS_BASE_URL = API_URL.replace('http', 'ws').replace('/api', '/ws');

export function useMatchLiveUpdate(matchId: string | undefined, isLive: boolean) {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!matchId || !isLive) {
      if (socketRef.current) {
        socketRef.current.close();
      }
      return;
    }

    let isMounted = true;

    async function connect() {
      try {
        const token = await AuthStorage.getAccessToken();
        const wsUrl = `${WS_BASE_URL}/matches/${matchId}/?token=${token}`;
        
        console.log(`[WS] Connecting to ${wsUrl}`);
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log(`[WS] Connected to match ${matchId}`);
        };

        socket.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            console.log(`[WS] Update for ${matchId}:`, data);
            
            if (data.match) {
              setLiveMatch(data.match);
            }
            
            if (data.timeline) {
              setTimeline(data.timeline);
            }
          } catch (err) {
            console.error('[WS] Error parsing message:', err);
          }
        };

        socket.onclose = (e) => {
          console.log(`[WS] Disconnected from match ${matchId}`, e.reason);
        };

        socket.onerror = (err) => {
          console.error(`[WS] Error in match ${matchId}:`, err);
        };

      } catch (err) {
        console.error('[WS] Connection error:', err);
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [matchId, isLive]);

  return { liveMatch, timeline };
}
