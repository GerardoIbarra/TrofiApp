import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Check, X, Users, AlertCircle, Settings } from 'lucide-react-native';
import { useGetMatchAttendance, useConfirmAttendance } from '@/features/matches/services/matchApi';
import { CaptainAttendanceModal } from './CaptainAttendanceModal';
import { useAuthStore } from '@/features/auth/store/authStore';

interface AttendanceWidgetProps {
  matchId: string;
  isCaptain?: boolean;
  userTeamId?: string;
  roster?: any[];
}

export function AttendanceWidget({ matchId, isCaptain, userTeamId, roster = [] }: AttendanceWidgetProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);

  const [isCaptainModalVisible, setIsCaptainModalVisible] = useState(false);
  const { data, isLoading } = useGetMatchAttendance(matchId);
  const confirmMutation = useConfirmAttendance();

  const handleConfirmStatus = (status: 'confirmed' | 'declined') => {
    confirmMutation.mutate({
      matchId,
      data: { status }
    }, {
      onSuccess: () => {
        Alert.alert('Éxito', status === 'confirmed' ? 'Asistencia confirmada.' : 'Asistencia rechazada.');
      },
      onError: (err: any) => {
        Alert.alert('Error', err?.response?.data?.detail || 'No se pudo registrar la asistencia.');
      }
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }

  if (!data) {
    return null; // Don't render if no data (e.g. error or not applicable)
  }

  const renderTeamStats = (teamName: string, stats: any) => {
    const isDeficient = stats.confirmed < stats.required;
    
    return (
      <View style={styles.teamStats}>
        <Text style={[styles.teamName, { color: theme.text }]}>{teamName}</Text>
        <View style={styles.statsRow}>
          <Text style={[styles.statValue, { color: theme.textSecondary }]}>
            <Text style={{ color: isDeficient ? '#FF4444' : theme.text, fontWeight: '800' }}>{stats.confirmed}</Text> / {stats.required} mín
          </Text>
          {isDeficient && <AlertCircle size={14} color="#FF4444" style={{ marginLeft: 5 }} />}
        </View>
        <View style={styles.progressBarBg}>
           <View style={[styles.progressBarFill, { width: `${Math.min(100, (stats.confirmed / Math.max(1, stats.required)) * 100)}%`, backgroundColor: isDeficient ? '#FF4444' : theme.primary }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
      <View style={styles.header}>
        <Users size={18} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>Confirmación de Asistencia</Text>
      </View>

      <View style={styles.summaryContainer}>
        {renderTeamStats(data.home.team_name, data.home)}
        <View style={styles.divider} />
        {renderTeamStats(data.away.team_name, data.away)}
      </View>

      {/* User Actions */}
      <View style={styles.actionsContainer}>
        <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>¿Vas a asistir al partido?</Text>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
            onPress={() => handleConfirmStatus('confirmed')}
            disabled={confirmMutation.isPending}
          >
            <Check size={16} color={theme.primary} />
            <Text style={[styles.btnText, { color: theme.primary }]}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: '#FF444420', borderColor: '#FF4444' }]}
            onPress={() => handleConfirmStatus('declined')}
            disabled={confirmMutation.isPending}
          >
            <X size={16} color="#FF4444" />
            <Text style={[styles.btnText, { color: '#FF4444' }]}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Captain Actions */}
      {isCaptain && userTeamId && (
        <View style={styles.captainArea}>
          <TouchableOpacity 
            style={[styles.captainBtn, { borderColor: theme.primary }]}
            onPress={() => setIsCaptainModalVisible(true)}
          >
            <Settings size={14} color={theme.primary} />
            <Text style={[styles.captainBtnText, { color: theme.primary }]}>Gestionar Equipo</Text>
          </TouchableOpacity>
        </View>
      )}

      {isCaptainModalVisible && userTeamId && (
        <CaptainAttendanceModal 
          matchId={matchId}
          teamId={userTeamId}
          roster={roster}
          onClose={() => setIsCaptainModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  teamStats: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(150,150,150,0.2)',
    marginHorizontal: 15,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(150,150,150,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionsContainer: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.1)',
  },
  actionLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    flex: 1,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  captainArea: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.1)',
    alignItems: 'center',
  },
  captainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  captainBtnText: {
    fontSize: 12,
    fontWeight: '700',
  }
});
