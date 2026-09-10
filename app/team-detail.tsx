import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Trophy,
  Users,
  Shield,
  Activity,
  Flame,
  ChevronRight,
  Award,
  Calendar,
  Layers,
  Star,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { TeamHeader } from '@/components/teams/TeamHeader';
import { CreateTeamModal } from '@/components/teams/CreateTeamModal';
import {
  useGetTeamProfile,
  useGetTeamHistory,
} from '@/features/teams/services/teamProfileApi';
import { RecentFormItem } from '@/features/teams/types/teamProfile';

const { width } = Dimensions.get('window');

type TabType = 'STATS' | 'ROSTER' | 'LINEUP' | 'HISTORY';

export default function TeamDetailScreen() {
  const { id, tournamentId } = useLocalSearchParams<{
    id: string;
    tournamentId?: string;
  }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [activeTab, setActiveTab] = useState<TabType>('STATS');
  const [selectedTourneyId, setSelectedTourneyId] = useState<string | undefined>(
    tournamentId
  );
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const {
    data: profile,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useGetTeamProfile(id, selectedTourneyId);

  const {
    data: history,
    isLoading: isLoadingHistory,
  } = useGetTeamHistory(id);

  const team = profile?.team;
  const stats = profile?.stats;
  const recentForm = profile?.recent_form || [];
  const streak = profile?.current_streak;
  const roster = profile?.roster || [];
  const lineup = profile?.current_lineup;
  const lineupHistory = profile?.lineup_history || [];

  if (isLoadingProfile && !profile) {
    return (
      <View style={[GlobalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <BackgroundGradient />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!team) {
    return (
      <View style={[GlobalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <BackgroundGradient />
        <Text style={{ color: theme.textSecondary }}>
          No se encontró la información del equipo.
        </Text>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.webContainer}>
          {/* HEADER */}
          <TeamHeader
            team={team}
            onEditPress={() => setIsEditModalVisible(true)}
          />

          {/* TOURNAMENT SELECTOR (if team is registered in multiple) */}
          {team.tournament_registrations && team.tournament_registrations.length > 1 && (
            <View style={styles.tourneyScrollContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tourneyChips}
              >
                {team.tournament_registrations.map((reg) => {
                  const isSelected =
                    reg.tournament === (selectedTourneyId || profile?.tournament_team_id);
                  return (
                    <TouchableOpacity
                      key={reg.id}
                      style={[styles.tourneyChip, isSelected && styles.tourneyChipActive]}
                      onPress={() => setSelectedTourneyId(reg.tournament)}
                      activeOpacity={0.8}
                    >
                      <Trophy size={13} color={isSelected ? '#000' : theme.primary} />
                      <Text
                        style={[
                          styles.tourneyChipText,
                          isSelected && styles.tourneyChipTextActive,
                        ]}
                      >
                        {reg.tournament_name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* HIGHLIGHTS BAR: Position, Current Streak, Recent Form */}
          <View style={styles.highlightsContainer}>
            {/* Position */}
            {profile?.position != null && (
              <View style={styles.highlightBadge}>
                <Trophy size={14} color={theme.primary} />
                <Text style={styles.highlightText}>
                  Posición #{profile.position}
                </Text>
              </View>
            )}

            {/* Streak */}
            {streak && streak.count > 0 && (
              <View
                style={[
                  styles.highlightBadge,
                  streak.type === 'W' && styles.streakWin,
                  streak.type === 'D' && styles.streakDraw,
                  streak.type === 'L' && styles.streakLoss,
                ]}
              >
                <Flame
                  size={14}
                  color={
                    streak.type === 'W'
                      ? '#4ADE80'
                      : streak.type === 'D'
                      ? '#F59E0B'
                      : '#EF4444'
                  }
                />
                <Text
                  style={[
                    styles.highlightText,
                    {
                      color:
                        streak.type === 'W'
                          ? '#4ADE80'
                          : streak.type === 'D'
                          ? '#F59E0B'
                          : '#EF4444',
                    },
                  ]}
                >
                  {streak.count}{' '}
                  {streak.type === 'W'
                    ? 'Victorias seguidas'
                    : streak.type === 'D'
                    ? 'Empates seguidos'
                    : 'Derrotas seguidas'}
                </Text>
              </View>
            )}

            {/* Form */}
            {recentForm.length > 0 && (
              <View style={styles.formPillsRow}>
                <Text style={styles.formLabel}>Forma:</Text>
                {recentForm.map((item, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.formPill,
                      item.outcome === 'W' && styles.formPillWin,
                      item.outcome === 'D' && styles.formPillDraw,
                      item.outcome === 'L' && styles.formPillLoss,
                    ]}
                  >
                    <Text style={styles.formPillText}>{item.outcome}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* TABS */}
          <View
            style={[
              styles.tabsContainer,
              { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' },
            ]}
          >
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'STATS' && styles.tabBtnActive]}
              onPress={() => setActiveTab('STATS')}
            >
              <Text style={[styles.tabText, activeTab === 'STATS' && styles.tabTextActive]}>
                ESTADÍSTICAS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'ROSTER' && styles.tabBtnActive]}
              onPress={() => setActiveTab('ROSTER')}
            >
              <Text style={[styles.tabText, activeTab === 'ROSTER' && styles.tabTextActive]}>
                PLANTILLA ({roster.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'LINEUP' && styles.tabBtnActive]}
              onPress={() => setActiveTab('LINEUP')}
            >
              <Text style={[styles.tabText, activeTab === 'LINEUP' && styles.tabTextActive]}>
                ALINEACIÓN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'HISTORY' && styles.tabBtnActive]}
              onPress={() => setActiveTab('HISTORY')}
            >
              <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.tabTextActive]}>
                HISTORIAL
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB CONTENT */}
          <View style={styles.tabContentContainer}>
            {/* 1. STATS TAB */}
            {activeTab === 'STATS' && (
              <View>
                {stats ? (
                  <>
                    <View style={styles.statsGrid}>
                      <StatTile
                        label="Jugados"
                        value={stats.played}
                        theme={theme}
                        isDark={isDark}
                      />
                      <StatTile
                        label="Victorias"
                        value={stats.wins}
                        color="#4ADE80"
                        theme={theme}
                        isDark={isDark}
                      />
                      <StatTile
                        label="Empates"
                        value={stats.draws}
                        theme={theme}
                        isDark={isDark}
                      />
                      <StatTile
                        label="Derrotas"
                        value={stats.losses}
                        color="#EF4444"
                        theme={theme}
                        isDark={isDark}
                      />
                      <StatTile
                        label="Goles a Favor"
                        value={stats.goals_for}
                        theme={theme}
                        isDark={isDark}
                      />
                      <StatTile
                        label="Goles en Contra"
                        value={stats.goals_against}
                        theme={theme}
                        isDark={isDark}
                      />
                      <StatTile
                        label="Goles / Partido"
                        value={stats.goals_per_game?.toFixed(1) || '0.0'}
                        theme={theme}
                        isDark={isDark}
                      />
                      <StatTile
                        label="Vallas Invictas"
                        value={stats.clean_sheets}
                        color="#00F5FF"
                        theme={theme}
                        isDark={isDark}
                      />
                    </View>

                    {/* Recent Form Details */}
                    {recentForm.length > 0 && (
                      <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>ÚLTIMOS PARTIDOS</Text>
                        {recentForm.map((match, idx) => (
                          <View key={idx} style={styles.recentMatchRow}>
                            <View
                              style={[
                                styles.formPill,
                                match.outcome === 'W' && styles.formPillWin,
                                match.outcome === 'D' && styles.formPillDraw,
                                match.outcome === 'L' && styles.formPillLoss,
                              ]}
                            >
                              <Text style={styles.formPillText}>{match.outcome}</Text>
                            </View>
                            <View style={styles.matchOpponentBox}>
                              <Text style={styles.opponentName}>{match.opponent_name}</Text>
                              <Text style={styles.matchDate}>
                                {new Date(match.date).toLocaleDateString()}
                              </Text>
                            </View>
                            <Text style={styles.matchScoreText}>
                              {match.goals_for} - {match.goals_against}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.emptyCard}>
                    <Activity size={32} color={theme.textSecondary} opacity={0.4} />
                    <Text style={styles.emptyCardText}>
                      No hay estadísticas registradas para este torneo aún.
                    </Text>
                  </View>
                )}

                {/* Info Club */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>INFORMACIÓN DEL CLUB</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Liga de Origen</Text>
                    <Text style={styles.infoValue}>{team.league_name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ciudad</Text>
                    <Text style={styles.infoValue}>{team.city || 'No especificada'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Propietario / Admin</Text>
                    <Text style={styles.infoValue}>{team.owner_name}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 2. ROSTER TAB */}
            {activeTab === 'ROSTER' && (
              <View>
                {roster.length > 0 ? (
                  roster.map((player, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.rosterCard}
                      onPress={() => {
                        if (player.player_id) {
                          router.push({
                            pathname: '/player-detail',
                            params: {
                              playerId: player.player_id,
                              playerName: player.player_name,
                            },
                          });
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.rosterNumberBox}>
                        <Text style={styles.rosterNumberText}>
                          {player.shirt_number ?? '#'}
                        </Text>
                      </View>
                      <View style={styles.rosterInfo}>
                        <View style={styles.rosterNameRow}>
                          <Text style={styles.rosterName}>{player.player_name}</Text>
                          {player.is_captain && (
                            <View style={styles.captainBadge}>
                              <Text style={styles.captainText}>C</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.rosterPosition}>
                          {player.position || 'Jugador'}
                        </Text>
                      </View>
                      <ChevronRight size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyCard}>
                    <Users size={32} color={theme.textSecondary} opacity={0.4} />
                    <Text style={styles.emptyCardText}>
                      No hay jugadores registrados en la plantilla de este torneo.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* 3. LINEUP TAB */}
            {activeTab === 'LINEUP' && (
              <View>
                {lineup ? (
                  <View style={styles.sectionCard}>
                    <View style={styles.lineupHeader}>
                      <Layers size={18} color={theme.primary} />
                      <Text style={styles.lineupTitle}>
                        Alineación Activa: {lineup.formation_name || 'Por definir'}
                      </Text>
                    </View>

                    {lineup.starting_xi && lineup.starting_xi.length > 0 && (
                      <View style={{ marginTop: 12 }}>
                        <Text style={styles.lineupSub}>Once Titular</Text>
                        {lineup.starting_xi.map((player: any, idx: number) => (
                          <View key={idx} style={styles.lineupPlayerRow}>
                            <Text style={styles.lineupPosText}>
                              {player.position || `${idx + 1}`}
                            </Text>
                            <Text style={styles.lineupPlayerName}>
                              {player.player_name || player.name || `Jugador ${idx + 1}`}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {lineup.unavailable && lineup.unavailable.length > 0 && (
                      <View style={{ marginTop: 16 }}>
                        <Text style={[styles.lineupSub, { color: '#EF4444' }]}>
                          No disponibles / Sancionados
                        </Text>
                        {lineup.unavailable.map((player: any, idx: number) => (
                          <View key={idx} style={styles.lineupPlayerRow}>
                            <Text style={[styles.lineupPosText, { color: '#EF4444' }]}>
                              -
                            </Text>
                            <Text style={styles.lineupPlayerName}>
                              {player.player_name || player.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyCard}>
                    <Layers size={32} color={theme.textSecondary} opacity={0.4} />
                    <Text style={styles.emptyCardText}>
                      Este equipo no tiene una alineación táctica activa definida.
                    </Text>
                  </View>
                )}

                {/* Lineup History */}
                {lineupHistory.length > 0 && (
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>HISTORIAL DE ALINEACIONES</Text>
                    {lineupHistory.map((item, idx) => (
                      <View key={idx} style={styles.lineupHistoryItem}>
                        <View>
                          <Text style={styles.lineupHistName}>{item.name}</Text>
                          <Text style={styles.lineupHistFormation}>
                            Formación: {item.formation_name} • {item.player_count} jugadores
                          </Text>
                        </View>
                        {item.is_active && (
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>ACTIVA</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* 4. HISTORY TAB (All Tournaments Career) */}
            {activeTab === 'HISTORY' && (
              <View>
                {isLoadingHistory ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : history ? (
                  <>
                    <View style={styles.historyCareerCard}>
                      <Text style={styles.historyCareerTitle}>HISTORIAL DEL CLUB</Text>
                      <Text style={styles.historyCareerSub}>
                        Desempeño acumulado en todos los torneos oficiales
                      </Text>

                      <View style={styles.careerGrid}>
                        <View style={styles.careerTile}>
                          <Text style={styles.careerValue}>{history.tournaments_played}</Text>
                          <Text style={styles.careerLabel}>Torneos</Text>
                        </View>
                        <View style={styles.careerTile}>
                          <Text style={styles.careerValue}>{history.career_stats.played}</Text>
                          <Text style={styles.careerLabel}>Partidos</Text>
                        </View>
                        <View style={styles.careerTile}>
                          <Text style={[styles.careerValue, { color: '#4ADE80' }]}>
                            {history.career_stats.wins}
                          </Text>
                          <Text style={styles.careerLabel}>Victorias</Text>
                        </View>
                        <View style={styles.careerTile}>
                          <Text style={[styles.careerValue, { color: '#00F5FF' }]}>
                            {history.career_stats.goals_for}
                          </Text>
                          <Text style={styles.careerLabel}>Goles</Text>
                        </View>
                      </View>
                    </View>

                    {/* Achievements By Type */}
                    {history.achievements_by_type && (
                      <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>PALMARÉS Y LOGROS</Text>
                        <View style={styles.trophyRow}>
                          <View style={styles.trophyBox}>
                            <Trophy size={26} color="#F59E0B" />
                            <Text style={styles.trophyCount}>
                              {history.achievements_by_type.champion || 0}
                            </Text>
                            <Text style={styles.trophyLabel}>Campeón</Text>
                          </View>

                          <View style={styles.trophyBox}>
                            <Award size={26} color="#9CA3AF" />
                            <Text style={styles.trophyCount}>
                              {history.achievements_by_type.runner_up || 0}
                            </Text>
                            <Text style={styles.trophyLabel}>Subcampeón</Text>
                          </View>

                          <View style={styles.trophyBox}>
                            <Shield size={26} color="#10B981" />
                            <Text style={styles.trophyCount}>
                              {history.achievements_by_type.fair_play || 0}
                            </Text>
                            <Text style={styles.trophyLabel}>Fair Play</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Achievements List */}
                    {history.achievements && history.achievements.length > 0 && (
                      <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>TODAS LAS DISTINCIONES</Text>
                        {history.achievements.map((ach, idx) => (
                          <View key={idx} style={styles.achRow}>
                            <Star size={16} color={theme.primary} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                              <Text style={styles.achTitle}>{ach.achievement_type}</Text>
                              <Text style={styles.achSub}>
                                {ach.tournament_name || 'Competición oficial'} •{' '}
                                {new Date(ach.created_at).toLocaleDateString()}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.emptyCard}>
                    <Trophy size={32} color={theme.textSecondary} opacity={0.4} />
                    <Text style={styles.emptyCardText}>
                      No hay historial registrado para este club aún.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <CreateTeamModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={() => refetchProfile()}
        initialData={team}
      />
    </View>
  );
}

function StatTile({
  label,
  value,
  color,
  theme,
  isDark,
}: {
  label: string;
  value: any;
  color?: string;
  theme: any;
  isDark: boolean;
}) {
  return (
    <View
      style={[
        tileStyles.tile,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
        },
      ]}
    >
      <Text style={[tileStyles.value, { color: color || theme.text }]}>{value ?? '-'}</Text>
      <Text style={[tileStyles.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const tileStyles = StyleSheet.create({
  tile: {
    width: (width - 64) / 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: 40,
    },
    webContainer: {
      maxWidth: 800,
      width: '100%',
      alignSelf: 'center',
    },
    tourneyScrollContainer: {
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    tourneyChips: {
      gap: 8,
    },
    tourneyChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    tourneyChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    tourneyChipText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    tourneyChipTextActive: {
      color: '#000',
      fontWeight: '800',
    },
    highlightsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      marginTop: 4,
      marginBottom: 12,
    },
    highlightBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.08)' : 'rgba(0, 245, 255, 0.12)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(0, 245, 255, 0.2)',
    },
    highlightText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.primary,
    },
    streakWin: {
      backgroundColor: 'rgba(74, 222, 128, 0.1)',
      borderColor: 'rgba(74, 222, 128, 0.25)',
    },
    streakDraw: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.25)',
    },
    streakLoss: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    formPillsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginLeft: 'auto',
    },
    formLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
      marginRight: 2,
    },
    formPill: {
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#6B7280',
    },
    formPillWin: {
      backgroundColor: '#10B981',
    },
    formPillDraw: {
      backgroundColor: '#F59E0B',
    },
    formPillLoss: {
      backgroundColor: '#EF4444',
    },
    formPillText: {
      fontSize: 10,
      fontWeight: '900',
      color: '#FFF',
    },
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      marginTop: 4,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabBtnActive: {
      borderBottomColor: theme.primary,
    },
    tabText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
    tabTextActive: {
      color: theme.primary,
      fontWeight: '800',
    },
    tabContentContainer: {
      padding: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    sectionCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '900',
      color: theme.primary,
      letterSpacing: 1.2,
      marginBottom: 12,
    },
    recentMatchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
    },
    matchOpponentBox: {
      flex: 1,
      marginLeft: 12,
    },
    opponentName: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
    matchDate: {
      fontSize: 10,
      color: theme.textSecondary,
      marginTop: 2,
    },
    matchScoreText: {
      fontSize: 15,
      fontWeight: '900',
      color: theme.text,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
    },
    infoLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    infoValue: {
      fontSize: 12,
      color: theme.text,
      fontWeight: '700',
    },
    rosterCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      padding: 12,
      borderRadius: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
    },
    rosterNumberBox: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.08)' : 'rgba(0, 245, 255, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    rosterNumberText: {
      fontSize: 13,
      fontWeight: '900',
      color: theme.primary,
    },
    rosterInfo: {
      flex: 1,
    },
    rosterNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    rosterName: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
    },
    captainBadge: {
      backgroundColor: '#F59E0B',
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
    },
    captainText: {
      fontSize: 9,
      fontWeight: '900',
      color: '#000',
    },
    rosterPosition: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    lineupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    lineupTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
    },
    lineupSub: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    lineupPlayerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
    },
    lineupPosText: {
      width: 35,
      fontSize: 11,
      fontWeight: '800',
      color: theme.primary,
    },
    lineupPlayerName: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
    },
    lineupHistoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
    },
    lineupHistName: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
    lineupHistFormation: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    activePill: {
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(0, 245, 255, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    activePillText: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.primary,
    },
    historyCareerCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    historyCareerTitle: {
      fontSize: 13,
      fontWeight: '900',
      color: theme.primary,
      letterSpacing: 1,
    },
    historyCareerSub: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
      marginBottom: 16,
    },
    careerGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    careerTile: {
      alignItems: 'center',
    },
    careerValue: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.text,
    },
    careerLabel: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    trophyRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 10,
    },
    trophyBox: {
      alignItems: 'center',
    },
    trophyCount: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.text,
      marginTop: 6,
    },
    trophyLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
      marginTop: 2,
    },
    achRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
    },
    achTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
    achSub: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    emptyCard: {
      padding: 30,
      backgroundColor: theme.surface,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    emptyCardText: {
      color: theme.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 10,
    },
  });
