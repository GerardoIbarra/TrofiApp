import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import api from '@/services/api';
import { Match } from '@/features/tournaments/types/match';
import { MatchLineupResponse, MatchHeadToHeadResponse, MatchTimelineResponse, MatchEvent } from '@/features/tournaments/types/matchDetail';
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Users, 
  BarChart3, 
  History, 
  Info,
  Clock,
  Shield,
  User,
  ArrowRightLeft,
  AlertCircle,
  Video
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  
  const [activeTab, setActiveTab] = useState<'RESUMEN' | 'TIMELINE' | 'ALINEACION' | 'ESTADISTICAS'>('RESUMEN');
  const [match, setMatch] = useState<Match | null>(null);
  const [lineup, setLineup] = useState<MatchLineupResponse | null>(null);
  const [h2h, setH2h] = useState<MatchHeadToHeadResponse | null>(null);
  const [timeline, setTimeline] = useState<MatchTimelineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMatchData();
    }
  }, [id]);

  const fetchMatchData = async () => {
    setIsLoading(true);
    try {
      // 1. Cargar datos básicos del partido
      const matchData = await api.get<Match>(`/v1/matches/${id}/`);
      setMatch(matchData);

      // 2. Cargar Alineación
      try {
        const lineupData = await api.get<MatchLineupResponse>(`/v1/matches/${id}/lineup/`);
        setLineup(lineupData);
      } catch (e) { console.log('Alineación no disponible'); }

      // 3. Cargar Head to Head
      try {
        const h2hData = await api.get<MatchHeadToHeadResponse>(`/v1/matches/${id}/head-to-head/`);
        setH2h(h2hData);
      } catch (e) { console.log('Estadísticas no disponibles'); }

      // 4. Cargar Timeline
      try {
        const timelineData = await api.get<MatchTimelineResponse>(`/v1/matches/${id}/timeline/`);
        setTimeline(timelineData);
      } catch (e) { console.log('Timeline no disponible'); }

    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const SummaryTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Info size={18} color={theme.primary} />
          <Text style={styles.sectionTitle}>{t("match_detail.section_encounter")}</Text>
        </View>
        
        <View style={styles.detailCard}>
          <View style={styles.detailItem}>
            <Calendar size={20} color={theme.textSecondary} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>{t("match_detail.label_datetime")}</Text>
              <Text style={styles.detailValue}>
                {match ? new Date(match.start_datetime).toLocaleDateString('es-ES', { 
                  weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
                }) : '---'}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <MapPin size={20} color={theme.textSecondary} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>{t("match_detail.label_venue")}</Text>
              <Text style={styles.detailValue}>{match?.venue_name || 'Estadio por definir'}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <User size={20} color={theme.textSecondary} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>{t("match_detail.label_referee")}</Text>
              <Text style={styles.detailValue}>{match?.referee_name || 'Por designar'}</Text>
            </View>
          </View>
        </View>
      </View>

      {h2h && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <History size={18} color={theme.primary} />
            <Text style={styles.sectionTitle}>{t("match_detail.section_form")}</Text>
          </View>
          <View style={styles.recentFormContainer}>
            <View style={styles.formCol}>
              <Text style={styles.formTeamLabel}>{match?.home_team_name}</Text>
              <View style={styles.formRow}>
                {h2h.home_recent_form.map((f, i) => (
                  <View key={i} style={[styles.formIndicator, styles[`outcome${f.outcome}`]]}>
                    <Text style={styles.formIndicatorText}>{f.outcome}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.formCol}>
              <Text style={styles.formTeamLabel}>{match?.away_team_name}</Text>
              <View style={styles.formRow}>
                {h2h.away_recent_form.map((f, i) => (
                  <View key={i} style={[styles.formIndicator, styles[`outcome${f.outcome}`]]}>
                    <Text style={styles.formIndicatorText}>{f.outcome}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const TimelineTab = () => {
    const events = timeline?.results || [];
    if (events.length === 0) return (
      <View style={styles.emptyContainer}>
        <Clock size={48} color={theme.textSecondary} opacity={0.3} />
        <Text style={styles.emptyText}>{t("match_detail.timeline_empty")}</Text>
      </View>
    );

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.timelineContainer}>
          <View style={styles.timelineLine} />
          {events.map((event, index) => {
            const isHome = event.team_name === match?.home_team_name;
            return (
              <View key={event.id} style={[styles.timelineItem, isHome ? styles.timelineHome : styles.timelineAway]}>
                <View style={[styles.eventContent, isHome ? styles.eventContentHome : styles.eventContentAway]}>
                  <View style={styles.eventMainInfo}>
                    {event.event_type === 'goal' && <Text style={styles.eventTitle}>{t("match_detail.event_goal")}</Text>}
                    {event.event_type === 'substitution' && <Text style={styles.eventTitle}>{t("match_detail.event_sub")}</Text>}
                    {event.event_type === 'yellow_card' && <Text style={styles.eventTitle}>{t("match_detail.event_yellow")}</Text>}
                    {event.event_type === 'red_card' && <Text style={styles.eventTitle}>{t("match_detail.event_red")}</Text>}
                    {event.event_type === 'var' && <Text style={styles.eventTitle}>{t("match_detail.event_var")}</Text>}
                    
                    <Text style={styles.eventPlayer}>{event.player_name}</Text>
                    {event.metadata && (
                      <Text style={styles.eventSubPlayer}>{event.metadata}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.minuteBadgeContainer}>
                  <View style={styles.minuteBadge}>
                    <Text style={styles.minuteText}>{event.minute}'</Text>
                  </View>
                  <View style={styles.eventIconCircle}>
                    {event.event_type === 'goal' && <Shield size={14} color={theme.primary} />}
                    {event.event_type === 'substitution' && <ArrowRightLeft size={14} color={theme.primary} />}
                    {event.event_type === 'yellow_card' && <AlertCircle size={14} color="#FFD700" />}
                    {event.event_type === 'red_card' && <AlertCircle size={14} color="#FF4444" />}
                    {event.event_type === 'var' && <Video size={14} color={theme.primary} />}
                  </View>
                </View>
                
                <View style={{ flex: 1 }} />
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const LineupTab = () => {
    if (!lineup) return (
      <View style={styles.emptyContainer}>
        <Users size={48} color={theme.textSecondary} opacity={0.3} />
        <Text style={styles.emptyText}>{t("match_detail.lineup_empty")}</Text>
      </View>
    );

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.lineupHeader}>
           <Text style={styles.formationLabel}>{lineup.home.team_name} ({lineup.home.formation_name})</Text>
        </View>
        
        {/* Pitch visualization placeholder */}
        <View style={styles.pitchContainer}>
          <LinearGradient colors={['#2E7D32', '#1B5E20']} style={styles.pitch}>
             {/* Simple visualization of starting XI */}
             <View style={styles.pitchArea}>
                {lineup.home.starting_xi.slice(0, 1).map((p, i) => (
                   <View key={i} style={styles.playerNode}>
                      <View style={styles.playerAvatarSmall}>
                        {p.photo ? <Image source={{uri: p.photo}} style={styles.fullImage} /> : <User size={20} color="#FFF" />}
                      </View>
                      <Text style={styles.playerNodeName}>{p.player_name.split(' ')[0]}</Text>
                      <View style={styles.shirtNumberBadge}><Text style={styles.shirtNumberText}>{p.shirt_number}</Text></View>
                   </View>
                ))}
             </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>{t("match_detail.players_list")}</Text>
          {lineup.home.starting_xi.map((p, i) => (
            <View key={i} style={styles.playerListItem}>
              <View style={styles.playerListItemInfo}>
                <View style={styles.playerAvatarSmall}>
                   {p.photo ? <Image source={{uri: p.photo}} style={styles.fullImage} /> : <User size={16} color="#FFF" />}
                </View>
                <Text style={styles.playerListItemName}>{p.player_name}</Text>
              </View>
              <Text style={styles.playerListItemNumber}>#{p.shirt_number}</Text>
            </View>
          ))}
        </View>

        {lineup.home.unavailable.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.subTitle, { color: '#FF4444' }]}>{t("match_detail.unavailable_players")}</Text>
            {lineup.home.unavailable.map((p, i) => (
              <View key={i} style={styles.playerListItem}>
                <View style={styles.playerListItemInfo}>
                  <View style={[styles.playerAvatarSmall, { backgroundColor: '#FF4444' }]}>
                     <Shield size={14} color="#FFF" />
                  </View>
                  <View>
                    <Text style={styles.playerListItemName}>{p.player_name}</Text>
                    <Text style={styles.unavailableReason}>{p.reason}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const StatsTab = () => {
    if (!h2h) return (
      <View style={styles.emptyContainer}>
        <BarChart3 size={48} color={theme.textSecondary} opacity={0.3} />
        <Text style={styles.emptyText}>{t("match_detail.stats_empty")}</Text>
      </View>
    );

    const StatRow = ({ label, home, away, isHigherBetter = true }: any) => {
      const homeVal = parseFloat(home);
      const awayVal = parseFloat(away);
      const isHomeBetter = isHigherBetter ? homeVal > awayVal : homeVal < awayVal;
      const isAwayBetter = isHigherBetter ? awayVal > homeVal : awayVal < homeVal;

      return (
        <View style={styles.statRow}>
          <Text style={[styles.statValueSmall, isHomeBetter && { color: theme.primary, fontWeight: '800' }]}>{home}</Text>
          <Text style={styles.statLabelSmall}>{label}</Text>
          <Text style={[styles.statValueSmall, isAwayBetter && { color: theme.primary, fontWeight: '800' }]}>{away}</Text>
        </View>
      );
    };

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.h2hSummary}>
           <Text style={styles.subTitle}>{t("match_detail.h2h_history")}</Text>
           <View style={styles.h2hBar}>
              <View style={[styles.h2hSegment, { flex: h2h.head_to_head.home_win_pct || 1, backgroundColor: theme.primary }]} />
              <View style={[styles.h2hSegment, { flex: h2h.head_to_head.draw_pct || 1, backgroundColor: theme.textSecondary + '40' }]} />
              <View style={[styles.h2hSegment, { flex: h2h.head_to_head.away_win_pct || 1, backgroundColor: '#FF4444' }]} />
           </View>
           <View style={styles.h2hLabels}>
              <Text style={styles.h2hLabelText}>{h2h.head_to_head.home_wins} {t("match_detail.wins_local")}</Text>
              <Text style={styles.h2hLabelText}>{h2h.head_to_head.draws} {t("match_detail.draws")}</Text>
              <Text style={styles.h2hLabelText}>{h2h.head_to_head.away_wins} {t("match_detail.wins_visitor")}</Text>
           </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>{t("match_detail.current_season")}</Text>
          <StatRow label={t("match_detail.stat_position")} home={h2h.home_season_stats.position} away={h2h.away_season_stats.position} isHigherBetter={false} />
          <StatRow label={t("match_detail.stat_goals_pg")} home={h2h.home_season_stats.goals_per_game} away={h2h.away_season_stats.goals_per_game} />
          <StatRow label={t("match_detail.stat_goals_conceded")} home={h2h.home_season_stats.goals_conceded_per_game} away={h2h.away_season_stats.goals_conceded_per_game} isHigherBetter={false} />
          <StatRow label={t("match_detail.stat_clean_sheets")} home={h2h.home_season_stats.clean_sheets} away={h2h.away_season_stats.clean_sheets} />
          <StatRow label={t("match_detail.stat_wins")} home={h2h.home_season_stats.wins} away={h2h.away_season_stats.wins} />
        </View>
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <BackgroundGradient />
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      
      {/* Header with Back Button */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{match?.tournament_name}</Text>
        <View style={{ width: 28 }} />
      </SafeAreaView>

      {/* Match Score Area */}
      <View style={styles.scoreArea}>
        <View style={styles.teamBox}>
          <View style={styles.badgeContainer}>
             <Shield size={40} color={theme.primary} opacity={0.2} />
          </View>
          <Text style={styles.teamNameMain}>{match?.home_team_name}</Text>
        </View>

        <View style={styles.scoreResult}>
          {match?.status === 'scheduled' ? (
            <View style={styles.scheduledInfo}>
              <Text style={styles.scheduledTime}>{new Date(match.start_datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={styles.scheduledDate}>{t("match_detail.tomorrow")}</Text>
            </View>
          ) : (
            <View style={styles.liveScoreContainer}>
              <Text style={styles.liveScore}>{match?.result?.home_score ?? 0} - {match?.result?.away_score ?? 0}</Text>
              {match?.status === 'live' && (
                <View style={styles.liveIndicator}>
                  <Text style={styles.liveText}>{match.current_minute}'</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.teamBox}>
          <View style={styles.badgeContainer}>
             <Shield size={40} color={theme.primary} opacity={0.2} />
          </View>
          <Text style={styles.teamNameMain}>{match?.away_team_name}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        {(['RESUMEN', 'TIMELINE', 'ALINEACION', 'ESTADISTICAS'] as const).map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTab(tab)}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === 'RESUMEN' ? t("match_detail.tab_summary") : 
               tab === 'TIMELINE' ? t("match_detail.tab_timeline") :
               tab === 'ALINEACION' ? t("match_detail.tab_lineup") : 
               t("match_detail.tab_stats")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'RESUMEN' && <SummaryTab />}
        {activeTab === 'TIMELINE' && <TimelineTab />}
        {activeTab === 'ALINEACION' && <LineupTab />}
        {activeTab === 'ESTADISTICAS' && <StatsTab />}
      </View>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    opacity: 0.7,
  },
  scoreArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  teamBox: {
    alignItems: 'center',
    width: '30%',
  },
  badgeContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamNameMain: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  scoreResult: {
    width: '35%',
    alignItems: 'center',
  },
  scheduledInfo: {
    alignItems: 'center',
  },
  scheduledTime: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.text,
  },
  scheduledDate: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.textSecondary,
    letterSpacing: 2,
    marginTop: 5,
  },
  liveScoreContainer: {
    alignItems: 'center',
  },
  liveScore: {
    fontSize: 40,
    fontWeight: '900',
    color: theme.text,
  },
  liveIndicator: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
  },
  liveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: theme.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.textSecondary,
  },
  tabLabelActive: {
    color: theme.primary,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
  },
  detailCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: theme.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: theme.text,
    fontWeight: '700',
  },
  recentFormContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  formCol: {
    width: '48%',
  },
  formTeamLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.textSecondary,
    marginBottom: 10,
  },
  formRow: {
    flexDirection: 'row',
    gap: 5,
  },
  formIndicator: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formIndicatorText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  outcomeW: { backgroundColor: '#4CAF50' },
  outcomeD: { backgroundColor: '#9E9E9E' },
  outcomeL: { backgroundColor: '#FF5252' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 15,
  },
  emptyText: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  lineupHeader: {
    marginBottom: 15,
  },
  formationLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.text,
    opacity: 0.7,
  },
  pitchContainer: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 25,
  },
  pitch: {
    flex: 1,
    padding: 10,
  },
  pitchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerNode: {
    alignItems: 'center',
  },
  playerAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  playerNodeName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  shirtNumberBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shirtNumberText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 15,
  },
  playerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 12,
    borderRadius: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
  },
  playerListItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerListItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
  },
  playerListItemNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.textSecondary,
  },
  unavailableReason: {
    fontSize: 10,
    color: '#FF4444',
    marginTop: 2,
  },
  h2hSummary: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  h2hBar: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    marginVertical: 15,
  },
  h2hSegment: {
    height: '100%',
  },
  h2hLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  h2hLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.textSecondary,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    width: 40,
    textAlign: 'center',
  },
  statLabelSmall: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  timelineContainer: {
    paddingVertical: 20,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    marginLeft: -1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    width: '100%',
  },
  timelineHome: {
    flexDirection: 'row',
  },
  timelineAway: {
    flexDirection: 'row-reverse',
  },
  minuteBadgeContainer: {
    width: 60,
    alignItems: 'center',
    zIndex: 10,
  },
  minuteBadge: {
    backgroundColor: theme.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    marginBottom: 4,
  },
  minuteText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.text,
  },
  eventIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  eventContent: {
    flex: 1,
  },
  eventContentHome: {
    alignItems: 'flex-end',
    paddingRight: 15,
  },
  eventContentAway: {
    alignItems: 'flex-start',
    paddingLeft: 15,
  },
  eventMainInfo: {
    backgroundColor: theme.surface,
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    minWidth: 120,
  },
  eventTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.primary,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  eventPlayer: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
  },
  eventSubPlayer: {
    fontSize: 10,
    color: theme.textSecondary,
    marginTop: 2,
  }
});
