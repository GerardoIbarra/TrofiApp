import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CheckCircle2, XCircle, X, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { MatchDispute } from '@/features/tournaments/types/matchDispute';
import {
  useUpholdMatchDispute,
  useRejectMatchDispute,
} from '@/features/tournaments/services/matchDisputeApi';

interface ResolveDisputeModalProps {
  visible: boolean;
  onClose: () => void;
  dispute: MatchDispute;
  matchId: string;
  onSuccess?: () => void;
}

export function ResolveDisputeModal({
  visible,
  onClose,
  dispute,
  matchId,
  onSuccess,
}: ResolveDisputeModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const upholdMutation = useUpholdMatchDispute();
  const rejectMutation = useRejectMatchDispute();
  const isPending = upholdMutation.isPending || rejectMutation.isPending;

  const handleUphold = () => {
    Alert.alert(
      'Declarar Procedente',
      'Al aceptar la disputa, el resultado del partido quedará DESBLOQUEADO para que un administrador pueda corregir el marcador o declarar forfeit. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Aceptar y Desbloquear',
          onPress: async () => {
            try {
              await upholdMutation.mutateAsync({
                disputeId: dispute.id,
                matchId,
                payload: { resolution_notes: resolutionNotes.trim() || undefined },
              });
              Alert.alert('Disputa aceptada', 'El resultado ha sido desbloqueado para su corrección.');
              onClose();
              if (onSuccess) onSuccess();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo resolver la disputa.');
            }
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Desestimar Disputa',
      'El resultado permanecerá bloqueado exactamente como fue cargado. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Desestimar',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectMutation.mutateAsync({
                disputeId: dispute.id,
                matchId,
                payload: { resolution_notes: resolutionNotes.trim() || undefined },
              });
              Alert.alert('Disputa desestimada', 'El resultado original se mantiene en firme.');
              onClose();
              if (onSuccess) onSuccess();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo desestimar la disputa.');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <ShieldAlert size={20} color={theme.primary} />
              <Text style={styles.headerTitle}>Resolución de Disputa</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Dispute Context Box */}
          <View style={styles.disputeDetails}>
            <Text style={styles.filedByText}>
              Presentada por:{' '}
              <Text style={styles.boldText}>
                {dispute.filed_by_name || 'Capitán / Admin'}
                {dispute.filed_by_team_name ? ` (${dispute.filed_by_team_name})` : ''}
              </Text>
            </Text>
            <Text style={styles.reasonText}>"{dispute.reason}"</Text>
          </View>

          {/* Notes Input */}
          <Text style={styles.label}>Dictamen / Notas de Resolución</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Explica la decisión (ej: comprobado con planilla arbitral / desestimado por falta de evidencia)..."
            placeholderTextColor={theme.textSecondary}
            value={resolutionNotes}
            onChangeText={setResolutionNotes}
            multiline
            numberOfLines={3}
            maxLength={1000}
          />

          {/* Action Buttons */}
          <View style={styles.actionsColumn}>
            <TouchableOpacity
              style={[styles.upholdBtn, isPending && styles.btnDisabled]}
              onPress={handleUphold}
              disabled={isPending}
            >
              {upholdMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <CheckCircle2 size={16} color="#FFF" />
                  <Text style={styles.upholdBtnText}>Procedente (Desbloquear Resultado)</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rejectBtn, isPending && styles.btnDisabled]}
              onPress={handleReject}
              disabled={isPending}
            >
              {rejectMutation.isPending ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <XCircle size={16} color="#EF4444" />
                  <Text style={styles.rejectBtnText}>Desestimar (Mantener Resultado)</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalCard: {
      width: '100%',
      maxWidth: 480,
      backgroundColor: isDark ? '#0F172A' : '#FFF',
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },
    closeBtn: {
      padding: 4,
    },
    disputeDetails: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
      borderRadius: 12,
      padding: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    filedByText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    boldText: {
      fontWeight: '700',
      color: theme.text,
    },
    reasonText: {
      fontSize: 13,
      color: theme.text,
      fontStyle: 'italic',
      lineHeight: 18,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    textArea: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      padding: 12,
      fontSize: 14,
      color: theme.text,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: 16,
    },
    actionsColumn: {
      gap: 10,
    },
    upholdBtn: {
      backgroundColor: '#10B981',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 10,
      gap: 6,
    },
    upholdBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FFF',
    },
    rejectBtn: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.3)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 10,
      gap: 6,
    },
    rejectBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#EF4444',
    },
    btnDisabled: {
      opacity: 0.5,
    },
  });
