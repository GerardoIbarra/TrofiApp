import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Tournament, TournamentsResponse } from '@/features/tournaments/types/tournament';
import api from '@/services/api';
import { Trophy, Calendar, ChevronRight, Plus, Copy, CheckCircle2, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CloneTournamentModal } from './CloneTournamentModal';

interface LeagueTournamentsWidgetProps {
  leagueId: string;
  canManage?: boolean;
  onAddTournament?: () => void;
  refreshKey?: number;
}

export function LeagueTournamentsWidget({
  leagueId,
  canManage = false,
  onAddTournament,
  refreshKey = 0,
}: LeagueTournamentsWidgetProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tournamentToClone, setTournamentToClone] = useState<Tournament | null>(null);

  useEffect(() => {
    fetchTournaments();
  }, [leagueId, refreshKey]);

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<TournamentsResponse>(`/v1/tournaments/?league=${leagueId}`);
      setTournaments(response.results || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isTournamentFinished = (tournament: Tournament) => {
    if (tournament.status === 'completed') return true;
    if (!tournament.end_date) return false;
    const endDate = new Date(tournament.end_date);
    return !isNaN(endDate.getTime()) && endDate.getTime() < Date.now();
  };

  const getStatusColor = (tournament: Tournament) => {
    if (isTournamentFinished(tournament)) return '#F59E0B'; // Amber for finished
    switch (tournament.status) {
      case 'active':
        return theme.primary;
      case 'completed':
        return '#4ADE80';
      case 'draft':
        return theme.textSecondary;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusLabel = (tournament: Tournament) => {
    if (isTournamentFinished(tournament)) {
      return t('tournament.status_finished', 'FINALIZADO');
    }
    switch (tournament.status) {
      case 'active':
        return t('tournament.status_active', 'ACTIVO');
      case 'completed':
        return t('tournament.status_completed', 'COMPLETADO');
      case 'draft':
        return t('tournament.status_draft', 'BORRADOR');
      default:
        return tournament.status.toUpperCase();
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
      {/* HEADER DE COMPETICIONES CON BOTÓN DE AGREGAR */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('league_detail.competitions')}</Text>
          <Text style={styles.count}>
            {t('league_detail.tournaments_count', { count: tournaments.length })}
          </Text>
        </View>

        {canManage && onAddTournament && (
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={onAddTournament}
          >
            <Plus size={14} color="#001A2C" />
            <Text style={styles.addButtonText}>
              {t('league_detail.add_tournament', 'Agregar Torneo')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {tournaments.length > 0 ? (
        tournaments.map((tournament) => {
          const finished = isTournamentFinished(tournament);
          const statusColor = getStatusColor(tournament);

          return (
            <View key={tournament.id} style={styles.cardWrapper}>
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({ pathname: '/tournament-detail', params: { id: tournament.id } })
                }
              >
                <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />

                <View style={styles.cardContent}>
                  <View style={styles.topRow}>
                    <Text style={styles.seasonLabel}>
                      {tournament.season_label ? tournament.season_label.toUpperCase() : ''}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        finished && { backgroundColor: 'rgba(245, 158, 11, 0.12)' },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {getStatusLabel(tournament)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.name}>{tournament.name}</Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Calendar size={12} color={theme.textSecondary} />
                      <Text style={styles.metaText}>
                        {new Date(tournament.start_date).toLocaleDateString()} -{' '}
                        {new Date(tournament.end_date).toLocaleDateString()}
                      </Text>
                    </View>
                    {tournament.team_count !== undefined && (
                      <View style={styles.metaItem}>
                        <Trophy size={12} color={theme.textSecondary} />
                        <Text style={styles.metaText}>
                          {t('league_detail.teams_count', { count: tournament.team_count })}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.chevronBox}>
                  <ChevronRight size={20} color={theme.textSecondary} opacity={0.5} />
                </View>
              </TouchableOpacity>

              {/* ACCIÓN RÁPIDA: NUEVA TEMPORADA / CLONAR TORNEO (PUNTO 3 DEL TICKET) */}
              {canManage && (
                <View style={styles.cardFooter}>
                  {finished && (
                    <View style={styles.finishedNotice}>
                      <Clock size={12} color="#F59E0B" />
                      <Text style={styles.finishedNoticeText}>
                        {t('tournament.season_concluded', 'Temporada concluida')}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.cloneButton}
                    activeOpacity={0.7}
                    onPress={() => setTournamentToClone(tournament)}
                  >
                    <Copy size={13} color={theme.primary} />
                    <Text style={styles.cloneButtonText}>
                      {t('tournament.new_season_clone', 'Nueva Temporada')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
      ) : (
        <View style={styles.emptyState}>
          <Trophy size={36} color={theme.textSecondary} opacity={0.25} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>{t('league_detail.no_tournaments')}</Text>

          {canManage && onAddTournament && (
            <TouchableOpacity
              style={styles.emptyAddButton}
              activeOpacity={0.8}
              onPress={onAddTournament}
            >
              <Plus size={16} color="#001A2C" />
              <Text style={styles.emptyAddButtonText}>
                {t('league_detail.create_first_tournament', 'Crear Primer Torneo')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* MODAL DE CLONAR TORNEO A NUEVA TEMPORADA */}
      {tournamentToClone && (
        <CloneTournamentModal
          visible={!!tournamentToClone}
          tournamentId={tournamentToClone.id}
          tournamentName={tournamentToClone.name}
          leagueId={leagueId}
          onClose={() => setTournamentToClone(null)}
          onSuccess={(newTournament) => {
            fetchTournaments();
            setTournamentToClone(null);
            if (newTournament?.id) {
              router.push({
                pathname: '/tournament-detail',
                params: { id: newTournament.id },
              });
            }
          }}
        />
      )}
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
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
      paddingHorizontal: 4,
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
      marginTop: 2,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.primary,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 10,
    },
    addButtonText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#001A2C',
      letterSpacing: 0.5,
    },
    cardWrapper: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      marginBottom: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      elevation: isDark ? 0 : 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 5,
    },
    card: {
      flexDirection: 'row',
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
      fontSize: 10,
      fontWeight: '800',
      color: theme.primary,
      letterSpacing: 0.5,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    },
    statusText: {
      fontSize: 9,
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
      flexWrap: 'wrap',
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
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
    },
    finishedNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    finishedNoticeText: {
      fontSize: 11,
      color: '#F59E0B',
      fontWeight: '700',
    },
    cloneButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: theme.primary + '15',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 8,
      marginLeft: 'auto',
    },
    cloneButtonText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.primary,
    },
    emptyState: {
      padding: 35,
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      marginTop: 8,
    },
    emptyText: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      fontWeight: '500',
    },
    emptyAddButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.primary,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
    },
    emptyAddButtonText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#001A2C',
      letterSpacing: 0.5,
    },
  });
