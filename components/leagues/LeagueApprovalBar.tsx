import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { ShieldCheck, Check, X, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { League } from '@/features/leagues/types/league';
import { useApproveLeague, useRejectLeague } from '@/features/leagues/services/leagueApi';
import { metrics } from '@/services/metrics';

interface LeagueApprovalBarProps {
  league: League;
  onStatusChanged?: () => void;
}

export const LeagueApprovalBar: React.FC<LeagueApprovalBarProps> = ({
  league,
  onStatusChanged,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const { showToast } = useToast();

  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const approveMutation = useApproveLeague();
  const rejectMutation = useRejectLeague();

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = () => {
    Alert.alert(
      'Aprobar Liga',
      `¿Confirmas la aprobación de "${league.name}"? La liga quedará activa y visible para toda la comunidad.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar Liga',
          onPress: () => {
            approveMutation.mutate(league.id, {
              onSuccess: () => {
                metrics.trackApprovalAction('league', 'approved');
                showToast({
                  type: 'success',
                  title: '¡Liga Aprobada!',
                  message: `La liga "${league.name}" ha sido aprobada correctamente.`,
                });
                onStatusChanged?.();
              },
              onError: (err: any) => {
                showToast({
                  type: 'error',
                  title: 'Error',
                  message: err?.response?.data?.detail || 'No se pudo aprobar la liga.',
                });
              },
            });
          },
        },
      ]
    );
  };

  const handleConfirmReject = () => {
    const reasonToSend = rejectReason.trim();
    rejectMutation.mutate(
      { id: league.id, reason: reasonToSend || undefined },
      {
        onSuccess: () => {
          metrics.trackApprovalAction('league', 'rejected');
          setIsRejectModalVisible(false);
          setRejectReason('');
          showToast({
            type: 'info',
            title: 'Liga Rechazada',
            message: `La liga "${league.name}" fue marcada como rechazada.`,
          });
          onStatusChanged?.();
        },
        onError: (err: any) => {
          showToast({
            type: 'error',
            title: 'Error',
            message: err?.response?.data?.detail || 'No se pudo rechazar la liga.',
          });
        },
      }
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={18} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Revisión de Liga (Trofi Staff)</Text>
            <Text style={styles.subtitle}>
              {league.approval_status === 'pending'
                ? 'Esta liga está pendiente de tu aprobación.'
                : league.approval_status === 'approved'
                ? 'Esta liga ya se encuentra aprobada.'
                : 'Esta liga fue rechazada.'}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              league.approval_status === 'approved'
                ? styles.approvedBadge
                : league.approval_status === 'rejected'
                ? styles.rejectedBadge
                : styles.pendingBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                league.approval_status === 'approved'
                  ? styles.approvedText
                  : league.approval_status === 'rejected'
                  ? styles.rejectedText
                  : styles.pendingText,
              ]}
            >
              {league.approval_status === 'approved'
                ? 'Aprobada'
                : league.approval_status === 'rejected'
                ? 'Rechazada'
                : 'Pendiente'}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn, isPending && styles.disabledBtn]}
            onPress={handleApprove}
            disabled={isPending}
            activeOpacity={0.8}
          >
            {approveMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Check size={16} color="#FFF" />
                <Text style={styles.approveBtnText}>Aprobar Liga</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn, isPending && styles.disabledBtn]}
            onPress={() => setIsRejectModalVisible(true)}
            disabled={isPending}
            activeOpacity={0.8}
          >
            {rejectMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <X size={16} color="#EF4444" />
                <Text style={styles.rejectBtnText}>Rechazar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Rechazo con Motivo Opcional */}
      <Modal
        visible={isRejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <AlertCircle size={24} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>Rechazar Liga</Text>
              <Text style={styles.modalSubtitle}>
                Puedes ingresar un motivo de rechazo opcional para que los administradores de la liga sepan qué corregir.
              </Text>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Ej: Falta información de contacto o no cumple los requisitos."
              placeholderTextColor={theme.textSecondary}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn]}
                onPress={() => {
                  setIsRejectModalVisible(false);
                  setRejectReason('');
                }}
                disabled={rejectMutation.isPending}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmRejectBtn]}
                onPress={handleConfirmReject}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmRejectBtnText}>Confirmar Rechazo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFF',
      borderRadius: 16,
      marginHorizontal: 20,
      marginTop: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.primary + '40',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
    },
    subtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    pendingBadge: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    approvedBadge: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    rejectedBadge: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    statusText: {
      fontSize: 11,
      fontWeight: '800',
    },
    pendingText: {
      color: '#F59E0B',
    },
    approvedText: {
      color: '#10B981',
    },
    rejectedText: {
      color: '#EF4444',
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      gap: 6,
    },
    approveBtn: {
      backgroundColor: '#10B981',
    },
    approveBtnText: {
      color: '#FFF',
      fontSize: 13,
      fontWeight: '800',
    },
    rejectBtn: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    rejectBtnText: {
      color: '#EF4444',
      fontSize: 13,
      fontWeight: '800',
    },
    disabledBtn: {
      opacity: 0.5,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: isDark ? '#181A20' : '#FFF',
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 16,
    },
    modalIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 6,
    },
    modalSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 17,
    },
    textInput: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
      borderRadius: 12,
      padding: 12,
      color: theme.text,
      fontSize: 13,
      minHeight: 80,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      marginBottom: 16,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 10,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelModalBtn: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    },
    cancelBtnText: {
      color: theme.textSecondary,
      fontWeight: '700',
      fontSize: 13,
    },
    confirmRejectBtn: {
      backgroundColor: '#EF4444',
    },
    confirmRejectBtnText: {
      color: '#FFF',
      fontWeight: '800',
      fontSize: 13,
    },
  });
