import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, CheckCircle, Clock, AlertTriangle, Settings2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { LeaguePaymentStatus } from '@/features/superadmin/types/superadmin';
import { useSetLeaguePaymentStatus } from '@/features/superadmin/services/superadminApi';

interface SetPaymentStatusModalProps {
  visible: boolean;
  onClose: () => void;
  leagueId: string;
  leagueName?: string;
  currentStatus?: LeaguePaymentStatus;
  onSuccess?: () => void;
}

export const SetPaymentStatusModal: React.FC<SetPaymentStatusModalProps> = ({
  visible,
  onClose,
  leagueId,
  leagueName,
  currentStatus = 'pending',
  onSuccess,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [selectedStatus, setSelectedStatus] = useState<LeaguePaymentStatus>(currentStatus);
  const setStatusMutation = useSetLeaguePaymentStatus();

  const handleSave = () => {
    setStatusMutation.mutate(
      {
        leagueId,
        data: { status: selectedStatus },
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Estado de Pago Actualizado',
            `La liga ahora figura como "${
              selectedStatus === 'up_to_date'
                ? 'Al día'
                : selectedStatus === 'overdue'
                ? 'Pago Vencido (bloquea creación de torneos)'
                : 'Pendiente'
            }".`
          );
          onSuccess?.();
          onClose();
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.response?.data?.detail || 'No se pudo actualizar el estado.');
        },
      }
    );
  };

  const OPTIONS: { status: LeaguePaymentStatus; label: string; desc: string; color: string; icon: any }[] = [
    {
      status: 'up_to_date',
      label: 'Al día (Up to Date)',
      desc: 'Liga solvente. Habilitada para crear torneos y generar fixtures.',
      color: '#10B981',
      icon: CheckCircle,
    },
    {
      status: 'pending',
      label: 'Pendiente (Pending)',
      desc: 'Cuota en periodo regular de cobro.',
      color: '#F59E0B',
      icon: Clock,
    },
    {
      status: 'overdue',
      label: 'Pago Vencido (Overdue)',
      desc: 'Bloquea la creación de nuevos torneos y calendarios en la liga.',
      color: '#EF4444',
      icon: AlertTriangle,
    },
  ];

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Settings2 size={20} color={theme.primary} />
              <Text style={[styles.title, { color: theme.text }]}>Estado de Cuenta</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {leagueName ? `Liga: ${leagueName}` : 'Ajustar estado administrativo'}
            </Text>

            <View style={styles.optionsList}>
              {OPTIONS.map((opt) => {
                const isSelected = selectedStatus === opt.status;
                const Icon = opt.icon;
                return (
                  <TouchableOpacity
                    key={opt.status}
                    onPress={() => setSelectedStatus(opt.status)}
                    style={[
                      styles.optionCard,
                      {
                        borderColor: isSelected
                          ? opt.color
                          : isDark
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.08)',
                        backgroundColor: isSelected
                          ? `${opt.color}15`
                          : isDark
                          ? 'rgba(255,255,255,0.02)'
                          : 'rgba(0,0,0,0.02)',
                      },
                    ]}
                  >
                    <View style={styles.optionHeader}>
                      <Icon size={16} color={opt.color} />
                      <Text style={[styles.optionTitle, { color: opt.color }]}>
                        {opt.label}
                      </Text>
                    </View>
                    <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                      {opt.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
              disabled={setStatusMutation.isPending}
            >
              {setStatusMutation.isPending ? (
                <ActivityIndicator size="small" color="#001A2C" />
              ) : (
                <Text style={styles.submitBtnText}>Actualizar Estado</Text>
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
      maxWidth: 420,
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
    optionsList: {
      gap: 10,
      marginBottom: 20,
    },
    optionCard: {
      borderRadius: 12,
      padding: 12,
      borderWidth: 1.5,
    },
    optionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    optionTitle: {
      fontSize: 13,
      fontWeight: '800',
    },
    optionDesc: {
      fontSize: 11,
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
      color: '#001A2C',
    },
  });
