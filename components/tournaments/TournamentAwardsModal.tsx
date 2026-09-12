import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Trophy,
  Award,
  Medal,
  Star,
  ShieldCheck,
  Calendar,
  X,
  CheckCircle,
  Users,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import {
  useDetermineChampion,
  useCrownSeasonAwards,
  useComputeWeeklyMVP,
} from '@/features/tournaments/services/tournamentApi';
import {
  DetermineChampionResponse,
  CrownSeasonAwardsResponse,
  ComputeWeeklyMVPResponse,
} from '@/features/tournaments/types/tournamentAwards';
import { useAwardTeamAchievement } from '@/features/teams/services/teamProfileApi';
import api from '@/services/api';

interface TournamentAwardsModalProps {
  visible: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentName?: string;
  championDetermination?: string; // 'standings' | 'playoffs'
}

type TabType = 'CHAMPION' | 'SEASON_AWARDS' | 'WEEKLY_MVP' | 'TEAM_ACHIEVEMENTS';

export function TournamentAwardsModal({
  visible,
  onClose,
  tournamentId,
  tournamentName,
  championDetermination = 'standings',
}: TournamentAwardsModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [activeTab, setActiveTab] = useState<TabType>('CHAMPION');

  const [championResult, setChampionResult] = useState<DetermineChampionResponse | null>(null);
  const [seasonResult, setSeasonResult] = useState<CrownSeasonAwardsResponse | null>(null);
  const [weeklyResult, setWeeklyResult] = useState<ComputeWeeklyMVPResponse | null>(null);

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedAchievementType, setSelectedAchievementType] = useState<
    'fair_play' | 'unbeaten_season' | 'top_scoring_team'
  >('fair_play');
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  const determineChampionMutation = useDetermineChampion();
  const crownSeasonAwardsMutation = useCrownSeasonAwards();
  const computeWeeklyMVPMutation = useComputeWeeklyMVP();
  const awardTeamAchievementMutation = useAwardTeamAchievement();

  const fetchTeams = async () => {
    if (teams.length > 0) return;
    setIsLoadingTeams(true);
    try {
      const response = await api.get<any[]>(`/v1/standings/by_tournament/?tournament_id=${tournamentId}`);
      const mapped = response.map((item) => ({
        id: item.team_id || item.team?.id || item.tournament_team,
        name: item.team_name || item.team?.name || 'Equipo',
      }));
      setTeams(mapped);
      if (mapped.length > 0 && !selectedTeamId) {
        setSelectedTeamId(mapped[0].id);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleAwardTeam = async () => {
    if (!selectedTeamId) {
      Alert.alert('Selecciona un equipo', 'Elige al equipo que recibirá el logro.');
      return;
    }
    try {
      await awardTeamAchievementMutation.mutateAsync({
        team: selectedTeamId,
        tournament: tournamentId,
        achievement_type: selectedAchievementType,
      });
      Alert.alert('¡Logro Otorgado!', 'El logro ha sido asignado al equipo exitosamente.');
    } catch (err: any) {
      Alert.alert('Error al otorgar logro', err?.message || 'No se pudo otorgar el logro al equipo.');
    }
  };

  const handleDetermineChampion = () => {
    Alert.alert(
      'Coronar Campeón',
      `¿Confirmas calcular y coronar al campeón mediante la regla '${championDetermination.toUpperCase()}'? Esto otorgará los logros de campeón a los equipos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Coronar Ahora',
          onPress: async () => {
            try {
              const res = await determineChampionMutation.mutateAsync(tournamentId);
              setChampionResult(res);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo determinar al campeón. Asegúrate de que se hayan jugado partidos.');
            }
          },
        },
      ]
    );
  };

  const handleCrownSeasonAwards = async () => {
    try {
      const res = await crownSeasonAwardsMutation.mutateAsync(tournamentId);
      setSeasonResult(res);
      Alert.alert('Premios Asignados', 'Se han otorgado los logros de goleador, asistencias, fair play y Once Ideal.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudieron calcular los premios de la temporada.');
    }
  };

  const handleComputeWeeklyMVP = async () => {
    try {
      const res = await computeWeeklyMVPMutation.mutateAsync({ tournamentId });
      setWeeklyResult(res);
      if (res.winner) {
        Alert.alert('¡MVP Calculado!', `${res.winner.name} ha ganado el MVP de la semana.`);
      } else {
        Alert.alert('Sin Ganador', 'No se encontraron jugadores calificados en esta semana.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo calcular el MVP semanal.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.overline}>ADMINISTRACIÓN DE PREMIOS</Text>
              <Text style={styles.title} numberOfLines={1}>
                {tournamentName || 'Premios & Campeones'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'CHAMPION' && styles.tabBtnActive]}
              onPress={() => setActiveTab('CHAMPION')}
            >
              <Trophy size={14} color={activeTab === 'CHAMPION' ? '#001A2C' : theme.textSecondary} />
              <Text style={[styles.tabBtnText, activeTab === 'CHAMPION' && styles.tabBtnTextActive]}>
                Campeón
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'SEASON_AWARDS' && styles.tabBtnActive]}
              onPress={() => setActiveTab('SEASON_AWARDS')}
            >
              <Award size={14} color={activeTab === 'SEASON_AWARDS' ? '#001A2C' : theme.textSecondary} />
              <Text style={[styles.tabBtnText, activeTab === 'SEASON_AWARDS' && styles.tabBtnTextActive]}>
                Temporada
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'WEEKLY_MVP' && styles.tabBtnActive]}
              onPress={() => setActiveTab('WEEKLY_MVP')}
            >
              <Star size={14} color={activeTab === 'WEEKLY_MVP' ? '#001A2C' : theme.textSecondary} />
              <Text style={[styles.tabBtnText, activeTab === 'WEEKLY_MVP' && styles.tabBtnTextActive]}>
                MVP Semana
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'TEAM_ACHIEVEMENTS' && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab('TEAM_ACHIEVEMENTS');
                fetchTeams();
              }}
            >
              <Users size={14} color={activeTab === 'TEAM_ACHIEVEMENTS' ? '#001A2C' : theme.textSecondary} />
              <Text style={[styles.tabBtnText, activeTab === 'TEAM_ACHIEVEMENTS' && styles.tabBtnTextActive]}>
                Equipos
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
            {/* TAB 1: CORONAR CAMPEÓN */}
            {activeTab === 'CHAMPION' && (
              <View style={styles.sectionContainer}>
                <View style={styles.infoBanner}>
                  <Text style={styles.infoBannerTitle}>
                    Regla de Coronación: <Text style={{ color: theme.primary }}>{championDetermination.toUpperCase()}</Text>
                  </Text>
                  <Text style={styles.infoBannerSub}>
                    {championDetermination === 'standings'
                      ? 'Corona al 1°, 2° y 3° lugar de la tabla de posiciones acumulada.'
                      : 'Corona al ganador y finalista de la llave de playoffs (final y 3er puesto).'}
                  </Text>
                </View>

                {championResult ? (
                  <View style={styles.podiumWrapper}>
                    <Text style={styles.podiumHeader}>🏆 PODIO OFICIAL</Text>

                    {/* 1st Place */}
                    <View style={[styles.podiumCard, styles.goldPodium]}>
                      <View style={styles.podiumRankBadge}>
                        <Text style={styles.rankNum}>1°</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.podiumTitle}>CAMPEÓN</Text>
                        <Text style={styles.podiumTeamName}>{championResult.champion.name}</Text>
                      </View>
                      <Trophy size={28} color="#FFD700" />
                    </View>

                    {/* 2nd Place */}
                    {championResult.runner_up && (
                      <View style={[styles.podiumCard, styles.silverPodium]}>
                        <View style={[styles.podiumRankBadge, { backgroundColor: '#A0A0A0' }]}>
                          <Text style={styles.rankNum}>2°</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.podiumTitle}>SUBCAMPEÓN</Text>
                          <Text style={styles.podiumTeamName}>{championResult.runner_up.name}</Text>
                        </View>
                        <Medal size={24} color="#E0E0E0" />
                      </View>
                    )}

                    {/* 3rd Place */}
                    {championResult.third_place && (
                      <View style={[styles.podiumCard, styles.bronzePodium]}>
                        <View style={[styles.podiumRankBadge, { backgroundColor: '#CD7F32' }]}>
                          <Text style={styles.rankNum}>3°</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.podiumTitle}>TERCER PUESTO</Text>
                          <Text style={styles.podiumTeamName}>{championResult.third_place.name}</Text>
                        </View>
                        <Medal size={24} color="#CD7F32" />
                      </View>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.primaryActionBtn, determineChampionMutation.isPending && { opacity: 0.6 }]}
                    onPress={handleDetermineChampion}
                    disabled={determineChampionMutation.isPending}
                  >
                    {determineChampionMutation.isPending ? (
                      <ActivityIndicator size="small" color="#001A2C" />
                    ) : (
                      <>
                        <Trophy size={18} color="#001A2C" />
                        <Text style={styles.primaryActionBtnText}>Determinar y Coronar Campeón</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* TAB 2: PREMIOS DE TEMPORADA */}
            {activeTab === 'SEASON_AWARDS' && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionDesc}>
                  Calcula de forma automática los máximos goleadores, asistentes, el equipo más disciplinado (Fair Play) y la alineación del Once Ideal.
                </Text>

                {seasonResult ? (
                  <View style={styles.awardsGrid}>
                    {/* Top Scorers */}
                    <View style={styles.awardCard}>
                      <View style={styles.awardCardHeader}>
                        <Award size={18} color="#FFD700" />
                        <Text style={styles.awardCardTitle}>MÁXIMO GOLEADOR (BOTÍN DE ORO)</Text>
                      </View>
                      {seasonResult.top_scorers.map((p) => (
                        <Text key={p.id} style={styles.awardWinnerName}>⚽ {p.name}</Text>
                      ))}
                    </View>

                    {/* Most Assists */}
                    <View style={styles.awardCard}>
                      <View style={styles.awardCardHeader}>
                        <Award size={18} color={theme.primary} />
                        <Text style={styles.awardCardTitle}>LÍDER DE ASISTENCIAS</Text>
                      </View>
                      {seasonResult.most_assists.map((p) => (
                        <Text key={p.id} style={styles.awardWinnerName}>🎯 {p.name}</Text>
                      ))}
                    </View>

                    {/* Fair Play */}
                    <View style={styles.awardCard}>
                      <View style={styles.awardCardHeader}>
                        <ShieldCheck size={18} color="#10B981" />
                        <Text style={styles.awardCardTitle}>EQUIPO FAIR PLAY</Text>
                      </View>
                      {seasonResult.fair_play_teams.map((t) => (
                        <Text key={t.id} style={styles.awardWinnerName}>🛡️ {t.name}</Text>
                      ))}
                    </View>

                    {/* Best XI */}
                    {seasonResult.best_xi && seasonResult.best_xi.length > 0 && (
                      <View style={styles.awardCard}>
                        <View style={styles.awardCardHeader}>
                          <Users size={18} color="#A855F7" />
                          <Text style={styles.awardCardTitle}>ONCE IDEAL (BEST XI)</Text>
                        </View>
                        {seasonResult.best_xi.map((p) => (
                          <View key={p.id} style={styles.bestXIRow}>
                            <Text style={styles.bestXIName}>⭐ {p.name}</Text>
                            {p.metadata?.avg_rating && (
                              <Text style={styles.bestXIRating}>Prom. {p.metadata.avg_rating}</Text>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.primaryActionBtn, crownSeasonAwardsMutation.isPending && { opacity: 0.6 }]}
                    onPress={handleCrownSeasonAwards}
                    disabled={crownSeasonAwardsMutation.isPending}
                  >
                    {crownSeasonAwardsMutation.isPending ? (
                      <ActivityIndicator size="small" color="#001A2C" />
                    ) : (
                      <>
                        <Award size={18} color="#001A2C" />
                        <Text style={styles.primaryActionBtnText}>Calcular y Asignar Premios</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* TAB 3: MVP DE LA SEMANA */}
            {activeTab === 'WEEKLY_MVP' && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionDesc}>
                  Pondera el promedio de calificación y los MVP de partido obtenidos en los últimos 7 días para otorgar el logro 'mvp_week'.
                </Text>

                {weeklyResult ? (
                  <View style={styles.weeklyResultBox}>
                    <View style={styles.starCircle}>
                      <Star size={36} color="#FFD700" fill="#FFD700" />
                    </View>
                    <Text style={styles.weeklyWinnerTitle}>JUGADOR MVP DE LA SEMANA</Text>
                    <Text style={styles.weeklyWinnerName}>
                      {weeklyResult.winner ? weeklyResult.winner.name : 'Sin ganador en este periodo'}
                    </Text>
                    <Text style={styles.weeklyDates}>
                      Semana: {new Date(weeklyResult.week_start).toLocaleDateString()} - {new Date(weeklyResult.week_end).toLocaleDateString()}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.primaryActionBtn, computeWeeklyMVPMutation.isPending && { opacity: 0.6 }]}
                    onPress={handleComputeWeeklyMVP}
                    disabled={computeWeeklyMVPMutation.isPending}
                  >
                    {computeWeeklyMVPMutation.isPending ? (
                      <ActivityIndicator size="small" color="#001A2C" />
                    ) : (
                      <>
                        <Star size={18} color="#001A2C" />
                        <Text style={styles.primaryActionBtnText}>Calcular MVP de los Últimos 7 Días</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* TAB 4: LOGROS MANUALES DE EQUIPO (TICKET 18 SEC. 5) */}
            {activeTab === 'TEAM_ACHIEVEMENTS' && (
              <View style={styles.sectionContainer}>
                <View style={styles.infoBanner}>
                  <Text style={styles.infoBannerTitle}>Logros de Equipo (Manuales)</Text>
                  <Text style={styles.infoBannerSub}>
                    Otorga reconocimientos oficiales (Fair Play, Temporada Invicta, Equipo Goleador) al club que elijas.
                  </Text>
                </View>

                {/* Achievement type picker */}
                <Text style={styles.fieldLabel}>TIPO DE LOGRO</Text>
                <View style={styles.achievementTypeGrid}>
                  {[
                    { id: 'fair_play', label: 'Fair Play', desc: 'Juego Limpio' },
                    { id: 'unbeaten_season', label: 'Invicto', desc: 'Sin derrotas' },
                    { id: 'top_scoring_team', label: 'Más Goleador', desc: 'Máxima anotación' },
                  ].map((ach) => (
                    <TouchableOpacity
                      key={ach.id}
                      style={[
                        styles.achOptionCard,
                        selectedAchievementType === ach.id && styles.achOptionCardActive,
                      ]}
                      onPress={() => setSelectedAchievementType(ach.id as any)}
                    >
                      <Award
                        size={16}
                        color={selectedAchievementType === ach.id ? theme.primary : theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.achOptionTitle,
                          selectedAchievementType === ach.id && { color: theme.primary, fontWeight: '800' },
                        ]}
                      >
                        {ach.label}
                      </Text>
                      <Text style={styles.achOptionDesc}>{ach.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Team selection */}
                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>SELECCIONAR EQUIPO</Text>
                {isLoadingTeams ? (
                  <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 10 }} />
                ) : teams.length > 0 ? (
                  <View style={styles.teamsListWrap}>
                    {teams.map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.teamSelectChip,
                          selectedTeamId === t.id && styles.teamSelectChipActive,
                        ]}
                        onPress={() => setSelectedTeamId(t.id)}
                      >
                        <ShieldCheck
                          size={14}
                          color={selectedTeamId === t.id ? '#001A2C' : theme.textSecondary}
                        />
                        <Text
                          style={[
                            styles.teamSelectChipText,
                            selectedTeamId === t.id && styles.teamSelectChipTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {t.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No se encontraron equipos registrados en este torneo.</Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryActionBtn,
                    (!selectedTeamId || awardTeamAchievementMutation.isPending) && { opacity: 0.6 },
                    { marginTop: 16 },
                  ]}
                  onPress={handleAwardTeam}
                  disabled={!selectedTeamId || awardTeamAchievementMutation.isPending}
                >
                  {awardTeamAchievementMutation.isPending ? (
                    <ActivityIndicator size="small" color="#001A2C" />
                  ) : (
                    <>
                      <Medal size={18} color="#001A2C" />
                      <Text style={styles.primaryActionBtnText}>Otorgar Logro al Equipo</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalCard: {
      width: '100%',
      maxWidth: 480,
      maxHeight: '85%',
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    overline: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
      color: theme.primary,
      marginBottom: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.text,
    },
    closeBtn: {
      padding: 6,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    tabsRow: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      padding: 4,
      borderRadius: 12,
      marginBottom: 16,
      gap: 6,
    },
    tabBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: 9,
      gap: 6,
    },
    tabBtnActive: {
      backgroundColor: theme.primary,
    },
    tabBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    tabBtnTextActive: {
      color: '#001A2C',
      fontWeight: '900',
    },
    scrollBody: {
      flexGrow: 0,
    },
    sectionContainer: {
      gap: 14,
      paddingBottom: 8,
    },
    sectionDesc: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 17,
    },
    infoBanner: {
      padding: 12,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      gap: 4,
    },
    infoBannerTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.text,
    },
    infoBannerSub: {
      fontSize: 11,
      color: theme.textSecondary,
      lineHeight: 15,
    },
    primaryActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 14,
      gap: 8,
      marginTop: 6,
    },
    primaryActionBtnText: {
      fontSize: 13,
      fontWeight: '900',
      color: '#001A2C',
    },
    podiumWrapper: {
      gap: 10,
      marginTop: 4,
    },
    podiumHeader: {
      fontSize: 13,
      fontWeight: '900',
      color: theme.text,
      letterSpacing: 1,
      marginBottom: 2,
    },
    podiumCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      gap: 12,
    },
    goldPodium: {
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    silverPodium: {
      backgroundColor: 'rgba(224, 224, 224, 0.08)',
      borderColor: 'rgba(224, 224, 224, 0.25)',
    },
    bronzePodium: {
      backgroundColor: 'rgba(205, 127, 50, 0.08)',
      borderColor: 'rgba(205, 127, 50, 0.25)',
    },
    podiumRankBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#FFD700',
      justifyContent: 'center',
      alignItems: 'center',
    },
    rankNum: {
      fontSize: 13,
      fontWeight: '900',
      color: '#001A2C',
    },
    podiumTitle: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: theme.textSecondary,
    },
    podiumTeamName: {
      fontSize: 15,
      fontWeight: '900',
      color: theme.text,
    },
    awardsGrid: {
      gap: 10,
    },
    awardCard: {
      padding: 12,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      gap: 6,
    },
    awardCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    awardCardTitle: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: theme.textSecondary,
    },
    awardWinnerName: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text,
      marginLeft: 4,
    },
    bestXIRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 2,
    },
    bestXIName: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
    },
    bestXIRating: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.primary,
    },
    weeklyResultBox: {
      alignItems: 'center',
      padding: 18,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      gap: 8,
    },
    starCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255, 215, 0, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    weeklyWinnerTitle: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      color: theme.primary,
    },
    weeklyWinnerName: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.text,
    },
    weeklyDates: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: theme.textSecondary,
      marginBottom: 6,
    },
    achievementTypeGrid: {
      flexDirection: 'row',
      gap: 8,
    },
    achOptionCard: {
      flex: 1,
      padding: 10,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      alignItems: 'center',
      gap: 4,
    },
    achOptionCardActive: {
      borderColor: theme.primary,
      backgroundColor: isDark ? 'rgba(0, 240, 255, 0.08)' : 'rgba(0, 240, 255, 0.05)',
    },
    achOptionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
    },
    achOptionDesc: {
      fontSize: 9,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    teamsListWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    teamSelectChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    },
    teamSelectChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    teamSelectChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text,
    },
    teamSelectChipTextActive: {
      color: '#001A2C',
      fontWeight: '800',
    },
    emptyText: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
      marginVertical: 12,
    },
  });
