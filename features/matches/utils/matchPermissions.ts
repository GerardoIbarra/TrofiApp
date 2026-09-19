import { User } from '@/features/auth/types/auth';
import { Match } from '@/features/tournaments/types/match';

export interface MatchPermissions {
  canAdminister: boolean;
  canReopen: boolean;
  isPlatformAdmin: boolean;
  isLeagueAdmin: boolean;
  isReferee: boolean;
}

/**
 * Reglas de permisos para partidos:
 *
 * 1. Reabrir partido (POST /api/v1/matches/{id}/reopen/):
 *    - Solo IsPlatformAdmin (user.is_staff: true)
 *    - O IsLeagueAdmin (LeagueMembership role='admin' | 'owner' de la liga del torneo/partido)
 *    - Ni los capitanes, ni jugadores, ni árbitros ordinarios pueden reabrir un partido bloqueado/finalizado.
 *
 * 2. Administrar partido (iniciar, pausar, finalizar, registrar incidencias):
 *    - Platform Admin
 *    - League Admin
 *    - Árbitro asignado al encuentro
 */
export function getMatchPermissions(
  user: User | null | undefined,
  match: Match | null | undefined,
  tournamentLeagueId?: string
): MatchPermissions {
  if (!user || !match) {
    return {
      canAdminister: false,
      canReopen: false,
      isPlatformAdmin: false,
      isLeagueAdmin: false,
      isReferee: false,
    };
  }

  const isPlatformAdmin = Boolean(user.is_staff);

  const leagueId = (match as any).league || (match as any).league_id || tournamentLeagueId;

  const isLeagueAdmin = Boolean(
    user.memberships?.some((m) => {
      const isRoleAdmin = m.role?.toLowerCase() === 'admin' || m.role?.toLowerCase() === 'owner';
      if (!isRoleAdmin) return false;
      if (leagueId) {
        return m.league === leagueId || String(m.league) === String(leagueId);
      }
      return true;
    })
  );

  const isReferee = Boolean(
    match.referee &&
      (match.referee === user.id ||
        String(match.referee) === String(user.id) ||
        (user.username && match.referee === user.username))
  );

  // POST /api/v1/matches/{id}/reopen/ está restringido exclusivamente a IsPlatformAdmin | IsLeagueAdmin
  const canReopen = isPlatformAdmin || isLeagueAdmin;
  const canAdminister = isPlatformAdmin || isLeagueAdmin || isReferee;

  return {
    canAdminister,
    canReopen,
    isPlatformAdmin,
    isLeagueAdmin,
    isReferee,
  };
}
