import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { UserProfileRole } from '@/features/auth/types/auth';
import { ROLE_CONFIG } from '@/features/auth/utils/profileRoles';
import {
  User,
  Shield,
  Award,
  Eye,
  Briefcase,
  CheckCircle,
} from 'lucide-react-native';

interface ProfileRoleBadgeProps {
  currentRole: UserProfileRole;
  availableRoles: UserProfileRole[];
  onSelectRole: (role: UserProfileRole) => void;
  isStaff?: boolean;
}

export function ProfileRoleBadge({
  currentRole,
  availableRoles,
  onSelectRole,
  isStaff,
}: ProfileRoleBadgeProps) {
  const { theme, isDark } = useTheme();
  const currentConfig = ROLE_CONFIG[currentRole] || ROLE_CONFIG.player;

  const renderRoleIcon = (role: UserProfileRole, size = 16, color?: string) => {
    const iconColor = color || theme.text;
    switch (role) {
      case 'player':
        return <User size={size} color={iconColor} />;
      case 'referee':
        return <Shield size={size} color={iconColor} />;
      case 'sponsor':
        return <Briefcase size={size} color={iconColor} />;
      case 'spectator':
        return <Eye size={size} color={iconColor} />;
      case 'staff':
        return <Award size={size} color={iconColor} />;
      default:
        return <User size={size} color={iconColor} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Role Pill Banner / Main Badge */}
      <View
        style={[
          styles.mainBadge,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(0, 0, 0, 0.03)',
            borderColor: currentConfig.color + '55',
          },
        ]}
      >
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: currentConfig.color + '25' },
          ]}
        >
          {renderRoleIcon(currentRole, 16, currentConfig.color)}
        </View>

        <View style={styles.badgeTextContainer}>
          <Text style={styles.accountTypeOverline}>TIPO DE CUENTA</Text>
          <View style={styles.roleTitleRow}>
            <Text
              style={[
                styles.roleTitleText,
                { color: isDark ? '#FFFFFF' : theme.text },
              ]}
            >
              {currentConfig.badgeLabel}
            </Text>
            {isStaff && currentRole !== 'staff' && (
              <View style={styles.staffMiniBadge}>
                <Text style={styles.staffMiniBadgeText}>STAFF</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Role Selector Tabs (Only if user has more than 1 role available) */}
      {availableRoles.length > 1 && (
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>VISTAS DISPONIBLES:</Text>
          <View style={styles.chipsRow}>
            {availableRoles.map((role) => {
              const roleMeta = ROLE_CONFIG[role];
              const isSelected = role === currentRole;

              return (
                <TouchableOpacity
                  key={role}
                  onPress={() => onSelectRole(role)}
                  activeOpacity={0.7}
                  style={[
                    styles.roleChip,
                    {
                      backgroundColor: isSelected
                        ? roleMeta.color
                        : isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                      borderColor: isSelected
                        ? roleMeta.color
                        : isDark
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.08)',
                    },
                  ]}
                >
                  {renderRoleIcon(
                    role,
                    14,
                    isSelected ? '#FFFFFF' : theme.textSecondary
                  )}
                  <Text
                    style={[
                      styles.roleChipText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.textSecondary,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {roleMeta.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  mainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  accountTypeOverline: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#8E8E93',
    marginBottom: 2,
  },
  roleTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  roleTitleText: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  staffMiniBadge: {
    backgroundColor: '#EF444425',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF444455',
  },
  staffMiniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EF4444',
  },
  selectorContainer: {
    marginTop: 10,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    minHeight: 44, // Fitts's Law 44pt touch target
    borderRadius: 22,
    borderWidth: 1,
    gap: 6,
  },
  roleChipText: {
    fontSize: 13,
  },
});
