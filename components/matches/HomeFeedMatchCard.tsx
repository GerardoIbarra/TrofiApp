import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Calendar,
  MapPin,
  Shield,
  User,
  Star,
  Award,
  Crown,
  Settings,
  Heart,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { HomeFeedItem, RelationReason } from '@/features/matches/types/homeFeed';
import { useConfirmAttendance } from '@/features/matches/services/matchApi';

interface HomeFeedMatchCardProps {
  feedItem: HomeFeedItem;
  width?: number;
}

const RELATION_CONFIG: Record<
  RelationReason,
  { label: string; bg: string; text: string; icon: any }
> = {
  referee: {
    label: 'Árbitro',
    bg: 'rgba(234, 179, 8, 0.15)',
    text: '#EAB308',
    icon: Shield,
  },
  captain: {
    label: 'Capitán',
    bg: 'rgba(59, 130, 246, 0.15)',
    text: '#3B82F6',
    icon: Award,
  },
  player: {
    label: 'Jugador',
    bg: 'rgba(16, 185, 129, 0.15)',
    text: '#10B981',
    icon: User,
  },
  owner: {
    label: 'Dueño',
    bg: 'rgba(168, 85, 247, 0.15)',
    text: '#A855F7',
    icon: Crown,
  },
  league_admin: {
    label: 'Admin Liga',
    bg: 'rgba(249, 115, 22, 0.15)',
    text: '#F97316',
    icon: Settings,
  },
  tournament_admin: {
    label: 'Admin Torneo',
    bg: 'rgba(236, 72, 153, 0.15)',
    text: '#EC4899',
    icon: Settings,
  },
  favorite: {
    label: 'Siguiendo',
    bg: 'rgba(244, 63, 94, 0.15)',
    text: '#F43F5E',
    icon: Heart,
  },
};

