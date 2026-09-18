import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { NotFoundState } from '@/components/ui/feedback/NotFoundState';
import api from '@/services/api';
import { Match } from '@/features/tournaments/types/match';
import { MatchLineupResponse, MatchHeadToHeadResponse, MatchTimelineResponse, MatchEvent } from '@/features/tournaments/types/matchDetail';
import { MatchAdminControls } from '@/components/matches/admin/MatchAdminControls';
import { AttendanceWidget } from '@/components/matches/attendance/AttendanceWidget';
import { SponsorBanner } from '@/components/sponsors/SponsorBanner';
import { RateRefereeModal } from '@/components/referees/RateRefereeModal';
import { FanCheckInModal } from '@/components/matches/FanCheckInModal';
import { MatchMVPVoteWidget } from '@/components/matches/MatchMVPVoteWidget';
import { useGetMatchDisputes } from '@/features/tournaments/services/matchDisputeApi';
import { MatchDispute } from '@/features/tournaments/types/matchDispute';
import { FileDisputeModal } from '@/components/matches/disputes/FileDisputeModal';
import { ResolveDisputeModal } from '@/components/matches/disputes/ResolveDisputeModal';
import { MatchDisputeBanner } from '@/components/matches/disputes/MatchDisputeBanner';
import { metrics } from '@/services/metrics';
import { shareMatch } from '@/features/share/services/shareService';
import { ShareMatchModal } from '@/components/matches/ShareMatchModal';
import { MatchPeriodTracker, MatchPeriod } from '@/components/matches/live/MatchPeriodTracker';
import { 
  useStartMatch, 
  usePauseMatch, 
  useResumeMatch, 
  useEndMatch, 
  useChangeMatchStatus 
} from '@/features/matches/services/liveMatchApi';
import {
  ChevronLeft, 
  ChevronRight,
  Calendar, 
  MapPin, 
  Users, 
  BarChart3, 
  History, 
  Info,
  Clock,
  Shield,
  User,
  Star,
  ArrowRightLeft,
  AlertCircle,
  Video,
  Share2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { PlayerCredentialModal, CredentialPlayerData } from '@/components/players/PlayerCredentialModal';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  
  const [activeTab, setActiveTab] = useState<'RESUMEN' | 'TIMELINE' | 'ALINEACION' | 'ESTADISTICAS'>('RESUMEN');
  const [isRateModalVisible, setIsRateModalVisible] = useState(false);
  const [isFanCheckInVisible, setIsFanCheckInVisible] = useState(false);
  const [isFileDisputeVisible, setIsFileDisputeVisible] = useState(false);
  const [selectedDisputeToResolve, setSelectedDisputeToResolve] = useState<MatchDispute | null>(null);
  const [selectedCredentialPlayer, setSelectedCredentialPlayer] = useState<CredentialPlayerData | null>(null);
  const [selectedLineupSide, setSelectedLineupSide] = useState<'home' | 'away'>('home');
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [now] = useState(() => Date.now());

  const matchIdStr = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;
  const { data: disputes = [], refetch: refetchDisputes } = useGetMatchDisputes(matchIdStr);

  const startMatch = useStartMatch();
  const pauseMatch = usePauseMatch();
  const resumeMatch = useResumeMatch();
  const endMatch = useEndMatch();
  const changeStatus = useChangeMatchStatus(matchIdStr || '');

  const [periodOverride, setPeriodOverride] = useState<MatchPeriod | null>(null);
  const [minuteOverride, setMinuteOverride] = useState<number | null>(null);

  const {
    data: matchDetails,
    isLoading,
    refetch: fetchMatchData,
  } = useQuery({
    queryKey: ['match-details', id],
    queryFn: async () => {
      if (!id) return null;

      if (id === 'demo') {
        const demoMatch: Match = {
          id: 'demo',
          tournament: 'torneo-demo',
          tournament_name: 'Liga Premier Trofi',
          home_team: 'team-1',
          home_team_name: 'Galácticos FC',
          away_team: 'team-2',
          away_team_name: 'Tigres del Norte',
          venue_name: 'Cancha Central Sintética',
          start_datetime: new Date().toISOString(),
          status: 'played',
          result: {
            id: 'res-demo',
            match: 'demo',
            home_score: 3,
            away_score: 2,
            result_type: 'normal',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const demoTimeline: MatchTimelineResponse = {
          count: 5,
          next: null,
          previous: null,
          results: [
            {
              id: '1',
              match: 'demo',
              team: 'team-1',
              team_name: 'Galácticos FC',
              roster_membership: 'm-1',
              player_name: 'Carlos Ruiz',
              event_type: 'goal',
              minute: 14,
              metadata: null,
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              match: 'demo',
              team: 'team-2',
              team_name: 'Tigres del Norte',
              roster_membership: 'm-2',
              player_name: 'Mateo Valdés',
              event_type: 'goal',
              minute: 32,
              metadata: null,
              created_at: new Date().toISOString(),
            },
            {
              id: '3',
              match: 'demo',
              team: 'team-1',
              team_name: 'Galácticos FC',
              roster_membership: 'm-3',
              player_name: 'Luis Ibarra',
              event_type: 'goal',
              minute: 58,
              metadata: null,
              created_at: new Date().toISOString(),
            },
            {
              id: '4',
              match: 'demo',
              team: 'team-1',
              team_name: 'Galácticos FC',
              roster_membership: 'm-4',
              player_name: 'Álvaro Peña',
              event_type: 'goal',
              minute: 73,
              metadata: null,
              created_at: new Date().toISOString(),
            },
            {
              id: '5',
              match: 'demo',
              team: 'team-2',
              team_name: 'Tigres del Norte',
              roster_membership: 'm-5',
              player_name: 'Javier Ramos',
              event_type: 'goal',
              minute: 86,
              metadata: null,
              created_at: new Date().toISOString(),
            },
          ],
        };

        return {
          match: demoMatch,
          lineup: null,
          h2h: null,
          timeline: demoTimeline,
        };
      }

      const matchData = await api.get<Match>(`/v1/matches/${id}/`);
      metrics.trackMatchView(matchData.id, matchData.status);

      let lineupData: MatchLineupResponse | null = null;
      try {
        lineupData = await api.get<MatchLineupResponse>(`/v1/matches/${id}/lineup/`);
      } catch {}

      let h2hData: MatchHeadToHeadResponse | null = null;
      try {
        h2hData = await api.get<MatchHeadToHeadResponse>(`/v1/matches/${id}/head-to-head/`);
      } catch {}

      let timelineData: MatchTimelineResponse | null = null;
      try {
        timelineData = await api.get<MatchTimelineResponse>(`/v1/matches/${id}/timeline/`);
      } catch {}

      return {
        match: matchData,
        lineup: lineupData,
        h2h: h2hData,
        timeline: timelineData,
      };
    },
    enabled: !!id,
  });

  const match = matchDetails?.match || null;
  const lineup = matchDetails?.lineup || null;
  const h2h = matchDetails?.h2h || null;
  const timeline = matchDetails?.timeline || null;

  const isResultLocked = Boolean(match?.result?.locked_at);
  const isWithin48Hours = match?.result?.locked_at
    ? now - new Date(match.result.locked_at).getTime() <= 48 * 3600 * 1000
    : false;
  const hasPendingDispute = disputes.some((d) => d.status === 'pending');
  const canFileDispute = isResultLocked && isWithin48Hours && !hasPendingDispute;

  // TODO: Implement proper admin check based on tournament role or match referee
  const isAdmin = true;

  const derivedPeriod: MatchPeriod = (() => {
    if (!match) return 'not_started';
    if (match.status === 'scheduled') return 'not_started';
    if (match.status === 'played' || match.status === 'finished' || match.status === 'canceled' || match.status === 'forfeit') return 'finished';
    if (match.status === 'paused') return 'halftime';
    if (match.status === 'live') {
      return (match.current_minute || 0) > 45 ? '2T' : '1T';
    }
    return 'not_started';
  })();

  const matchPeriod: MatchPeriod = periodOverride ?? derivedPeriod;
  const liveMinute: number =
    minuteOverride ??
    (match?.current_minute ||
      (matchPeriod === 'halftime' ? 45 : matchPeriod === '2T' ? 46 : matchPeriod === 'finished' ? 90 : 0));

  const handlePeriodChange = async (newPeriod: MatchPeriod) => {
    setPeriodOverride(newPeriod);
    const targetMinute =
      newPeriod === 'not_started'
        ? 0
        : newPeriod === '1T'
        ? 1
        : newPeriod === 'halftime'
        ? 45
        : newPeriod === '2T'
        ? 46
        : 90;
    setMinuteOverride(targetMinute);

    if (id === 'demo' || !match) return;

    try {
      if (newPeriod === '1T') {
        await startMatch.mutateAsync(match.id);
      } else if (newPeriod === 'halftime') {
        await pauseMatch.mutateAsync(match.id);
      } else if (newPeriod === '2T') {
        await resumeMatch.mutateAsync(match.id);
      } else if (newPeriod === 'finished') {
        await endMatch.mutateAsync(match.id);
      } else if (newPeriod === 'not_started') {
        await changeStatus.mutateAsync({ status: 'scheduled' });
      }
    } catch (error) {
      console.warn('Could not sync status with backend:', error);
    }
  };

  const renderSummaryTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Info size={18} color={theme.primary} />
          <Text style={styles.sectionTitle}>{t("match_detail.section_encounter")}</Text>
        </View>
        
        {/* RSVP / Attendance Widget */}
        {match && (
          <AttendanceWidget 
            matchId={match.id}
            isCaptain={true} // TO DO: Real check if current user is captain
            userTeamId={match.home_team} // TO DO: Real logic to resolve which team the user belongs to
            roster={lineup?.home.starting_xi || []} 
          />
        )}

        {/* Sponsor Banner for Match */}
        {match && (
          <SponsorBanner
            placementType="match_banner"
            tournamentId={match.tournament}
            teamId={match.home_team}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Fan Check-in Button */}
        <TouchableOpacity
          style={styles.fanCheckInBanner}
          activeOpacity={0.8}
          onPress={() => setIsFanCheckInVisible(true)}
        >
          <View style={styles.fanCheckInLeft}>
            <View style={styles.fanCheckInIconCircle}>
              <MapPin size={20} color="#001A2C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fanCheckInTitle}>¡Estoy en la Cancha!</Text>
              <Text style={styles.fanCheckInSub}>
                Haz check-in con GPS y foto para sumar rachas y logros de hincha
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#001A2C" />
        </TouchableOpacity>
        
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
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>{t("match_detail.label_referee")}</Text>
                <Text style={styles.detailValue}>{match?.referee_name || 'Por designar'}</Text>
              </View>
              {match?.referee && match?.status === 'played' && (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                  }}
                  onPress={() => setIsRateModalVisible(true)}
                >
                  <Star size={13} color="#F59E0B" fill="#F59E0B" />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#F59E0B' }}>Calificar</Text>
                </TouchableOpacity>
              )}
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

      {/* MVP Voting Widget for finished matches */}
      {match && (match.status === 'played' || (match.status as any) === 'completed') && (
        <MatchMVPVoteWidget
          matchId={match.id}
          isPlayed={true}
          isAdmin={isAdmin}
          homeTeamRoster={lineup?.home?.starting_xi || []}
          awayTeamRoster={lineup?.away?.starting_xi || []}
        />
      )}
    </ScrollView>
  );

  const renderTimelineTab = () => {
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
                    <Text style={styles.minuteText}>{event.minute}&apos;</Text>
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

  const renderLineupTab = () => {
    if (!lineup) return (
      <View style={styles.emptyContainer}>
        <Users size={48} color={theme.textSecondary} opacity={0.3} />
        <Text style={styles.emptyText}>{t("match_detail.lineup_empty")}</Text>
      </View>
    );

    const currentTeamLineup = selectedLineupSide === 'home' ? lineup.home : lineup.away;

    return (
      <ScrollView style={styles.tabContent}>
        {/* Selector de Equipo (Local / Visitante) para revisión de árbitro y capitán */}
        <View style={styles.lineupTeamToggle}>
          <TouchableOpacity
            style={[styles.lineupTeamBtn, selectedLineupSide === 'home' && styles.lineupTeamBtnActive]}
            onPress={() => setSelectedLineupSide('home')}
            activeOpacity={0.8}
          >
            <Text style={[styles.lineupTeamBtnText, selectedLineupSide === 'home' && styles.lineupTeamBtnTextActive]}>
              {lineup.home.team_name} (Local)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.lineupTeamBtn, selectedLineupSide === 'away' && styles.lineupTeamBtnActive]}
            onPress={() => setSelectedLineupSide('away')}
            activeOpacity={0.8}
          >
            <Text style={[styles.lineupTeamBtnText, selectedLineupSide === 'away' && styles.lineupTeamBtnTextActive]}>
              {lineup.away.team_name} (Visita)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.lineupHeader}>
          <Text style={styles.formationLabel}>
            {currentTeamLineup.team_name} ({currentTeamLineup.formation_name || '4-3-3'})
          </Text>
          <Text style={styles.lineupHint}>Toca a un jugador para ver su Ficha Digital</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subTitle}>TITULARES REGISTRADOS</Text>
          {currentTeamLineup.starting_xi.map((p, i) => {
            const isSuspended = p.status === 'suspended' || p.is_suspended;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.playerListItem, isSuspended && styles.playerListItemSuspended]}
                activeOpacity={0.7}
                onPress={() =>
                  setSelectedCredentialPlayer({
                    player_name: p.player_name,
                    nickname: p.nickname,
                    shirt_number: p.shirt_number,
                    position: p.position,
                    photo: p.photo,
                    team_name: currentTeamLineup.team_name,
                    status: p.status,
                    is_suspended: isSuspended,
                    suspension_reason: isSuspended ? 'Inhabilitado por sanción disciplinaria' : undefined,
                  })
                }
              >
                <View style={styles.playerListItemInfo}>
                  <View style={[styles.playerAvatarSmall, isSuspended && { borderColor: '#EF4444', borderWidth: 2 }]}>
                    {p.photo ? (
                      <Image
                        source={{ uri: p.photo.replace(/\s/g, "") }}
                        style={styles.fullImage}
                      />
                    ) : (
                      <User size={16} color="#FFF" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.playerListItemName}>{p.player_name}</Text>
                    {isSuspended ? (
                      <View style={styles.warningPillRow}>
                        <AlertTriangle size={11} color="#EF4444" />
                        <Text style={styles.warningPillText}>INHABILITADO POR SANCIÓN</Text>
                      </View>
                    ) : (
                      <View style={styles.activePillRow}>
                        <CheckCircle2 size={11} color="#10B981" />
                        <Text style={styles.activePillText}>Habilitado</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.playerRightCol}>
                  <Text style={styles.playerListItemNumber}>#{p.shirt_number}</Text>
                  <Text style={styles.viewIdHint}>Ver Ficha</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {currentTeamLineup.unavailable.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.subTitle, { color: '#FF4444' }]}>{t("match_detail.unavailable_players")}</Text>
            {currentTeamLineup.unavailable.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.playerListItem, styles.playerListItemSuspended]}
                activeOpacity={0.7}
                onPress={() =>
                  setSelectedCredentialPlayer({
                    player_name: p.player_name,
                    shirt_number: p.shirt_number,
                    position: p.position,
                    photo: p.photo,
                    team_name: currentTeamLineup.team_name,
                    status: 'suspended',
                    is_suspended: true,
                    suspension_reason: p.reason,
                  })
                }
              >
                <View style={styles.playerListItemInfo}>
                  <View style={[styles.playerAvatarSmall, { backgroundColor: '#FF4444' }]}>
                    <Shield size={14} color="#FFF" />
                  </View>
                  <View>
                    <Text style={styles.playerListItemName}>{p.player_name}</Text>
                    <Text style={styles.unavailableReason}>{p.reason}</Text>
                  </View>
                </View>
                <Text style={styles.viewIdHint}>Ver Ficha</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderStatsTab = () => {
    if (!h2h) return (
      <View style={styles.emptyContainer}>
        <BarChart3 size={48} color={theme.textSecondary} opacity={0.3} />
        <Text style={styles.emptyText}>{t("match_detail.stats_empty")}</Text>
      </View>
    );

    const renderStatRow = (label: string, home: any, away: any, isHigherBetter = true) => {
      const homeVal = parseFloat(home);
      const awayVal = parseFloat(away);
      const isHomeBetter = isHigherBetter ? homeVal > awayVal : homeVal < awayVal;
      const isAwayBetter = isHigherBetter ? awayVal > homeVal : awayVal < homeVal;

      return (
        <View key={label} style={styles.statRow}>
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
          {renderStatRow(t("match_detail.stat_position"), h2h.home_season_stats.position, h2h.away_season_stats.position, false)}
          {renderStatRow(t("match_detail.stat_goals_pg"), h2h.home_season_stats.goals_per_game, h2h.away_season_stats.goals_per_game)}
          {renderStatRow(t("match_detail.stat_goals_conceded"), h2h.home_season_stats.goals_conceded_per_game, h2h.away_season_stats.goals_conceded_per_game, false)}
          {renderStatRow(t("match_detail.stat_clean_sheets"), h2h.home_season_stats.clean_sheets, h2h.away_season_stats.clean_sheets)}
          {renderStatRow(t("match_detail.stat_wins"), h2h.home_season_stats.wins, h2h.away_season_stats.wins)}
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

  if (!match) {
    return (
      <NotFoundState
        title={t('match_detail.not_found_title')}
        message={t('match_detail.not_found_text')}
        actionLabel={t('match_detail.go_back')}
        onAction={() => router.back()}
      />
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
        {match ? (
          <TouchableOpacity
            onPress={() => setIsShareModalVisible(true)}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Share2 size={22} color={theme.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </SafeAreaView>

      {/* Match Score Area */}
      <View style={styles.scoreArea}>
        <View style={styles.teamBox}>
          <View style={styles.badgeContainer}>
            {match?.home_team_logo ? (
              <Image
                source={{ uri: match.home_team_logo.replace(/\s/g, "") }}
                style={styles.headerTeamLogoLarge}
              />
            ) : (
              <Shield size={40} color={theme.primary} opacity={0.2} />
            )}
          </View>
          <Text style={styles.teamNameMain}>{match?.home_team_name}</Text>
        </View>

        <View style={styles.scoreResult}>
          {matchPeriod === "not_started" ? (
            <View style={styles.scheduledInfo}>
              <Text style={styles.scheduledTime}>
                {new Date(match.start_datetime).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text style={styles.scheduledDate}>{t("match_detail.tomorrow")}</Text>
            </View>
          ) : (
            <View style={styles.liveScoreContainer}>
              <Text style={styles.liveScore}>
                {match?.result?.home_score ?? 0} -{" "}
                {match?.result?.away_score ?? 0}
              </Text>
              {(match?.status === "live" || matchPeriod === "1T" || matchPeriod === "2T") && (
                <View style={styles.liveIndicator}>
                  <Text style={styles.liveText}>{liveMinute}&apos;</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.teamBox}>
          <View style={styles.badgeContainer}>
            {match?.away_team_logo ? (
              <Image
                source={{ uri: match.away_team_logo.replace(/\s/g, "") }}
                style={styles.headerTeamLogoLarge}
              />
            ) : (
              <Shield size={40} color={theme.primary} opacity={0.2} />
            )}
          </View>
          <Text style={styles.teamNameMain}>{match?.away_team_name}</Text>
        </View>
      </View>

      {/* Live Match Period Tracker & State Selector: Por iniciar ➔ 1T ➔ Descanso ➔ 2T ➔ Terminado */}
      {match && (
        <MatchPeriodTracker
          match={match}
          isAdmin={isAdmin}
          currentPeriod={matchPeriod}
          currentMinute={liveMinute}
          onPeriodChange={handlePeriodChange}
          onMinuteChange={setMinuteOverride}
        />
      )}

      {/* Share Banner for finished matches */}
      {(match?.status === "played" || matchPeriod === "finished" || Boolean(match?.result)) && (
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <TouchableOpacity
            style={styles.shareBannerBtn}
            onPress={() => setIsShareModalVisible(true)}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Share2 size={16} color="#001A2C" />
            <Text style={styles.shareBannerText}>COMPARTIR RESULTADO EN WHATSAPP / INSTAGRAM</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Admin Controls */}
      {isAdmin && match && (
        <MatchAdminControls
          match={match}
          currentMinute={liveMinute}
        />
      )}

      {/* Dispute Banner */}
      <View style={{ paddingHorizontal: 16 }}>
        <MatchDisputeBanner
          disputes={disputes}
          canResolve={isAdmin}
          canFile={canFileDispute}
          onResolvePress={(d) => setSelectedDisputeToResolve(d)}
          onFilePress={() => setIsFileDisputeVisible(true)}
        />
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
        {activeTab === 'RESUMEN' && renderSummaryTab()}
        {activeTab === 'TIMELINE' && renderTimelineTab()}
        {activeTab === 'ALINEACION' && renderLineupTab()}
        {activeTab === 'ESTADISTICAS' && renderStatsTab()}
      </View>

      {match && (
        <RateRefereeModal
          visible={isRateModalVisible}
          onClose={() => setIsRateModalVisible(false)}
          matchId={match.id}
          refereeName={match.referee_name}
        />
      )}

      {match && (
        <FanCheckInModal
          visible={isFanCheckInVisible}
          onClose={() => setIsFanCheckInVisible(false)}
          matchId={match.id}
          matchTitle={`${match.home_team_name} vs ${match.away_team_name}`}
          venueName={match.venue_name}
        />
      )}

      {match && (
        <FileDisputeModal
          visible={isFileDisputeVisible}
          onClose={() => setIsFileDisputeVisible(false)}
          matchId={match.id}
          matchTitle={`${match.home_team_name} vs ${match.away_team_name}`}
          onSuccess={() => {
            refetchDisputes();
            fetchMatchData();
          }}
        />
      )}

      {selectedDisputeToResolve && match && (
        <ResolveDisputeModal
          visible={Boolean(selectedDisputeToResolve)}
          onClose={() => setSelectedDisputeToResolve(null)}
          dispute={selectedDisputeToResolve}
          matchId={match.id}
          onSuccess={() => {
            refetchDisputes();
            fetchMatchData();
          }}
        />
      )}

      {match && (
        <ShareMatchModal
          visible={isShareModalVisible}
          onClose={() => setIsShareModalVisible(false)}
          match={match}
          events={timeline?.results || []}
        />
      )}

      <PlayerCredentialModal
        visible={!!selectedCredentialPlayer}
        player={selectedCredentialPlayer}
        onClose={() => setSelectedCredentialPlayer(null)}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  shareBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareBannerText: {
    color: '#001A2C',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  fanCheckInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.primary,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  fanCheckInLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  fanCheckInIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 26, 44, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fanCheckInTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#001A2C',
    letterSpacing: 0.5,
  },
  fanCheckInSub: {
    fontSize: 11,
    color: '#001A2C',
    opacity: 0.8,
    marginTop: 2,
    lineHeight: 15,
  },
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
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
  },
  headerTeamLogoLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    paddingBottom: 100,
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
  playerListItemSuspended: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1.5,
  },
  playerListItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  playerListItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
  },
  playerRightCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  playerListItemNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: theme.primary,
  },
  viewIdHint: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.primary,
  },
  warningPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  warningPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.3,
  },
  activePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  lineupTeamToggle: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  lineupTeamBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  lineupTeamBtnActive: {
    backgroundColor: isDark ? 'rgba(0,245,255,0.12)' : 'rgba(0,245,255,0.2)',
    borderColor: theme.primary,
  },
  lineupTeamBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSecondary,
  },
  lineupTeamBtnTextActive: {
    color: theme.text,
    fontWeight: '900',
  },
  lineupHint: {
    fontSize: 11,
    color: theme.textSecondary,
    marginTop: 2,
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
