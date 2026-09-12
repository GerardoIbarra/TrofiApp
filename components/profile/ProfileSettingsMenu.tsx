import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Moon,
  Globe,
  ChevronRight,
  User,
  Award,
  ShieldAlert,
  Shield,
  Lock,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/features/auth/store/authStore';

interface ProfileSettingsMenuProps {
  onOpenLanguage: () => void;
  onOpenNotifications: () => void;
  onOpenAchievements: () => void;
}

export const ProfileSettingsMenu = React.memo(function ProfileSettingsMenu({
  onOpenLanguage,
  onOpenNotifications,
  onOpenAchievements,
}: ProfileSettingsMenuProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const signOut = useAuthStore((state) => state.signOut);
  const styles = createStyles(theme, isDark);
  const currentLanguage = i18n.language;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.mainSectionTitle}>{t('profile.configuration')}</Text>
      </View>

      {/* Theme Toggle Switch */}
      <View style={styles.menuItem}>
        <View style={styles.menuIconText}>
          <Moon size={20} color={theme.primary} />
          <Text style={styles.menuLabel}>{t('profile.dark_mode')}</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#767577', true: theme.primary }}
          thumbColor={isDark ? '#FFF' : '#f4f3f4'}
        />
      </View>

      {/* Language Selector */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onOpenLanguage}
        activeOpacity={0.7}
      >
        <View style={styles.menuIconText}>
          <Globe size={20} color={theme.primary} />
          <Text style={styles.menuLabel}>{t('profile.language')}</Text>
        </View>
        <View style={styles.langIndicator}>
          <Text style={styles.langText}>
            {currentLanguage === 'es' ? 'Español' : 'English'}
          </Text>
          <ChevronRight size={18} color={theme.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* Navigation Items */}
      <MenuItemRow
        icon={<User size={20} color={theme.primary} />}
        label={t('profile.my_account')}
        theme={theme}
        onPress={() => router.push('/(tabs)/edit-profile' as any)}
      />
      <MenuItemRow
        icon={<Award size={20} color="#F59E0B" />}
        label="Espacios Publicitarios (Sponsors)"
        theme={theme}
        onPress={() => router.push('/sponsor-placements' as any)}
      />
      <MenuItemRow
        icon={<Award size={20} color="#10B981" />}
        label="Mercado de Árbitros"
        theme={theme}
        onPress={() => router.push('/referee-marketplace' as any)}
      />
      <MenuItemRow
        icon={<ShieldAlert size={20} color="#EF4444" />}
        label="Super Admin (Trofi Staff)"
        theme={theme}
        onPress={() => router.push('/super-admin' as any)}
      />
      <MenuItemRow
        icon={<Award size={20} color={theme.primary} />}
        label={t('profile.achievements')}
        theme={theme}
        onPress={onOpenAchievements}
      />
      <MenuItemRow
        icon={<Shield size={20} color={theme.primary} />}
        label={t('profile.privacy')}
        theme={theme}
      />
      <MenuItemRow
        icon={<Lock size={20} color={theme.primary} />}
        label="Cambiar Contraseña"
        theme={theme}
        onPress={() => router.push('/(tabs)/change-password' as any)}
      />
      <MenuItemRow
        icon={<Bell size={20} color={theme.primary} />}
        label="Preferencias de Notificaciones"
        theme={theme}
        onPress={onOpenNotifications}
      />
      <MenuItemRow
        icon={<Settings size={20} color={theme.primary} />}
        label={t('profile.app_settings')}
        theme={theme}
      />

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={signOut}
        activeOpacity={0.7}
      >
        <LogOut size={20} color={theme.error} />
        <Text style={[styles.logoutText, { color: theme.error }]}>
          {t('profile.logout')}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

function MenuItemRow({
  icon,
  label,
  theme,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  theme: any;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={itemStyles.menuItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={itemStyles.menuIconText}>
        {icon}
        <Text style={[itemStyles.menuLabel, { color: theme.text }]}>{label}</Text>
      </View>
      <ChevronRight size={18} color={theme.textSecondary} />
    </TouchableOpacity>
  );
}

const itemStyles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginTop: 10,
    },
    sectionHeader: {
      marginTop: 20,
      marginBottom: 10,
    },
    mainSectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: theme.textSecondary,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
    },
    menuIconText: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
    },
    langIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    langText: {
      color: theme.primary,
      fontWeight: '700',
      fontSize: 14,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginTop: 30,
      paddingVertical: 15,
      borderRadius: 14,
      backgroundColor: isDark
        ? 'rgba(239, 68, 68, 0.08)'
        : 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(239, 68, 68, 0.2)'
        : 'rgba(239, 68, 68, 0.25)',
    },
    logoutText: {
      fontSize: 15,
      fontWeight: '800',
    },
  });
