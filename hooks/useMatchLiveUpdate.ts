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
        
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          // Connected
        };

        socket.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            
            if (data.match) {
              setLiveMatch(data.match);
            }
            
            if (data.timeline) {
              setTimeline(data.timeline);
            }
          } catch (err) {
            // ignore JSON parse error silently
          }
        };

        socket.onclose = () => {
          // Closed
        };

        socket.onerror = () => {
          // Error
        };

      } catch (err) {
        // Connection error
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
