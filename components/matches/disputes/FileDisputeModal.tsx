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
import { AlertTriangle, X, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useFileMatchDispute } from '@/features/tournaments/services/matchDisputeApi';

interface FileDisputeModalProps {
  visible: boolean;
  onClose: () => void;
  matchId: string;
  matchTitle?: string;
  onSuccess?: () => void;
}

export function FileDisputeModal({
  visible,
  onClose,
  matchId,
  matchTitle,
  onSuccess,
}: FileDisputeModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const [reason, setReason] = useState('');

  const fileMutation = useFileMatchDispute();

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      Alert.alert('Campo requerido', 'Por favor describe el motivo de la disputa.');
      return;
    }

    try {
      await fileMutation.mutateAsync({
        match: matchId,
        reason: trimmed,
      });

      Alert.alert(
        'Disputa presentada',
        'Tu reclamo ha sido registrado. Se ha notificado al árbitro, capitán contrario y a la administración de la liga.'
      );
      setReason('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      Alert.alert('Error al presentar disputa', err?.message || 'No se pudo registrar la disputa.');
    }
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
              <ShieldAlert size={20} color="#F59E0B" />
              <Text style={styles.headerTitle}>Disputar Resultado</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {matchTitle && <Text style={styles.matchSubtitle}>{matchTitle}</Text>}

          {/* Info Notice */}
          <View style={styles.noticeBox}>
            <AlertTriangle size={15} color="#F59E0B" />
            <Text style={styles.noticeText}>
              Las disputas solo son válidas dentro de las 48 horas posteriores al bloqueo del resultado. Al presentarla, se notificará a todas las partes oficiales.
            </Text>
          </View>

          {/* Reason Input */}
          <Text style={styles.label}>Motivo del reclamo *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe detalladamente qué ocurrió (ej: gol mal anulado, expulsión errónea, alineación indebida)..."
            placeholderTextColor={theme.textSecondary}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={fileMutation.isPending}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, (!reason.trim() || fileMutation.isPending) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!reason.trim() || fileMutation.isPending}
            >
              {fileMutation.isPending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.submitBtnText}>Presentar Disputa</Text>
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
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
    matchSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    noticeBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      padding: 10,
      borderRadius: 10,
      gap: 8,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.25)',
    },
    noticeText: {
      flex: 1,
      fontSize: 11,
      color: '#F59E0B',
      lineHeight: 16,
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
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 18,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },
    cancelBtn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    submitBtn: {
      backgroundColor: '#F59E0B',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitBtnDisabled: {
      opacity: 0.5,
    },
    submitBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#001A2C',
    },
  });
