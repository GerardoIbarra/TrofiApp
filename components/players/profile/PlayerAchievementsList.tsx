import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { PlayerAchievement } from '@/features/players/schemas/playerProfileSchema';
import { Star, Trophy, Target, Award, Calendar, ShieldCheck } from 'lucide-react-native';

interface PlayerAchievementsListProps {
  achievements: PlayerAchievement[];
}

const ACHIEVEMENT_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  first_day: { label: 'Fundador', icon: Calendar, color: '#9E9E9E' },
  mvp_week: { label: 'MVP Semanal', icon: Star, color: '#FFD700' },
  top_scorer: { label: 'Goleador', icon: Target, color: '#EF4444' },
  hat_trick: { label: 'Hat-Trick', icon: Award, color: '#8B5CF6' },
  champion: { label: 'Campeón', icon: Trophy, color: '#F59E0B' },
  fair_play: { label: 'Fair Play', icon: ShieldCheck, color: '#10B981' },
};

export function PlayerAchievementsList({ achievements }: PlayerAchievementsListProps) {
  const { theme, isDark } = useTheme();

  if (!achievements || achievements.length === 0) {
    return (
      <View style={[styles.emptyContainer, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
        <Award size={40} color={theme.textSecondary} opacity={0.3} />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Aún no ha desbloqueado ningún logro.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Insignias y Logros</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {achievements.map((achievement) => {
          const config = ACHIEVEMENT_CONFIG[achievement.achievement_type] || {
            label: achievement.achievement_type,
            icon: Award,
            color: theme.primary
          };
          const Icon = config.icon;

          return (
            <View key={achievement.id} style={[styles.badgeContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
              <View style={[styles.iconCircle, { backgroundColor: config.color + '20' }]}>
                <Icon size={24} color={config.color} />
              </View>
              <Text style={[styles.badgeLabel, { color: theme.text }]} numberOfLines={2}>
                {config.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  badgeContainer: {
    width: 100,
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyContainer: {
    margin: 20,
    padding: 40,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  }
});
