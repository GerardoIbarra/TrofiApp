import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Award, Lock, CheckCircle2, ChevronRight, User } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import {
  useGetMVPVotes,
  useVoteMVP,
  useLockMVPVote,
} from '@/features/matches/services/matchApi';
import { useAuthStore } from '@/features/auth/store/authStore';

interface MatchMVPVoteWidgetProps {
  matchId: string;
  isPlayed: boolean;
  isAdmin?: boolean;
  isReferee?: boolean;
  homeTeamRoster?: any[];
  awayTeamRoster?: any[];
  userTeamId?: string;
  isLocked?: boolean;
}

export function MatchMVPVoteWidget({
  matchId,
  isPlayed,
  isAdmin,
  isReferee,
  homeTeamRoster = [],
  awayTeamRoster = [],
  userTeamId,
  isLocked,
}: MatchMVPVoteWidgetProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);

  const [selectedMembershipId, setSelectedMembershipId] = useState<string | null>(null);

  const { data: tallyData, isLoading, refetch } = useGetMVPVotes(matchId, isPlayed);
  const voteMutation = useVoteMVP(matchId);
  const lockMutation = useLockMVPVote(matchId);

  if (!isPlayed) {
    return null;
  }

  // Determine eligible candidates based on user role:
  // If player: can ONLY vote for opposing team's starters
  // If referee or admin: can vote for any player on either team
  let eligibleCandidates: any[] = [];
  const allCandidates = [...homeTeamRoster, ...awayTeamRoster];

  const playerProfileId = user?.player_profile_id || (user as any)?.player_profile?.id;
  const isHomePlayer = homeTeamRoster.some(
    (m) =>
      (userTeamId && (m.team === userTeamId || m.team_id === userTeamId)) ||
      (playerProfileId && (m.player?.id === playerProfileId || m.id === playerProfileId || m.player_id === playerProfileId))
  );
  const isAwayPlayer = awayTeamRoster.some(
    (m) =>
      (userTeamId && (m.team === userTeamId || m.team_id === userTeamId)) ||
      (playerProfileId && (m.player?.id === playerProfileId || m.id === playerProfileId || m.player_id === playerProfileId))
  );
  const isUserReferee = isReferee || Boolean(user?.id && (user as any)?.referee_profile?.id);

  if (isAdmin || isUserReferee) {
    eligibleCandidates = allCandidates;
  } else if (isHomePlayer) {
    eligibleCandidates = awayTeamRoster;
  } else if (isAwayPlayer) {
    eligibleCandidates = homeTeamRoster;
  } else {
    // If not on either starting XI and not referee/admin, user cannot vote per Ticket 18
    eligibleCandidates = [];
  }

  // Filter out current user from candidates (cannot vote for self)
  if (playerProfileId) {
    eligibleCandidates = eligibleCandidates.filter(
      (c) =>
        c.player?.id !== playerProfileId &&
        c.id !== playerProfileId &&
        c.player_id !== playerProfileId
    );
  }

  const handleVote = async () => {
    if (!selectedMembershipId) {
      Alert.alert('Selecciona un candidato', 'Elige al jugador que consideres el MVP del encuentro.');
      return;
    }

    try {
      await voteMutation.mutateAsync({ voted_for: selectedMembershipId });
      Alert.alert('¡Voto registrado!', 'Tu voto por el MVP ha sido contabilizado.');
      refetch();
    } catch (err: any) {
      Alert.alert('Error al votar', err?.message || 'No se pudo registrar tu voto.');
    }
  };

  const handleLockVote = () => {
    Alert.alert(
      'Cerrar Votación MVP',
      '¿Deseas cerrar la votación y confirmar el MVP de este partido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar y Declarar MVP',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await lockMutation.mutateAsync();
              Alert.alert('Votación Cerrada', `El MVP ha sido asignado formalmente.`);
              refetch();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo cerrar la votación.');
            }
          },
        },
      ]
    );
  };

  const results = tallyData?.results || [];
  const maxScore = Math.max(...results.map((r) => r.score || 0), 1);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Award size={20} color={theme.primary} />
          <Text style={styles.title}>VOTACIÓN MVP DEL PARTIDO</Text>
        </View>
        {(isAdmin || isReferee) && !isLocked && (
          <TouchableOpacity
            style={styles.lockBtn}
            onPress={handleLockVote}
            disabled={lockMutation.isPending}
          >
            {lockMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Lock size={12} color="#FFF" />
                <Text style={styles.lockBtnText}>Cerrar Votación</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>
        {isLocked
          ? 'La votación ha sido cerrada y el MVP del partido ha sido oficializado.'
          : 'Jugadores titulares votan por un rival. El score normalizado decide al ganador.'}
      </Text>

      {/* Live Tally Results */}
      {isLoading ? (
        <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 16 }} />
      ) : results.length > 0 ? (
        <View style={styles.resultsList}>
          {results.map((item, idx) => {
            const barWidth = `${Math.min(100, Math.round((item.score / maxScore) * 100))}%`;
            return (
              <View key={item.roster_membership || idx} style={styles.tallyItem}>
                <View style={styles.tallyInfoRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    <Text style={styles.rankText}>#{idx + 1}</Text>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {item.player_name}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.votesCount}>{item.votes} votos</Text>
                    <Text style={styles.scoreText}>Score {item.score.toFixed(2)}</Text>
                  </View>
                </View>
                {/* Progress Bar */}
                <View style={styles.barBackground}>
                  <View style={[styles.barFill, { width: barWidth as any }]} />
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Aún no se han emitido votos para este partido.</Text>
        </View>
      )}

      {/* Vote Form */}
      {!isLocked && eligibleCandidates.length > 0 ? (
        <View style={styles.votingSection}>
          <Text style={styles.sectionHeader}>
            {isUserReferee || isAdmin
              ? 'Elige candidato a MVP (Árbitro / Admin):'
              : isHomePlayer
              ? 'Vota por tu MVP rival (Visitante):'
              : 'Vota por tu MVP rival (Local):'}
          </Text>
          <View style={styles.candidatesGrid}>
            {eligibleCandidates.slice(0, 10).map((cand) => {
              const candId = cand.id;
              const candName = cand.player?.full_name || cand.player_name || 'Jugador';
              const isSelected = selectedMembershipId === candId;

              return (
                <TouchableOpacity
                  key={candId}
                  style={[styles.candidateChip, isSelected && styles.candidateChipSelected]}
                  onPress={() => setSelectedMembershipId(candId)}
                  activeOpacity={0.7}
                >
                  <User size={14} color={isSelected ? '#001A2C' : theme.textSecondary} />
                  <Text
                    style={[styles.candidateName, isSelected && styles.candidateNameSelected]}
                    numberOfLines={1}
                  >
                    {candName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.voteBtn,
              (!selectedMembershipId || voteMutation.isPending) && { opacity: 0.6 },
            ]}
            onPress={handleVote}
            disabled={!selectedMembershipId || voteMutation.isPending}
          >
            {voteMutation.isPending ? (
              <ActivityIndicator size="small" color="#001A2C" />
            ) : (
              <Text style={styles.voteBtnText}>Confirmar Voto de MVP</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : !isLocked ? (
        <View style={styles.spectatorBox}>
          <Text style={styles.spectatorText}>
            ℹ️ Votación exclusiva para jugadores titulares del partido y el árbitro oficial.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 18,
      marginHorizontal: 16,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    title: {
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 1,
      color: theme.text,
    },
    lockBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#EF4444',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    lockBtnText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFF',
    },
    subtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 16,
      marginBottom: 14,
    },
    resultsList: {
      gap: 10,
      marginBottom: 16,
    },
    tallyItem: {
      gap: 4,
    },
    tallyInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rankText: {
      fontSize: 11,
      fontWeight: '900',
      color: theme.primary,
      width: 22,
    },
    playerName: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
    votesCount: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    scoreText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.primary,
    },
    barBackground: {
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 3,
    },
    emptyBox: {
      paddingVertical: 14,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    votingSection: {
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      paddingTop: 14,
      gap: 10,
    },
    sectionHeader: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.text,
    },
    candidatesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    candidateChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    },
    candidateChipSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    candidateName: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
    },
    candidateNameSelected: {
      color: '#001A2C',
      fontWeight: '900',
    },
    voteBtn: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
    },
    voteBtnText: {
      fontSize: 13,
      fontWeight: '900',
      color: '#001A2C',
    },
    spectatorBox: {
      marginTop: 10,
      padding: 10,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    spectatorText: {
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });
