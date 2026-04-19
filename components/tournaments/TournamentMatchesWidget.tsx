import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, RefreshControl 
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { Match, PaginatedMatches } from '@/types/match';
import { Calendar, MapPin, Trophy, ChevronRight } from 'lucide-react-native';
import { MatchResultModal } from './MatchResultModal';

interface TournamentMatchesWidgetProps {
  tournamentId: string;
  isAdmin?: boolean;
}

export function TournamentMatchesWidget({ tournamentId, isAdmin }: TournamentMatchesWidgetProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, [tournamentId]);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<PaginatedMatches>(`/v1/matches/?tournament=${tournamentId}`);
      // Ordenamos por start_datetime
      const sortedMatches = response.results.sort((a, b) => 
        new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
      );
      setMatches(sortedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const handleEditResult = (match: Match) => {
    setSelectedMatch(match);
    setIsResultModalVisible(true);
  };

  const renderMatchCard = ({ item }: { item: Match }) => {
    const isFinished = item.status === 'finished';
    const matchDate = new Date(item.start_datetime);
    const isToday = matchDate.toDateString() === new Date().toDateString();
    
    // Extraemos resultados del objeto anidado
    const homeScore = item.result?.home_score ?? 0;
    const awayScore = item.result?.away_score ?? 0;
    const hasResult = !!item.result;

    return (
      <View style={styles.matchCard}>
        <View style={styles.cardHeader}>
            <View style={styles.tagRow}>
                {isToday && <View style={styles.liveTag}><Text style={styles.liveTagText}>HOY</Text></View>}
                <Text style={styles.matchDate}>
                    {matchDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase()} • {matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            {isAdmin && (
                <TouchableOpacity 
                    style={styles.editBtn}
                    onPress={() => handleEditResult(item)}
                >
                    <Trophy size={14} color={theme.primary} />
                    <Text style={styles.editBtnText}>MARCADOR</Text>
                </TouchableOpacity>
            )}
        </View>

        <View style={styles.matchMain}>
          <View style={styles.teamInfo}>
            <View style={[styles.teamBadgePlaceholder, { backgroundColor: theme.primary + '10' }]} />
            <Text style={styles.teamName} numberOfLines={1}>{item.home_team_name.toUpperCase()}</Text>
          </View>

          <View style={styles.scoreContainer}>
            {isFinished || hasResult ? (
              <View style={styles.scoreBox}>
                <Text style={[styles.scoreText, isFinished && { color: theme.text }]}>{homeScore}</Text>
                <Text style={styles.scoreDash}>-</Text>
                <Text style={[styles.scoreText, isFinished && { color: theme.text }]}>{awayScore}</Text>
              </View>
            ) : (
              <Text style={styles.vsText}>VS</Text>
            )}
          </View>

          <View style={styles.teamInfo}>
            <View style={[styles.teamBadgePlaceholder, { backgroundColor: theme.primary + '10' }]} />
            <Text style={styles.teamName} numberOfLines={1}>{item.away_team_name.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <MapPin size={12} color={theme.textSecondary} />
            <Text style={styles.footerText}>{item.venue_name || 'Campo por definir'}</Text>
          </View>
          {item.status !== 'scheduled' && (
            <Text style={styles.roundText}>{item.status.toUpperCase()}</Text>
          )}
        </View>
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.primary} />
        <Text style={styles.loadingText}>Cargando calendario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        renderItem={renderMatchCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={40} color={theme.textSecondary} opacity={0.3} />
            <Text style={styles.emptyText}>No hay partidos programados para este torneo todavía.</Text>
          </View>
        }
      />

      <MatchResultModal
        visible={isResultModalVisible}
        match={selectedMatch}
        onClose={() => setIsResultModalVisible(false)}
        onSuccess={fetchMatches}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  matchCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveTag: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveTagText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  matchDate: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.textSecondary,
    letterSpacing: 0.5,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: theme.primary + '15',
    borderRadius: 6,
  },
  editBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: theme.primary,
  },
  matchMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  teamInfo: {
    alignItems: 'center',
    width: '35%',
  },
  teamBadgePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  scoreContainer: {
    width: '30%',
    alignItems: 'center',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.textSecondary,
  },
  scoreDash: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.textSecondary,
    opacity: 0.3,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.textSecondary,
    opacity: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 10,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  roundText: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.primary,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    gap: 15,
  },
  emptyText: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
