import { useState, useEffect, useRef, useCallback } from 'react';
import { AuthStorage } from '@/features/auth/services/authStorage';
import { ChatMessage, DirectMessage } from '../types/chat';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';
const WS_BASE_URL = API_URL.replace('http', 'ws').replace('/api', '/ws');

export type ChatStreamType = 'team' | 'league' | 'direct';

interface UseChatWebSocketOptions {
  type: ChatStreamType;
  targetId?: string; // teamId or leagueId (not needed for 'direct')
  enabled?: boolean;
  onNewMessage?: (msg: ChatMessage | DirectMessage) => void;
}

export function useChatWebSocket({
  type,
  targetId,
  enabled = true,
  onNewMessage,
}: UseChatWebSocketOptions) {
  const [messages, setMessages] = useState<(ChatMessage | DirectMessage)[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const getWsUrl = useCallback((token: string) => {
    if (type === 'team' && targetId) {
      return `${WS_BASE_URL}/teams/${targetId}/chat/?token=${token}`;
    }
    if (type === 'league' && targetId) {
      return `${WS_BASE_URL}/leagues/${targetId}/chat/?token=${token}`;
    }
    if (type === 'direct') {
      return `${WS_BASE_URL}/direct-messages/?token=${token}`;
    }
    return null;
  }, [type, targetId]);

  useEffect(() => {
    if (!enabled) {
      if (socketRef.current) {
        socketRef.current.close();
      }
      return;
    }

    if ((type === 'team' || type === 'league') && !targetId) {
      return;
    }

    let isMounted = true;

    async function connect() {
      try {
        const token = await AuthStorage.getAccessToken();
        if (!token) {
          setConnectionError('No authentication token');
          return;
        }

        const wsUrl = getWsUrl(token);
        if (!wsUrl) return;

        console.log(`[ChatWS] Connecting to ${wsUrl}`);
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          if (!isMounted) return;
          console.log(`[ChatWS] Connected (${type}:${targetId ?? 'global'})`);
          setIsConnected(true);
          setConnectionError(null);
        };

        socket.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            console.log(`[ChatWS] Message:`, data);

            // 1. Snapshot handling (last 25 messages)
            if (data.type === 'snapshot') {
              const snapshotList = Array.isArray(data.messages)
                ? data.messages
                : Array.isArray(data.data)
                ? data.data
                : [];
              setMessages(snapshotList);
              return;
            }

            // 2. Real-time new message
            if (data.type === 'chat_message' || data.type === 'direct_message') {
              const newMsg = data.message || data;
              setMessages((prev) => {
                // Deduplicate by id if present
                if (newMsg.id && prev.some((m) => m.id === newMsg.id)) {
                  return prev;
                }
                return [...prev, newMsg];
              });

              if (onNewMessage) {
                onNewMessage(newMsg);
              }
            }
          } catch (err) {
            console.error('[ChatWS] Error parsing message:', err);
          }
        };

        socket.onerror = (err) => {
          if (!isMounted) return;
          console.error('[ChatWS] Socket error:', err);
          setConnectionError('Error en conexión de chat');
        };

        socket.onclose = (event) => {
          if (!isMounted) return;
          console.log(`[ChatWS] Closed: ${event.code} ${event.reason}`);
          setIsConnected(false);
          if (event.code === 4403 || event.code === 403) {
            setConnectionError('No tienes permiso para acceder a este chat');
          }
        };
      } catch (err: any) {
        if (!isMounted) return;
        console.error('[ChatWS] Setup error:', err);
        setConnectionError(err?.message || 'Error de conexión');
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [type, targetId, enabled, getWsUrl, onNewMessage]);

  const sendRaw = useCallback((payload: Record<string, any>) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return {
    messages,
    setMessages,
    isConnected,
    connectionError,
    sendRaw,
  };
}
