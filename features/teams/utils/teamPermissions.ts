import { User } from '@/features/auth/types/auth';
import { Team } from '../types/team';
import { TeamRosterItem } from '../types/teamProfile';

export interface TeamPermissions {
  canEdit: boolean;
  canDelete: boolean;
  isLeagueAdmin: boolean;
  isStaff: boolean;
  isCaptain: boolean;
}

/**
 * Reglas de permisos para equipos según la especificación de Trofi:
 *
 * 1. Editar (PATCH / PUT /api/v1/teams/{id}/):
 *    Requiere ser:
 *    - Admin de la liga dueña de ese equipo (LeagueMembership role='admin' | 'owner')
 *    - O Trofi staff (is_staff: true)
 *    - O capitán de alguna de sus inscripciones a torneo (TournamentRegistration.captain.user)
 *    NOTA: En ningún caso alcanza con ser el owner del equipo por sí solo.
 *
 * 2. Borrar (DELETE /api/v1/teams/{id}/):
 *    Más restrictivo:
 *    - Solo admin de la liga dueña de ese equipo
 *    - O Trofi staff
 *    NOTA: Ni el capitán ni el owner del equipo pueden borrar.
 */
export function getTeamPermissions(
  user: User | null | undefined,
  team: Team | null | undefined,
  roster?: TeamRosterItem[]
): TeamPermissions {
  if (!user || !team) {
    return {
      canEdit: false,
      canDelete: false,
      isLeagueAdmin: false,
      isStaff: false,
      isCaptain: false,
    };
  }

  const isStaff = Boolean(user.is_staff);

  // 1. Admin de la liga dueña de ese equipo
  const isLeagueAdmin = Boolean(
    user.memberships?.some(
      (m) =>
        (m.league === team.league || String(m.league) === String(team.league)) &&
        (m.role?.toLowerCase() === 'admin' || m.role?.toLowerCase() === 'owner')
    )
  );

  // 2. Capitán de alguna de sus inscripciones a torneo
  const isCaptainInRegistrations = Boolean(
    team.tournament_registrations?.some((reg) => {
      const captainUser = reg.captain?.user;
      return (
        captainUser === user.id ||
        (user.username && captainUser === user.username) ||
        String(reg.captain?.id) === String(user.id)
      );
    })
  );

  const playerProfileId = user.player_profile_id || user.player_profile?.id;
  const isCaptainInRoster = Boolean(
    roster &&
      playerProfileId &&
      roster.some((p) => p.is_captain && p.player_id === playerProfileId)
  );

  const isCaptain = isCaptainInRegistrations || isCaptainInRoster;

  // Editar: admin de liga dueña, Trofi staff, o capitán de inscripción a torneo
  const canEdit = isLeagueAdmin || isStaff || isCaptain;

  // Borrar: solo admin de liga dueña o Trofi staff (ni el capitán ni el owner pueden borrar)
  const canDelete = isLeagueAdmin || isStaff;

  return {
    canEdit,
    canDelete,
    isLeagueAdmin,
    isStaff,
    isCaptain,
  };
}
