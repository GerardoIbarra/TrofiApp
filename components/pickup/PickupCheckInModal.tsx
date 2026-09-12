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
import { Zap, X, Users, MapPin, Plus, Minus } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCreatePickupCheckIn, useGetPickupCrews } from '@/features/pickup/services/pickupApi';
import { LocationService } from '@/services/locationService';

interface PickupCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  spotId: string;
  spotName?: string;
  onSuccess?: () => void;
}

export function PickupCheckInModal({
  visible,
  onClose,
  spotId,
  spotName,
  onSuccess,
}: PickupCheckInModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [note, setNote] = useState('');
  const [headcount, setHeadcount] = useState(0);
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const checkInMutation = useCreatePickupCheckIn();
  const { data: crews = [] } = useGetPickupCrews();

  const handleCheckIn = async () => {
    setIsCapturingLocation(true);
    let lat: number | undefined;
    let lng: number | undefined;

    try {
      const pos = await LocationService.fetchCurrentPosition();
      if (pos) {
        lat = pos.latitude;
        lng = pos.longitude;
      }
    } catch {
      console.log('Location not attached');
    } finally {
      setIsCapturingLocation(false);
    }

    try {
      const res = await checkInMutation.mutateAsync({
        spot: spotId,
        note: note.trim() || undefined,
        additional_headcount: headcount > 0 ? headcount : undefined,
        crew: selectedCrew || undefined,
        latitude: lat,
        longitude: lng,
      });

      const verifMsg = res.is_location_verified
        ? '✅ Ubicación verificada en el lugar.'
        : 'Check-in registrado.';

      Alert.alert('¡Estás jugando!', `${verifMsg}\nTu sesión estará activa durante aproximadamente 2 horas.`);
      setNote('');
      setHeadcount(0);
      setSelectedCrew(null);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      Alert.alert('Error al hacer check-in', err?.message || 'No se pudo registrar el check-in.');
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
              <Zap size={22} color="#F59E0B" />
              <Text style={styles.headerTitle}>¡Estoy jugando acá!</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {spotName && <Text style={styles.spotSubtitle}>{spotName}</Text>}

          {/* Note Input */}
          <Text style={styles.label}>Estado / Nota (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Faltan 2 para completar reta, portero libre..."
            placeholderTextColor={theme.textSecondary}
            value={note}
            onChangeText={setNote}
            maxLength={140}
          />

          {/* Additional Headcount */}
          <Text style={styles.label}>Gente adicional contigo</Text>
          <View style={styles.headcountRow}>
            <View>
              <Text style={styles.headcountTitle}>
                {headcount === 0 ? 'Solo yo' : `Yo + ${headcount} personas más`}
              </Text>
              <Text style={styles.headcountSubtitle}>Suma a la estimación de gente en la cancha</Text>
            </View>

            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={[styles.stepBtn, headcount === 0 && styles.stepBtnDisabled]}
                onPress={() => setHeadcount((prev) => Math.max(0, prev - 1))}
                disabled={headcount === 0}
              >
                <Minus size={16} color={headcount === 0 ? theme.textSecondary : theme.text} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{headcount}</Text>
              <TouchableOpacity
                style={[styles.stepBtn, headcount >= 50 && styles.stepBtnDisabled]}
                onPress={() => setHeadcount((prev) => Math.min(50, prev + 1))}
                disabled={headcount >= 50}
              >
                <Plus size={16} color={headcount >= 50 ? theme.textSecondary : theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Crew Tagging (Optional) */}
          {crews.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Etiquetar Crew (Opcional)</Text>
              <View style={styles.crewsRow}>
                {crews.map((c) => {
                  const isSelected = selectedCrew === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.crewChip, isSelected && styles.crewChipSelected]}
                      onPress={() => setSelectedCrew(isSelected ? null : c.id)}
                    >
                      <Users size={12} color={isSelected ? '#001A2C' : theme.textSecondary} />
                      <Text style={[styles.crewChipText, isSelected && styles.crewChipTextSelected]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* GPS Info */}
          <View style={styles.gpsNotice}>
            <MapPin size={13} color={theme.primary} />
            <Text style={styles.gpsNoticeText}>
              Verificaremos automáticamente tu cercanía (menos de 300m) para validar la visita.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checkInBtn, checkInMutation.isPending && styles.btnDisabled]}
              onPress={handleCheckIn}
              disabled={checkInMutation.isPending || isCapturingLocation}
            >
              {checkInMutation.isPending || isCapturingLocation ? (
                <ActivityIndicator size="small" color="#001A2C" />
              ) : (
                <Text style={styles.checkInBtnText}>Confirmar Check-In</Text>
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
      marginBottom: 4,
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
    spotSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 8,
      marginBottom: 4,
    },
    input: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: theme.text,
    },
    headcountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
      borderRadius: 12,
      padding: 12,
      marginTop: 4,
    },
    headcountTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
    headcountSubtitle: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    stepperContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    stepBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepBtnDisabled: {
      opacity: 0.3,
    },
    stepValue: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text,
      minWidth: 20,
      textAlign: 'center',
    },
    crewsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },
    crewChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    crewChipSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    crewChipText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    crewChipTextSelected: {
      color: '#001A2C',
      fontWeight: '800',
    },
    gpsNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 14,
      backgroundColor: 'rgba(74, 222, 128, 0.08)',
      padding: 10,
      borderRadius: 8,
    },
    gpsNoticeText: {
      fontSize: 11,
      color: '#4ADE80',
      flex: 1,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 10,
      marginTop: 18,
    },
    cancelBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    cancelText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    checkInBtn: {
      backgroundColor: '#F59E0B',
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
    },
    checkInBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#001A2C',
    },
    btnDisabled: {
      opacity: 0.5,
    },
  });
