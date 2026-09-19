import { getUserAvailableRoles, getDefaultUserRole, ROLE_CONFIG } from '../profileRoles';

describe('profileRoles utilities', () => {
  it('detects single role correctly for sponsor', () => {
    const user: any = {
      sponsor_profile: {
        id: 'sponsor-123',
        company_name: 'Acme Sports',
      },
    };

    const roles = getUserAvailableRoles(user);
    expect(roles).toEqual(['sponsor']);
    expect(getDefaultUserRole(user)).toBe('sponsor');
  });

  it('detects multiple roles when user has player and referee profiles', () => {
    const user: any = {
      player_profile: {
        id: 'player-1',
        full_name: 'Luis Ibarra',
      },
      referee_profile: {
        id: 'ref-1',
        certification_number: 'REF-2026',
      },
    };

    const roles = getUserAvailableRoles(user);
    expect(roles).toEqual(['player', 'referee']);
    expect(getDefaultUserRole(user)).toBe('player');
  });

  it('detects staff role when is_staff is true', () => {
    const user: any = {
      is_staff: true,
    };

    const roles = getUserAvailableRoles(user);
    expect(roles).toEqual(['staff']);
    expect(getDefaultUserRole(user)).toBe('staff');
  });

  it('falls back to player when no profile exists', () => {
    expect(getUserAvailableRoles(null)).toEqual(['player']);
    expect(getDefaultUserRole(undefined)).toBe('player');
  });

  it('has valid metadata configuration for all roles', () => {
    const roles: Array<keyof typeof ROLE_CONFIG> = ['player', 'referee', 'sponsor', 'spectator', 'staff'];
    roles.forEach((role) => {
      const config = ROLE_CONFIG[role];
      expect(config).toBeDefined();
      expect(config.label).toBeTruthy();
      expect(config.badgeLabel).toBeTruthy();
      expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
