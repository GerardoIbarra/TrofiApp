import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Layers, Trophy, Check, X, Calendar, MapPin } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { League } from '@/features/leagues/types/league';
import { Tournament } from '@/features/tournaments/types/tournament';
import {
  useApproveLeague,
  useRejectLeague,
  useApproveTournament,
  useRejectTournament,
} from '@/features/superadmin/services/superadminApi';

interface ApprovalActionCardProps {
  type: 'league' | 'tournament';
  item: League | Tournament;
  onSuccess?: () => void;
}

export const ApprovalActionCard: React.FC<ApprovalActionCardProps> = ({
  type,
  item,
  onSuccess,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const approveLeagueMutation = useApproveLeague();
  const rejectLeagueMutation = useRejectLeague();
  const approveTournamentMutation = useApproveTournament();
  const rejectTournamentMutation = useRejectTournament();

  const isLeague = type === 'league';
  const leagueItem = item as League;
  const tournamentItem = item as Tournament;

  const isPendingAction =
    approveLeagueMutation.isPending ||
    rejectLeagueMutation.isPending ||
    approveTournamentMutation.isPending ||
    rejectTournamentMutation.isPending;

  const handleApprove = () => {
    Alert.alert(
      `Aprobar ${isLeague ? 'Liga' : 'Torneo'}`,
      `¿Confirmas la aprobación de "${item.name}"? Quedará visible y habilitado para crear competencias y partidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          onPress: () => {
            if (isLeague) {
              approveLeagueMutation.mutate(item.id, {
                onSuccess: () => {
                  Alert.alert('¡Aprobada!', `La liga "${item.name}" fue aprobada.`);
                  onSuccess?.();
                },
                onError: (err: any) => {
                  Alert.alert('Error', err?.response?.data?.detail || 'No se pudo aprobar.');
                },
              });
            } else {
              approveTournamentMutation.mutate(item.id, {
                onSuccess: () => {
                  Alert.alert('¡Aprobado!', `El torneo "${item.name}" fue aprobado.`);
                  onSuccess?.();
                },
                onError: (err: any) => {
                  Alert.alert('Error', err?.response?.data?.detail || 'No se pudo aprobar.');
                },
              });
            }
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      `Rechazar ${isLeague ? 'Liga' : 'Torneo'}`,
      `¿Estás seguro de rechazar "${item.name}"? No se podrán crear elementos derivados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => {
            if (isLeague) {
              rejectLeagueMutation.mutate(item.id, {
                onSuccess: () => {
                  Alert.alert('Rechazada', `La liga "${item.name}" fue rechazada.`);
                  onSuccess?.();
                },
                onError: (err: any) => {
                  Alert.alert('Error', err?.response?.data?.detail || 'No se pudo rechazar.');
                },
              });
            } else {
              rejectTournamentMutation.mutate(item.id, {
                onSuccess: () => {
                  Alert.alert('Rechazado', `El torneo "${item.name}" fue rechazado.`);
                  onSuccess?.();
                },
                onError: (err: any) => {
                  Alert.alert('Error', err?.response?.data?.detail || 'No se pudo rechazar.');
                },
              });
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.headerRow}>
        <View
          style={[
            styles.typePill,
            {
              backgroundColor: isLeague ? 'rgba(56, 189, 248, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            },
          ]}
        >
          {isLeague ? (
            <Layers size={12} color={theme.primary} />
          ) : (
            <Trophy size={12} color="#F59E0B" />
          )}
          <Text
            style={[
              styles.typePillText,
              { color: isLeague ? theme.primary : '#F59E0B' },
            ]}
          >
            {isLeague ? 'LIGA PENDIENTE' : 'TORNEO PENDIENTE'}
          </Text>
        </View>

        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      <Text style={[styles.title, { color: theme.text }]}>{item.name}</Text>

      <View style={styles.metaRow}>
        {isLeague ? (
          <View style={styles.detailRow}>
            <MapPin size={13} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              {leagueItem.city}, {leagueItem.country}
            </Text>
          </View>
        ) : (
          <View style={styles.detailRow}>
            <Layers size={13} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              {tournamentItem.league_name || 'Liga asociada'} ({tournamentItem.format})
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.approveBtn, { backgroundColor: '#10B981' }]}
          onPress={handleApprove}
          disabled={isPendingAction}
        >
          {isPendingAction ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Check size={14} color="#FFFFFF" />
              <Text style={styles.approveBtnText}>Aprobar</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.rejectBtn, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }]}
          onPress={handleReject}
          disabled={isPendingAction}
        >
          <X size={14} color="#EF4444" />
          <Text style={[styles.rejectBtnText, { color: '#EF4444' }]}>Rechazar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    typePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    typePillText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    dateText: {
      fontSize: 11,
      fontWeight: '500',
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 6,
    },
    metaRow: {
      marginBottom: 14,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    detailText: {
      fontSize: 12,
      fontWeight: '500',
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    approveBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 38,
      borderRadius: 10,
    },
    approveBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    rejectBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 16,
      height: 38,
      borderRadius: 10,
      borderWidth: 1,
    },
    rejectBtnText: {
      fontSize: 13,
      fontWeight: '700',
    },
  });
