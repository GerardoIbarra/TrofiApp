import { User, UserProfileRole } from '../types/auth';

export interface RoleMetadata {
  role: UserProfileRole;
  label: string;
  badgeLabel: string;
  color: string;
  iconName: 'user' | 'award' | 'shield' | 'eye' | 'briefcase';
}

export const ROLE_CONFIG: Record<UserProfileRole, RoleMetadata> = {
  player: {
    role: 'player',
    label: 'Jugador',
    badgeLabel: 'JUGADOR ACTIVO',
    color: '#00BFA5',
    iconName: 'user',
  },
  referee: {
    role: 'referee',
    label: 'Árbitro',
    badgeLabel: 'ÁRBITRO CERTIFICADO',
    color: '#F59E0B',
    iconName: 'shield',
  },
  sponsor: {
    role: 'sponsor',
    label: 'Patrocinador',
    badgeLabel: 'PATROCINADOR OFICIAL',
    color: '#8B5CF6',
    iconName: 'briefcase',
  },
  spectator: {
    role: 'spectator',
    label: 'Espectador',
    badgeLabel: 'AFICIONADO / ESPECTADOR',
    color: '#06B6D4',
    iconName: 'eye',
  },
  staff: {
    role: 'staff',
    label: 'Staff Trofi',
    badgeLabel: 'ADMINISTRACIÓN TROFI',
    color: '#EF4444',
    iconName: 'award',
  },
};

/**
 * Retorna todos los roles que tiene configurados el usuario
 */
export function getUserAvailableRoles(user: Partial<User> | null | undefined): UserProfileRole[] {
  if (!user) return ['player'];

  const roles: UserProfileRole[] = [];

  if (user.player_profile) {
    roles.push('player');
  }
  if (user.referee_profile) {
    roles.push('referee');
  }
  if (user.sponsor_profile) {
    roles.push('sponsor');
  }
  if (user.spectator_profile) {
    roles.push('spectator');
  }
  if (user.is_staff) {
    roles.push('staff');
  }

  // Fallback si no tiene ningún perfil configurado
  if (roles.length === 0) {
    return ['player'];
  }

  return roles;
}

/**
 * Retorna el rol principal predeterminado para el usuario
 */
export function getDefaultUserRole(user: Partial<User> | null | undefined): UserProfileRole {
  const roles = getUserAvailableRoles(user);
  return roles[0] || 'player';
}