export const HomeFeedMatchCard: React.FC<HomeFeedMatchCardProps> = ({
  feedItem,
  width,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const { match, relation_reasons, capabilities } = feedItem;

  const [hasConfirmed, setHasConfirmed] = useState<boolean | null>(null);
  const confirmMutation = useConfirmAttendance();

  const isLive = match.status === 'live';
  const isFinished = match.status === 'played';
  const isPaused = match.status === 'paused';

  const homeScore = match.result?.home_score ?? 0;
  const awayScore = match.result?.away_score ?? 0;

  const handleQuickAttendance = (status: 'confirmed' | 'declined') => {
    confirmMutation.mutate(
      {
        matchId: match.id,
        data: { status },
      },
      {
        onSuccess: () => {
          setHasConfirmed(status === 'confirmed');
          Alert.alert(
            '¡Listo!',
            status === 'confirmed'
              ? 'Has confirmado tu asistencia al partido.'
              : 'Has declinado tu asistencia.'
          );
        },
        onError: (err: any) => {
          Alert.alert(
            'Error',
            err?.response?.data?.detail || 'No se pudo registrar la asistencia.'
          );
        },
      }
    );
  };

  const handlePressCard = () => {
    router.push({
      pathname: '/match-detail',
      params: { id: match.id },
    });
  };

  const handleManagePress = () => {
    router.push({
      pathname: '/match-detail',
      params: { id: match.id, manage: 'true' },
    });
  };

  const handleCaptainAttendancePress = () => {
    router.push({
      pathname: '/match-detail',
      params: { id: match.id, tab: 'ALINEACION', action: 'captain_attendance' },
    });
  };

  const startDate = new Date(match.start_datetime);
  const formattedDay = !isNaN(startDate.getTime())
    ? startDate.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : '';
  const formattedTime = !isNaN(startDate.getTime())
    ? startDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <View style={[styles.cardContainer, width ? { width } : {}]}>
      <TouchableOpacity
        style={styles.cardTouchable}
        activeOpacity={0.9}
        onPress={handlePressCard}
      >
        <LinearGradient
          colors={
            isDark
              ? ['#1E1535', '#130B24']
              : ['#FFFFFF', '#F8FAFC']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <Text style={styles.tournamentText} numberOfLines={1}>
              {match.tournament_name || 'COMPETICIÓN'}
            </Text>

            {isLive || isPaused ? (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>
                  {isPaused
                    ? 'EN PAUSA'
                    : match.current_minute
                    ? `${match.current_minute}' EN VIVO`
                    : 'EN VIVO'}
                </Text>
              </View>
            ) : isFinished ? (
              <View style={styles.finishedBadge}>
                <Text style={styles.finishedText}>FINALIZADO</Text>
              </View>
            ) : (
              <View style={styles.dateBadge}>
                <Calendar size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.dateText}>
                  {formattedDay} {formattedTime}
                </Text>
              </View>
            )}
          </View>

          {/* Relation Reasons Chips */}
          {relation_reasons && relation_reasons.length > 0 && (
            <View style={styles.relationsRow}>
              {relation_reasons.map((reason) => {
                const config = RELATION_CONFIG[reason] || {
                  label: reason,
                  bg: 'rgba(255,255,255,0.1)',
                  text: theme.text,
                  icon: Shield,
                };
                const IconComponent = config.icon;
                return (
                  <View
                    key={reason}
                    style={[styles.relationChip, { backgroundColor: config.bg }]}
                  >
                    <IconComponent size={10} color={config.text} style={{ marginRight: 3 }} />
                    <Text style={[styles.relationText, { color: config.text }]}>
                      {config.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Match Scoreboard */}
          <View style={styles.matchBoard}>
            {/* Home Team */}
            <View style={styles.teamCol}>
              <View style={styles.teamLogoWrapper}>
                {match.home_team_logo ? (
                  <Image
                    source={{ uri: match.home_team_logo.replace(/\s/g, '') }}
                    style={styles.teamLogo}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.teamLogoFallback}>
                    <Text style={styles.teamInitials}>
                      {match.home_team_name?.slice(0, 2).toUpperCase() || 'L'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.teamName} numberOfLines={2}>
                {match.home_team_name}
              </Text>
            </View>

            {/* Center Score / Time */}
            <View style={styles.scoreCol}>
              {isLive || isFinished || isPaused ? (
                <View style={styles.scoreWrapper}>
                  <Text style={styles.scoreText}>{homeScore}</Text>
                  <Text style={styles.scoreSeparator}>-</Text>
                  <Text style={styles.scoreText}>{awayScore}</Text>
                </View>
              ) : (
                <View style={styles.vsWrapper}>
                  <Text style={styles.timeBig}>{formattedTime || 'VS'}</Text>
                  <Text style={styles.vsSubtitle}>POR JUGAR</Text>
                </View>
              )}
            </View>

            {/* Away Team */}
            <View style={styles.teamCol}>
              <View style={styles.teamLogoWrapper}>
                {match.away_team_logo ? (
                  <Image
                    source={{ uri: match.away_team_logo.replace(/\s/g, '') }}
                    style={styles.teamLogo}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.teamLogoFallback}>
                    <Text style={styles.teamInitials}>
                      {match.away_team_name?.slice(0, 2).toUpperCase() || 'V'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.teamName} numberOfLines={2}>
                {match.away_team_name}
              </Text>
            </View>
          </View>

          {/* Venue Row */}
          {match.venue_name && (
            <View style={styles.venueRow}>
              <MapPin size={11} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.venueText} numberOfLines={1}>
                {match.venue_name}
              </Text>
            </View>
          )}

          {/* Action Footer based on capabilities */}
          <View style={styles.footerRow}>
            {capabilities.can_manage_match ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                onPress={handleManagePress}
                activeOpacity={0.8}
              >
                <Settings size={14} color="#001A2C" style={{ marginRight: 6 }} />
                <Text style={styles.actionBtnTextPrimary}>Gestionar Partido</Text>
                <ChevronRight size={14} color="#001A2C" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            ) : capabilities.can_confirm_for_team ? (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnCaptain]}
                onPress={handleCaptainAttendancePress}
                activeOpacity={0.8}
              >
                <Award size={14} color="#3B82F6" style={{ marginRight: 6 }} />
                <Text style={styles.actionBtnTextCaptain}>Asistencia Equipo (Capitán)</Text>
                <ChevronRight size={14} color="#3B82F6" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            ) : capabilities.can_confirm_attendance ? (
              <View style={styles.attendanceQuickRow}>
                {hasConfirmed === true ? (
                  <View style={styles.confirmedNotice}>
                    <CheckCircle2 size={13} color="#10B981" style={{ marginRight: 4 }} />
                    <Text style={styles.confirmedNoticeText}>Asistencia Confirmada</Text>
                  </View>
                ) : hasConfirmed === false ? (
                  <View style={styles.declinedNotice}>
                    <XCircle size={13} color="#EF4444" style={{ marginRight: 4 }} />
                    <Text style={styles.declinedNoticeText}>Asistencia Declinada</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.attendancePrompt}>¿Asistirás?</Text>
                    {confirmMutation.isPending ? (
                      <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                      <View style={styles.attendanceBtnGroup}>
                        <TouchableOpacity
                          style={styles.confirmBtn}
                          onPress={() => handleQuickAttendance('confirmed')}
                        >
                          <CheckCircle2 size={12} color="#10B981" style={{ marginRight: 3 }} />
                          <Text style={styles.confirmBtnText}>Sí</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.declineBtn}
                          onPress={() => handleQuickAttendance('declined')}
                        >
                          <XCircle size={12} color="#EF4444" style={{ marginRight: 3 }} />
                          <Text style={styles.declineBtnText}>No</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
            ) : (
              <View style={styles.viewMatchRow}>
                <Text style={styles.viewMatchText}>Ver detalles del partido</Text>
                <ChevronRight size={13} color={theme.primary} />
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    cardContainer: {
      borderRadius: 20,
      marginHorizontal: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.4 : 0.08,
      shadowRadius: 10,
      elevation: 6,
    },
    cardTouchable: {
      borderRadius: 20,
    },
    cardGradient: {
      padding: 16,
      borderRadius: 20,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    tournamentText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: isDark ? 'rgba(255,255,255,0.5)' : theme.textSecondary,
      flex: 1,
      marginRight: 8,
    },
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#EF4444',
      marginRight: 5,
    },
    liveText: {
      color: '#EF4444',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    finishedBadge: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    finishedText: {
      color: isDark ? 'rgba(255,255,255,0.7)' : theme.textSecondary,
      fontSize: 10,
      fontWeight: '700',
    },
    dateBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    dateText: {
      color: isDark ? 'rgba(255,255,255,0.7)' : theme.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    relationsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12,
    },
    relationChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 8,
    },
    relationText: {
      fontSize: 10,
      fontWeight: '700',
    },
    matchBoard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 6,
    },
    teamCol: {
      flex: 1,
      alignItems: 'center',
    },
    teamLogoWrapper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
      overflow: 'hidden',
    },
    teamLogo: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    teamLogoFallback: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    teamInitials: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.primary,
    },
    teamName: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      minHeight: 32,
    },
    scoreCol: {
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
    },
    scoreText: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.text,
    },
    scoreSeparator: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
      marginHorizontal: 6,
    },
    vsWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    timeBig: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.primary,
    },
    vsSubtitle: {
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.5,
      color: isDark ? 'rgba(255,255,255,0.4)' : theme.textSecondary,
      marginTop: 2,
    },
    venueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      marginBottom: 4,
    },
    venueText: {
      fontSize: 11,
      color: isDark ? 'rgba(255,255,255,0.5)' : theme.textSecondary,
      maxWidth: '85%',
    },
    footerRow: {
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    actionBtnTextPrimary: {
      color: '#001A2C',
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    actionBtnCaptain: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    actionBtnTextCaptain: {
      color: '#3B82F6',
      fontSize: 13,
      fontWeight: '700',
    },
    attendanceQuickRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    attendancePrompt: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
    },
    attendanceBtnGroup: {
      flexDirection: 'row',
      gap: 8,
    },
    confirmBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    confirmBtnText: {
      color: '#10B981',
      fontSize: 12,
      fontWeight: '700',
    },
    declineBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    declineBtnText: {
      color: '#EF4444',
      fontSize: 12,
      fontWeight: '700',
    },
    confirmedNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    confirmedNoticeText: {
      color: '#10B981',
      fontSize: 12,
      fontWeight: '700',
    },
    declinedNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    declinedNoticeText: {
      color: '#EF4444',
      fontSize: 12,
      fontWeight: '700',
    },
    viewMatchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    viewMatchText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.primary,
      marginRight: 2,
    },
  });
