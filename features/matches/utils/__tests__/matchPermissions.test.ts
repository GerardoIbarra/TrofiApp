import { getMatchPermissions } from '../matchPermissions';
import { User } from '@/features/auth/types/auth';
import { Match } from '@/features/tournaments/types/match';

describe('getMatchPermissions', () => {
  const baseMatch: Match = {
    id: 'match-100',
    tournament: 'tourney-1',
    tournament_name: 'Torneo Clausura',
    home_team: 'team-1',
    home_team_name: 'Águilas',
    away_team: 'team-2',
    away_team_name: 'Cuervos',
    start_datetime: '2026-03-01T10:00:00Z',
    status: 'played',
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-03-01T12:00:00Z',
    referee: 'referee-1',
  };

  const normalUser: User = {
    id: 'user-normal',
    email: 'user@test.com',
    username: 'user_regular',
    name: 'Usuario Regular',
    is_staff: false,
    memberships: [],
  };

  it('should return all false if user or match is null', () => {
    expect(getMatchPermissions(null, baseMatch)).toEqual({
      canAdminister: false,
      canReopen: false,
      isPlatformAdmin: false,
      isLeagueAdmin: false,
      isReferee: false,
    });

    expect(getMatchPermissions(normalUser, null)).toEqual({
      canAdminister: false,
      canReopen: false,
      isPlatformAdmin: false,
      isLeagueAdmin: false,
      isReferee: false,
    });
  });

  it('Platform Admin (is_staff: true) can reopen and administer', () => {
    const staffUser: User = {
      ...normalUser,
      id: 'user-staff',
      is_staff: true,
    };

    const permissions = getMatchPermissions(staffUser, baseMatch);
    expect(permissions.canReopen).toBe(true);
    expect(permissions.canAdminister).toBe(true);
    expect(permissions.isPlatformAdmin).toBe(true);
  });

  it('League Admin can reopen and administer', () => {
    const leagueAdminUser: User = {
      ...normalUser,
      id: 'user-admin',
      memberships: [
        {
          id: 'm-1',
          league: 'league-1',
          role: 'admin',
        },
      ],
    };

    const matchWithLeague = {
      ...baseMatch,
      league: 'league-1',
    } as any;

    const permissions = getMatchPermissions(leagueAdminUser, matchWithLeague);
    expect(permissions.canReopen).toBe(true);
    expect(permissions.canAdminister).toBe(true);
    expect(permissions.isLeagueAdmin).toBe(true);
  });

  it('Referee CANNOT reopen match, but CAN administer', () => {
    const refUser: User = {
      ...normalUser,
      id: 'referee-1',
    };

    const permissions = getMatchPermissions(refUser, baseMatch);
    expect(permissions.canReopen).toBe(false);
    expect(permissions.canAdminister).toBe(true);
    expect(permissions.isReferee).toBe(true);
  });

  it('Regular user cannot reopen and cannot administer', () => {
    const permissions = getMatchPermissions(normalUser, baseMatch);
    expect(permissions.canReopen).toBe(false);
    expect(permissions.canAdminister).toBe(false);
  });

  it('Admin of a different league cannot reopen when match league is specified', () => {
    const otherAdminUser: User = {
      ...normalUser,
      id: 'user-other',
      memberships: [
        {
          id: 'm-2',
          league: 'league-other',
          role: 'admin',
        },
      ],
    };

    const matchWithLeague = {
      ...baseMatch,
      league: 'league-primary',
    } as any;

    const permissions = getMatchPermissions(otherAdminUser, matchWithLeague);
    expect(permissions.canReopen).toBe(false);
    expect(permissions.canAdminister).toBe(false);
  });
});
