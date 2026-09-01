import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { PlayerStats } from '@/features/players/schemas/playerProfileSchema';
import { Trophy, Activity, Target, Shield, AlertCircle } from 'lucide-react-native';

interface PlayerStatsWidgetProps {
  stats: PlayerStats;
}

export function PlayerStatsWidget({ stats }: PlayerStatsWidgetProps) {
  const { theme, isDark } = useTheme();

  const StatItem = ({ label, value, icon: Icon }: any) => (
    <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
      <View style={styles.statHeader}>
        <Icon size={14} color={theme.primary} />
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Estadísticas del Torneo</Text>
      </View>

      {stats.provisional && (
        <View style={styles.provisionalAlert}>
          <AlertCircle size={16} color="#FF9800" />
          <Text style={styles.provisionalAlertText}>
            Nivel de confianza: {Math.round(stats.confidence_factor * 100)}%. Faltan más partidos para un rating definitivo.
          </Text>
        </View>
      )}

      <View style={styles.grid}>
        <StatItem label="Partidos" value={stats.matches_played ?? '-'} icon={Activity} />
        <StatItem label="Goles" value={stats.goals ?? '-'} icon={Target} />
        <StatItem label="Asistencias" value={stats.assists ?? '-'} icon={Target} />
        <StatItem label="Rating Prom." value={stats.avg_match_rating != null ? stats.avg_match_rating.toFixed(2) : '-'} icon={Activity} />
        <StatItem label="MVP" value={stats.mvp_count ?? '-'} icon={Trophy} />
        <StatItem label="Vallas Invictas" value={stats.clean_sheets ?? '-'} icon={Shield} />
        <StatItem label="T. Amarillas" value={stats.yellow_cards ?? '-'} icon={AlertCircle} />
        <StatItem label="T. Rojas" value={stats.red_cards ?? '-'} icon={AlertCircle} />
      </View>

      <View style={styles.recordBox}>
        <Text style={[styles.recordLabel, { color: theme.textSecondary }]}>Récord de equipo con este jugador</Text>
        <View style={styles.recordValues}>
          <Text style={[styles.recordValue, { color: '#4ADE80' }]}>{stats.wins ?? '-'} G</Text>
          <Text style={[styles.recordValue, { color: theme.textSecondary }]}>{stats.draws ?? '-'} E</Text>
          <Text style={[styles.recordValue, { color: '#EF4444' }]}>{stats.losses ?? '-'} P</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  provisionalAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  provisionalAlertText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  recordBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  recordLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  recordValues: {
    flexDirection: 'row',
    gap: 16,
  },
  recordValue: {
    fontSize: 16,
    fontWeight: '800',
  }
});
