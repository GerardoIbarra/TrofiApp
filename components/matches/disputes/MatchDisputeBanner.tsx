import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle2, XCircle, ShieldAlert, Gavel } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { MatchDispute } from '@/features/tournaments/types/matchDispute';

interface MatchDisputeBannerProps {
  disputes: MatchDispute[];
  canResolve?: boolean;
  canFile?: boolean;
  onResolvePress?: (dispute: MatchDispute) => void;
  onFilePress?: () => void;
}

export function MatchDisputeBanner({
  disputes,
  canResolve = false,
  canFile = false,
  onResolvePress,
  onFilePress,
}: MatchDisputeBannerProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const pendingDispute = disputes.find((d) => d.status === 'pending');
  const latestResolvedDispute = !pendingDispute
    ? disputes.filter((d) => d.status !== 'pending')[0]
    : null;

  if (pendingDispute) {
    return (
      <View style={styles.pendingCard}>
        <View style={styles.topRow}>
          <View style={styles.badgePending}>
            <ShieldAlert size={14} color="#F59E0B" />
            <Text style={styles.badgePendingText}>DISPUTA EN REVISIÓN</Text>
          </View>
          {canResolve && onResolvePress && (
            <TouchableOpacity
              style={styles.resolveBtn}
              onPress={() => onResolvePress(pendingDispute)}
              activeOpacity={0.8}
            >
              <Gavel size={13} color="#001A2C" />
              <Text style={styles.resolveBtnText}>Resolver</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.pendingReason} numberOfLines={2}>
          "{pendingDispute.reason}"
        </Text>
        <Text style={styles.filedBySub}>
          Presentada por {pendingDispute.filed_by_name || 'Capitán / Admin'}
          {pendingDispute.filed_by_team_name ? ` (${pendingDispute.filed_by_team_name})` : ''} •{' '}
          {new Date(pendingDispute.created_at).toLocaleDateString()}
        </Text>
      </View>
    );
  }

  if (latestResolvedDispute) {
    const isUpheld = latestResolvedDispute.status === 'upheld';
    return (
      <View style={isUpheld ? styles.upheldCard : styles.rejectedCard}>
        <View style={styles.topRow}>
          <View style={isUpheld ? styles.badgeUpheld : styles.badgeRejected}>
            {isUpheld ? (
              <CheckCircle2 size={14} color="#10B981" />
            ) : (
              <XCircle size={14} color="#EF4444" />
            )}
            <Text style={isUpheld ? styles.badgeUpheldText : styles.badgeRejectedText}>
              {isUpheld ? 'DISPUTA PROCEDENTE (DESBLOQUEADO)' : 'DISPUTA DESESTIMADA'}
            </Text>
          </View>
          {canFile && onFilePress && (
            <TouchableOpacity style={styles.refileBtn} onPress={onFilePress}>
              <Text style={styles.refileBtnText}>Nueva Disputa</Text>
            </TouchableOpacity>
          )}
        </View>

        {latestResolvedDispute.resolution_notes && (
          <Text style={styles.resolutionNotes}>
            Dictamen: {latestResolvedDispute.resolution_notes}
          </Text>
        )}
      </View>
    );
  }

  if (canFile && onFilePress) {
    return (
      <View style={styles.fileContainer}>
        <TouchableOpacity style={styles.fileDisputeBtn} onPress={onFilePress} activeOpacity={0.8}>
          <ShieldAlert size={14} color="#F59E0B" />
          <Text style={styles.fileDisputeBtnText}>Disputar Resultado Oficial</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    pendingCard: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    badgePending: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    badgePendingText: {
      fontSize: 10,
      fontWeight: '900',
      color: '#F59E0B',
      letterSpacing: 0.5,
    },
    resolveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#F59E0B',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 6,
    },
    resolveBtnText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#001A2C',
    },
    pendingReason: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
      fontStyle: 'italic',
      marginBottom: 6,
    },
    filedBySub: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    upheldCard: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderRadius: 14,
      padding: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    rejectedCard: {
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
      borderRadius: 14,
      padding: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    badgeUpheld: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    badgeUpheldText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#10B981',
      letterSpacing: 0.5,
    },
    badgeRejected: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    badgeRejectedText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#EF4444',
      letterSpacing: 0.5,
    },
    resolutionNotes: {
      fontSize: 12,
      color: theme.text,
      marginTop: 6,
      fontStyle: 'italic',
    },
    refileBtn: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    refileBtnText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    fileContainer: {
      marginBottom: 14,
    },
    fileDisputeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.4)',
      backgroundColor: 'rgba(245, 158, 11, 0.06)',
    },
    fileDisputeBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#F59E0B',
    },
  });
