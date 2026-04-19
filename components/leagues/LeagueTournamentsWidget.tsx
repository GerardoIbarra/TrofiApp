import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Tournament, TournamentsResponse } from '@/types/tournament';
import api from '@/services/api';
import { Trophy, Calendar, ChevronRight, CircleDot } from 'lucide-react-native';
import { router } from 'expo-router';

interface LeagueTournamentsWidgetProps {
  leagueId: string;
}

export function LeagueTournamentsWidget({ leagueId }: LeagueTournamentsWidgetProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, [leagueId]);

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      // Asumiendo que el backend soporta filtrado por league en el query param
      const response = await api.get<TournamentsResponse>(`/v1/tournaments/?league=${leagueId}`);
      setTournaments(response.results);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.primary;
      case 'completed': return '#4ADE80';
      case 'draft': return theme.textSecondary;
      default: return theme.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>COMPETICIONES</Text>
        <Text style={styles.count}>{tournaments.length} TORNEOS</Text>
      </View>

      {tournaments.length > 0 ? (
        tournaments.map((tournament) => (
          <TouchableOpacity 
            key={tournament.id} 
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/tournament-detail', params: { id: tournament.id } })}
          >
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(tournament.status) }]} />
            
            <View style={styles.cardContent}>
              <View style={styles.topRow}>
                <Text style={styles.seasonLabel}>{tournament.season_label.toUpperCase()}</Text>
                <View style={styles.statusBadge}>
                   <Text style={[styles.statusText, { color: getStatusColor(tournament.status) }]}>
                     {tournament.status.toUpperCase()}
                   </Text>
                </View>
              </View>

              <Text style={styles.name}>{tournament.name}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Calendar size={12} color={theme.textSecondary} />
                  <Text style={styles.metaText}>
                    {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                  </Text>
                </View>
                {tournament.team_count && (
                  <View style={styles.metaItem}>
                    <Trophy size={12} color={theme.textSecondary} />
                    <Text style={styles.metaText}>{tournament.team_count} Equipos</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.chevronBox}>
              <ChevronRight size={20} color={theme.textSecondary} opacity={0.5} />
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Trophy size={32} color={theme.textSecondary} opacity={0.2} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>Aún no hay torneos registrados en esta liga.</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.primary,
    letterSpacing: 1,
  },
  count: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.textSecondary,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    elevation: isDark ? 0 : 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.05,
    shadowRadius: 5,
  },
  statusIndicator: {
    width: 4,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  seasonLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.primary,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  chevronBox: {
    justifyContent: 'center',
    paddingRight: 15,
  },
  emptyState: {
    padding: 40,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});
