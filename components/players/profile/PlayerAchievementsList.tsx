import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { PlayerAchievement } from '@/features/players/schemas/playerProfileSchema';
import { Award } from 'lucide-react-native';
import { getBadgeDefinition } from '@/components/achievements/badgeCatalog';

interface PlayerAchievementsListProps {
  achievements: PlayerAchievement[];
}

// Fallback legible para tipos que aún no están en el catálogo: "loyal_fan" -> "Loyal Fan".
const humanizeType = (type: string) =>
  type
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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

  // El mismo logro puede ganarse varias veces (ej. MVP de la semana): un solo
  // badge por tipo con su contador, en el orden en que aparecieron.
  const groupedAchievements: { type: string; count: number }[] = [];
  achievements.forEach((achievement) => {
    const existing = groupedAchievements.find((g) => g.type === achievement.achievement_type);
    if (existing) existing.count += 1;
    else groupedAchievements.push({ type: achievement.achievement_type, count: 1 });
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Insignias y Logros</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {groupedAchievements.map(({ type, count }) => {
          // Mismo nombre/ícono/color que la pantalla de logros y la celebración.
          const badge = getBadgeDefinition(type);
          const config = {
            label: badge?.title ?? humanizeType(type),
            icon: badge?.icon ?? Award,
            color: badge?.color ?? theme.primary,
          };
          const Icon = config.icon;

          return (
            <View key={type} style={[styles.badgeContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
              <View style={[styles.iconCircle, { backgroundColor: config.color + '20' }]}>
                <Icon size={24} color={config.color} />
              </View>
              <Text style={[styles.badgeLabel, { color: theme.text }]} numberOfLines={2}>
                {config.label}
              </Text>
              {count > 1 && (
                <View style={[styles.countPill, { backgroundColor: config.color + '20' }]}>
                  <Text style={[styles.countText, { color: config.color }]}>×{count}</Text>
                </View>
              )}
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
    minHeight: 120,
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
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countText: {
    fontSize: 11,
    fontWeight: '900',
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
