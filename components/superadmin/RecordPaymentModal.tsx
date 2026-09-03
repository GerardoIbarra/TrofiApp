import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, DollarSign, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCreatePaymentRecord } from '@/features/superadmin/services/superadminApi';
import { metrics } from '@/services/metrics';

interface RecordPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  leagueId: string;
  leagueName?: string;
  onSuccess?: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  visible,
  onClose,
  leagueId,
  leagueName,
  onSuccess,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [amount, setAmount] = useState('150.00');
  const [notes, setNotes] = useState('');

  const createPaymentMutation = useCreatePaymentRecord();

  const handleRecord = () => {
    const cleanAmount = amount.trim();
    if (!cleanAmount || isNaN(Number(cleanAmount)) || Number(cleanAmount) <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido.');
      return;
    }

    createPaymentMutation.mutate(
      {
        league: leagueId,
        amount: cleanAmount,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          metrics.trackPaymentLogged(Number(cleanAmount));
          Alert.alert(
            '¡Pago Registrado!',
            `El pago de $${cleanAmount} fue asentado correctamente. La liga ha quedado marcada como "Al día" (up_to_date).`
          );
          onSuccess?.();
          onClose();
        },
        onError: (err: any) => {
          const detail =
            err?.response?.data?.detail ||
            err?.message ||
            'No se pudo registrar el pago. Asegúrate de tener permisos de staff de Trofi.';
          Alert.alert('Error al registrar pago', detail);
        },
      }
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <DollarSign size={20} color="#10B981" />
              <Text style={[styles.title, { color: theme.text }]}>Registrar Pago de Liga</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {leagueName ? `Liga: ${leagueName}` : 'Registrar cuota administrativa'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Monto ($)</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  },
                ]}
                keyboardType="decimal-pad"
                placeholder="150.00"
                placeholderTextColor={theme.textSecondary}
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Concepto o Notas (Opcional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  },
                ]}
                placeholder="Ej: Cuota mensual marzo 2026"
                placeholderTextColor={theme.textSecondary}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <View style={[styles.infoBanner, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={styles.infoText}>
                Al asentar el pago, el estado de la liga se actualizará automáticamente a "Al día" (up_to_date).
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: '#10B981' }]}
              onPress={handleRecord}
              disabled={createPaymentMutation.isPending}
            >
              {createPaymentMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Confirmar y Asentar Pago</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    title: {
      fontSize: 17,
      fontWeight: '800',
    },
    closeBtn: {
      padding: 4,
    },
    body: {
      padding: 20,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 14,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 6,
    },
    input: {
      height: 44,
      borderRadius: 10,
      paddingHorizontal: 12,
      fontSize: 14,
      borderWidth: 1,
    },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 10,
      marginBottom: 20,
    },
    infoText: {
      flex: 1,
      fontSize: 11,
      color: '#10B981',
      fontWeight: '600',
      lineHeight: 15,
    },
    submitBtn: {
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#FFFFFF',
    },
  });
