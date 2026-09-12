import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import {
  ChatMessage,
  DirectMessage,
  ConversationItem,
  UserBlock,
  SendChatMessagePayload,
  SendDirectMessagePayload,
  BlockUserPayload,
  PaginatedResponse,
} from '../types/chat';

// ==========================================
// TEAM CHAT
// ==========================================

export const useGetTeamChat = (teamId?: string) => {
  return useQuery({
    queryKey: ['team-chat', teamId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!teamId) return [];
      const response = await api.get<PaginatedResponse<ChatMessage> | ChatMessage[]>(
        `/v1/teams/${teamId}/chat/`
      );
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
    enabled: Boolean(teamId),
  });
};

export const useSendTeamChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      payload,
    }: {
      teamId: string;
      payload: SendChatMessagePayload;
    }): Promise<ChatMessage> => {
      return await api.post<ChatMessage>(`/v1/teams/${teamId}/chat/`, payload);
    },
    onMutate: async ({ teamId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['team-chat', teamId] });
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(['team-chat', teamId]);
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        team: teamId,
        league: null,
        sender: 'me',
        sender_name: 'Tú',
        body: payload.body || '',
        photo: payload.photo || null,
        created_at: new Date().toISOString(),
      };
      if (previousMessages) {
        queryClient.setQueryData<ChatMessage[]>(['team-chat', teamId], [optimisticMessage, ...previousMessages]);
      }
      return { previousMessages, teamId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['team-chat', context.teamId], context.previousMessages);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-chat', variables.teamId] });
    },
  });
};

// ==========================================
// LEAGUE CHAT
// ==========================================

export const useGetLeagueChat = (leagueId?: string) => {
  return useQuery({
    queryKey: ['league-chat', leagueId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!leagueId) return [];
      const response = await api.get<PaginatedResponse<ChatMessage> | ChatMessage[]>(
        `/v1/leagues/${leagueId}/chat/`
      );
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
    enabled: Boolean(leagueId),
  });
};

export const useSendLeagueChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leagueId,
      payload,
    }: {
      leagueId: string;
      payload: SendChatMessagePayload;
    }): Promise<ChatMessage> => {
      return await api.post<ChatMessage>(`/v1/leagues/${leagueId}/chat/`, payload);
    },
    onMutate: async ({ leagueId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['league-chat', leagueId] });
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(['league-chat', leagueId]);
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        team: null,
        league: leagueId,
        sender: 'me',
        sender_name: 'Tú',
        body: payload.body || '',
        photo: payload.photo || null,
        created_at: new Date().toISOString(),
      };
      if (previousMessages) {
        queryClient.setQueryData<ChatMessage[]>(['league-chat', leagueId], [optimisticMessage, ...previousMessages]);
      }
      return { previousMessages, leagueId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['league-chat', context.leagueId], context.previousMessages);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['league-chat', variables.leagueId] });
    },
  });
};

// ==========================================
// DIRECT MESSAGES (DMs)
// ==========================================

export const useGetDirectMessages = (withUserId?: string) => {
  return useQuery({
    queryKey: ['direct-messages', withUserId],
    queryFn: async (): Promise<DirectMessage[]> => {
      const endpoint = withUserId
        ? `/v1/direct-messages/?with=${withUserId}`
        : '/v1/direct-messages/';
      const response = await api.get<PaginatedResponse<DirectMessage> | DirectMessage[]>(
        endpoint
      );
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
  });
};

export const useGetConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async (): Promise<ConversationItem[]> => {
      const response = await api.get<PaginatedResponse<ConversationItem> | ConversationItem[]>(
        '/v1/direct-messages/conversations/'
      );
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
  });
};

export const useSendDirectMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendDirectMessagePayload): Promise<DirectMessage> => {
      return await api.post<DirectMessage>('/v1/direct-messages/', payload);
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['direct-messages', payload.recipient] });
      const previousMessages = queryClient.getQueryData<DirectMessage[]>(['direct-messages', payload.recipient]);
      const optimisticMessage: DirectMessage = {
        id: `temp-${Date.now()}`,
        sender: 'me',
        sender_name: 'Tú',
        recipient: payload.recipient,
        recipient_name: '',
        body: payload.body || '',
        photo: payload.photo || null,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      if (previousMessages) {
        queryClient.setQueryData<DirectMessage[]>(['direct-messages', payload.recipient], [optimisticMessage, ...previousMessages]);
      }
      return { previousMessages, recipient: payload.recipient };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['direct-messages', context.recipient], context.previousMessages);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['direct-messages', variables.recipient] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMarkDirectMessageRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string): Promise<void> => {
      await api.post(`/v1/direct-messages/${messageId}/mark-read/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// ==========================================
// USER BLOCKS
// ==========================================

export const useGetUserBlocks = () => {
  return useQuery({
    queryKey: ['user-blocks'],
    queryFn: async (): Promise<UserBlock[]> => {
      const response = await api.get<PaginatedResponse<UserBlock> | UserBlock[]>('/v1/user-blocks/');
      if (Array.isArray(response)) {
        return response;
      }
      return response?.results || [];
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BlockUserPayload): Promise<UserBlock> => {
      return await api.post<UserBlock>('/v1/user-blocks/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockId: string): Promise<void> => {
      await api.delete(`/v1/user-blocks/${blockId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
