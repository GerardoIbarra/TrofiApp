import { getTeamPermissions } from '../teamPermissions';
import { User } from '@/features/auth/types/auth';
import { Team } from '../../types/team';
import { TeamRosterItem } from '../../types/teamProfile';

describe('getTeamPermissions', () => {
  const baseTeam: Team = {
    id: 'team-1',
    name: 'Los Galácticos',
    city: 'Zapopan',
    league: 'league-100',
    league_name: 'Liga Elite',
    owner: 'user-owner',
    owner_name: 'El Profe',
    created_at: '2026-01-01T00:00:00Z',
    tournament_registrations: [],
  };

  const normalUser: User = {
    id: 'user-normal',
    email: 'normal@test.com',
    username: 'normal_user',
    name: 'Jugador Normal',
    is_staff: false,
    memberships: [],
  };

  it('should return all false if user or team is missing', () => {
    expect(getTeamPermissions(null, baseTeam)).toEqual({
      canEdit: false,
      canDelete: false,
      isLeagueAdmin: false,
      isStaff: false,
      isCaptain: false,
    });

    expect(getTeamPermissions(normalUser, null)).toEqual({
      canEdit: false,
      canDelete: false,
      isLeagueAdmin: false,
      isStaff: false,
      isCaptain: false,
    });
  });

  it('CRITICAL: owner alone cannot edit and cannot delete', () => {
    const ownerUser: User = {
      id: 'user-owner', // matches baseTeam.owner
      email: 'owner@test.com',
      username: 'team_owner',
      name: 'Owner Only',
      is_staff: false,
      memberships: [], // Not league admin
    };

    const permissions = getTeamPermissions(ownerUser, baseTeam);

    expect(permissions.canEdit).toBe(false);
    expect(permissions.canDelete).toBe(false);
    expect(permissions.isLeagueAdmin).toBe(false);
    expect(permissions.isStaff).toBe(false);
    expect(permissions.isCaptain).toBe(false);
  });

  it('staff can edit and delete', () => {
    const staffUser: User = {
      ...normalUser,
      id: 'user-staff',
      is_staff: true,
    };

    const permissions = getTeamPermissions(staffUser, baseTeam);

    expect(permissions.canEdit).toBe(true);
    expect(permissions.canDelete).toBe(true);
    expect(permissions.isStaff).toBe(true);
  });

  it('league admin of team league can edit and delete', () => {
    const leagueAdminUser: User = {
      ...normalUser,
      id: 'user-admin',
      memberships: [
        {
          id: 'm-1',
          league: 'league-100', // matches baseTeam.league
          role: 'admin',
        },
      ],
    };

    const permissions = getTeamPermissions(leagueAdminUser, baseTeam);

    expect(permissions.canEdit).toBe(true);
    expect(permissions.canDelete).toBe(true);
    expect(permissions.isLeagueAdmin).toBe(true);
  });

  it('league owner of team league can edit and delete', () => {
    const leagueOwnerUser: User = {
      ...normalUser,
      id: 'user-league-owner',
      memberships: [
        {
          id: 'm-2',
          league: 'league-100',
          role: 'owner',
        },
      ],
    };

    const permissions = getTeamPermissions(leagueOwnerUser, baseTeam);

    expect(permissions.canEdit).toBe(true);
    expect(permissions.canDelete).toBe(true);
    expect(permissions.isLeagueAdmin).toBe(true);
  });

  it('league admin of another league cannot edit or delete', () => {
    const otherLeagueAdmin: User = {
      ...normalUser,
      id: 'user-other-admin',
      memberships: [
        {
          id: 'm-3',
          league: 'league-999', // different league
          role: 'admin',
        },
      ],
    };

    const permissions = getTeamPermissions(otherLeagueAdmin, baseTeam);

    expect(permissions.canEdit).toBe(false);
    expect(permissions.canDelete).toBe(false);
    expect(permissions.isLeagueAdmin).toBe(false);
  });

  it('captain of tournament registration can edit but CANNOT delete', () => {
    const captainUser: User = {
      ...normalUser,
      id: 'user-captain',
    };

    const teamWithRegistration: Team = {
      ...baseTeam,
      tournament_registrations: [
        {
          id: 'reg-1',
          tournament: 'tourney-1',
          tournament_name: 'Torneo Apertura',
          team: 'team-1',
          status: 'confirmed',
          registered_at: '2026-02-01T00:00:00Z',
          captain: {
            id: 'cap-1',
            user: 'user-captain',
            name: 'Capitán Furia',
          },
        },
      ],
    };

    const permissions = getTeamPermissions(captainUser, teamWithRegistration);

    expect(permissions.canEdit).toBe(true);
    expect(permissions.canDelete).toBe(false);
    expect(permissions.isCaptain).toBe(true);
  });

  it('captain in roster can edit but CANNOT delete', () => {
    const captainUser: User = {
      ...normalUser,
      id: 'user-roster-cap',
      player_profile_id: 'player-profile-10',
    };

    const roster: TeamRosterItem[] = [
      {
        player_id: 'player-profile-10',
        player_name: 'Capitán Roster',
        is_captain: true,
        status: 'active',
      },
      {
        player_id: 'player-profile-11',
        player_name: 'Jugador Ordinario',
        is_captain: false,
        status: 'active',
      },
    ];

    const permissions = getTeamPermissions(captainUser, baseTeam, roster);

    expect(permissions.canEdit).toBe(true);
    expect(permissions.canDelete).toBe(false);
    expect(permissions.isCaptain).toBe(true);
  });

  it('regular player in roster cannot edit and cannot delete', () => {
    const playerUser: User = {
      ...normalUser,
      id: 'user-regular-player',
      player_profile_id: 'player-profile-11',
    };

    const roster: TeamRosterItem[] = [
      {
        player_id: 'player-profile-10',
        player_name: 'Capitán Roster',
        is_captain: true,
        status: 'active',
      },
      {
        player_id: 'player-profile-11',
        player_name: 'Jugador Ordinario',
        is_captain: false,
        status: 'active',
      },
    ];

    const permissions = getTeamPermissions(playerUser, baseTeam, roster);

    expect(permissions.canEdit).toBe(false);
    expect(permissions.canDelete).toBe(false);
    expect(permissions.isCaptain).toBe(false);
  });
});
