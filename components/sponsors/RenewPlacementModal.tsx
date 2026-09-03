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
import { X, Calendar, RefreshCw, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { SponsorPlacement } from '@/features/sponsors/types/sponsor';
import { useRenewSponsorPlacement } from '@/features/sponsors/services/sponsorApi';

interface RenewPlacementModalProps {
  visible: boolean;
  onClose: () => void;
  placement: SponsorPlacement | null;
}

const PRESET_DAYS = [30, 60, 90];

export const RenewPlacementModal: React.FC<RenewPlacementModalProps> = ({
  visible,
  onClose,
  placement,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [extendDays, setExtendDays] = useState<number>(30);
  const [customDays, setCustomDays] = useState<string>('30');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const renewMutation = useRenewSponsorPlacement();

  if (!placement) return null;

  const handlePresetSelect = (days: number) => {
    setExtendDays(days);
    setCustomDays(String(days));
    setIsCustom(false);
  };

  const handleCustomChange = (text: string) => {
    const val = parseInt(text.replace(/[^0-9]/g, ''), 10);
    setCustomDays(text);
    setIsCustom(true);
    if (!isNaN(val) && val > 0) {
      setExtendDays(val);
    }
  };

  // Calculate preview of new end date
  const computeNewEndDate = () => {
    try {
      const now = new Date();
      const currentEnd = new Date(placement.ends_at);
      const isExpired = currentEnd.getTime() < now.getTime() || placement.is_expired;
      const baseDate = isExpired ? now : currentEnd;
      const newDate = new Date(baseDate.getTime() + extendDays * 24 * 60 * 60 * 1000);
      return newDate.toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const handleRenew = () => {
    if (extendDays <= 0) {
      Alert.alert('Error', 'Debes ingresar un número válido de días para renovar.');
      return;
    }

    renewMutation.mutate(
      {
        id: placement.id,
        data: { extend_days: extendDays },
      },
      {
        onSuccess: () => {
          Alert.alert(
            '¡Renovación exitosa!',
            `El espacio publicitario fue extendido por ${extendDays} días y reactivado.`
          );
          onClose();
        },
        onError: (err: any) => {
          const detail =
            err?.response?.data?.detail ||
            err?.message ||
            'No tienes permisos para renovar este patrocinio o ha ocurrido un error.';
          Alert.alert('Error al renovar', detail);
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
              <RefreshCw size={20} color={theme.primary} />
              <Text style={[styles.title, { color: theme.text }]}>Renovar Patrocinio</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {placement.title || placement.sponsor_name || 'Espacio publicitario'}
            </Text>

            <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
              <View style={styles.infoRow}>
                <Calendar size={15} color={theme.textSecondary} />
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Fecha actual de fin:</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {new Date(placement.ends_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <CheckCircle2 size={15} color="#10B981" />
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Nueva fecha proyectada:</Text>
                <Text style={[styles.infoValueHighlight, { color: theme.primary }]}>
                  {computeNewEndDate()}
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: theme.text }]}>
              Selecciona el periodo a extender (días)
            </Text>

            <View style={styles.presetsRow}>
              {PRESET_DAYS.map((days) => {
                const active = !isCustom && extendDays === days;
                return (
                  <TouchableOpacity
                    key={days}
                    onPress={() => handlePresetSelect(days)}
                    style={[
                      styles.presetBtn,
                      active && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        { color: active ? '#001A2C' : theme.text },
                      ]}
                    >
                      +{days} días
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.customInputRow}>
              <Text style={[styles.customLabel, { color: theme.textSecondary }]}>Personalizado:</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderColor: isCustom ? theme.primary : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  },
                ]}
                keyboardType="numeric"
                value={customDays}
                onChangeText={handleCustomChange}
                placeholder="Días"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleRenew}
              disabled={renewMutation.isPending}
            >
              {renewMutation.isPending ? (
                <ActivityIndicator size="small" color="#001A2C" />
              ) : (
                <Text style={styles.submitBtnText}>Confirmar y Renovar</Text>
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
    infoBox: {
      borderRadius: 12,
      padding: 14,
      gap: 10,
      marginBottom: 20,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    infoLabel: {
      fontSize: 12,
      fontWeight: '500',
      flex: 1,
    },
    infoValue: {
      fontSize: 13,
      fontWeight: '700',
    },
    infoValueHighlight: {
      fontSize: 13,
      fontWeight: '800',
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 12,
    },
    presetsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    presetBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
      alignItems: 'center',
    },
    presetText: {
      fontSize: 13,
      fontWeight: '700',
    },
    customInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    customLabel: {
      fontSize: 13,
      fontWeight: '600',
    },
    textInput: {
      width: 100,
      height: 40,
      borderRadius: 10,
      borderWidth: 1,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '700',
    },
    submitBtn: {
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitBtnText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#001A2C',
    },
  });
