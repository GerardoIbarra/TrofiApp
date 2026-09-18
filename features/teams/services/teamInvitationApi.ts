import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

export interface CreateTeamInvitationPayload {
  tournament?: string;
  expires_in_hours?: number;
}

export interface TeamInvitationResponse {
  id: string;
  tournament_team: string;
  team_name: string;
  tournament_name: string;
  token: string;
  invite_url: string;
  expires_at: string;
}

export interface JoinWithTokenPayload {
  token: string;
}

export interface JoinWithTokenResponse {
  detail?: string;
  [key: string]: any;
}

/**
 * Genera un enlace de invitación temporal para el equipo.
 * POST /api/v1/teams/{team_id}/invitations/
 */
export const useCreateTeamInvitation = (teamId: string) => {
  return useMutation<TeamInvitationResponse, Error, CreateTeamInvitationPayload | undefined>({
    mutationFn: async (payload?: CreateTeamInvitationPayload): Promise<TeamInvitationResponse> => {
      const response = await api.post<TeamInvitationResponse>(
        `/v1/teams/${teamId}/invitations/`,
        payload || {}
      );
      return response;
    },
  });
};

/**
 * Se une a un equipo utilizando un token de invitación.
 * POST /api/v1/teams/join-with-token/
 */
export const useJoinWithToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: JoinWithTokenPayload): Promise<JoinWithTokenResponse> => {
      const response = await api.post<JoinWithTokenResponse>(
        "/v1/teams/join-with-token/",
        payload
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-profile"] });
      queryClient.invalidateQueries({ queryKey: ["my-teams"] });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
    },
  });
};
