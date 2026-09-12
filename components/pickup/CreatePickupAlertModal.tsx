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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Bell, X, MapPin, Navigation } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCreatePickupAlert } from '@/features/pickup/services/pickupApi';
import { LocationService } from '@/services/locationService';

interface CreatePickupAlertModalProps {
  visible: boolean;
  onClose: () => void;
  initialSpotId?: string;
  initialSpotName?: string;
  onSuccess?: () => void;
}

const DAYS = [
  { id: 0, label: 'L' },
  { id: 1, label: 'M' },
  { id: 2, label: 'X' },
  { id: 3, label: 'J' },
  { id: 4, label: 'V' },
  { id: 5, label: 'S' },
  { id: 6, label: 'D' },
];

export function CreatePickupAlertModal({
  visible,
  onClose,
  initialSpotId,
  initialSpotName,
  onSuccess,
}: CreatePickupAlertModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [label, setLabel] = useState('');
  const [mode, setMode] = useState<'spot' | 'radius'>(initialSpotId ? 'spot' : 'radius');
  const [spotId, setSpotId] = useState(initialSpotId || '');
  const [radiusKm, setRadiusKm] = useState('5');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('18:00:00');
  const [endTime, setEndTime] = useState('21:00:00');
  const [enableTimeWindow, setEnableTimeWindow] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const createMutation = useCreatePickupAlert();

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const pos = await LocationService.fetchCurrentPosition();
      if (pos) {
        setLatitude(pos.latitude.toString());
        setLongitude(pos.longitude.toString());
      }
    } finally {
      setIsLocating(false);
    }
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId].sort()
    );
  };

  const handleSubmit = async () => {
    const payload: any = {
      label: label.trim() || undefined,
      days_of_week: selectedDays.length > 0 ? selectedDays : undefined,
    };

    if (mode === 'spot') {
      if (!spotId.trim()) {
        Alert.alert('Cancha requerida', 'Especifica el ID de la cancha.');
        return;
      }
      payload.spot = spotId.trim();
    } else {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const rad = parseFloat(radiusKm);

      if (isNaN(lat) || isNaN(lng)) {
        Alert.alert('Ubicación requerida', 'Captura las coordenadas para el aviso por radio.');
        return;
      }
      payload.latitude = lat;
      payload.longitude = lng;
      payload.radius_km = isNaN(rad) ? 5 : rad;
    }

    if (enableTimeWindow) {
      if (!startTime || !endTime) {
        Alert.alert('Horario incompleto', 'Debes ingresar hora de inicio y fin.');
        return;
      }
      if (startTime >= endTime) {
        Alert.alert('Horario inválido', 'La hora de fin debe ser posterior a la hora de inicio (no medianoche).');
        return;
      }
      payload.start_time = startTime;
      payload.end_time = endTime;
    }

    try {
      await createMutation.mutateAsync(payload);
      Alert.alert(
        'Aviso programado',
        'Te notificaremos en tiempo real cuando alguien haga check-in que coincida con tus criterios.'
      );
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo registrar el aviso.');
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
              <Bell size={20} color={theme.primary} />
              <Text style={styles.headerTitle}>Nuevo Aviso de Reta</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Label */}
            <Text style={styles.label}>Etiqueta (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Cerca de casa / Salida del trabajo"
              placeholderTextColor={theme.textSecondary}
              value={label}
              onChangeText={setLabel}
            />

            {/* Mode Selector */}
            <Text style={styles.label}>Tipo de Cobertura</Text>
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'radius' && styles.modeTabActive]}
                onPress={() => setMode('radius')}
              >
                <Text style={[styles.modeTabText, mode === 'radius' && styles.modeTabTextActive]}>
                  Por Radio Geográfico
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeTab, mode === 'spot' && styles.modeTabActive]}
                onPress={() => setMode('spot')}
              >
                <Text style={[styles.modeTabText, mode === 'spot' && styles.modeTabTextActive]}>
                  Cancha Puntual
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'radius' ? (
              <View style={styles.sectionBox}>
                <View style={styles.geoHeader}>
                  <Text style={styles.labelInner}>Punto Central y Radio</Text>
                  <TouchableOpacity
                    style={styles.gpsBtn}
                    onPress={handleUseCurrentLocation}
                    disabled={isLocating}
                  >
                    <Navigation size={12} color={theme.primary} />
                    <Text style={styles.gpsBtnText}>Mi posición</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Latitud"
                    placeholderTextColor={theme.textSecondary}
                    value={latitude}
                    onChangeText={setLatitude}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Longitud"
                    placeholderTextColor={theme.textSecondary}
                    value={longitude}
                    onChangeText={setLongitude}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, { width: 70 }]}
                    placeholder="km"
                    placeholderTextColor={theme.textSecondary}
                    value={radiusKm}
                    onChangeText={setRadiusKm}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.sectionBox}>
                <Text style={styles.labelInner}>
                  {initialSpotName ? `Cancha: ${initialSpotName}` : 'ID de la Cancha'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="UUID de la cancha..."
                  placeholderTextColor={theme.textSecondary}
                  value={spotId}
                  onChangeText={setSpotId}
                  editable={!initialSpotId}
                />
              </View>
            )}

            {/* Days of Week */}
            <Text style={styles.label}>Días de Interés (Vacío = Todos)</Text>
            <View style={styles.daysRow}>
              {DAYS.map((d) => {
                const isSelected = selectedDays.includes(d.id);
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.dayBtn, isSelected && styles.dayBtnActive]}
                    onPress={() => toggleDay(d.id)}
                  >
                    <Text style={[styles.dayBtnText, isSelected && styles.dayBtnTextActive]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time Window Toggle */}
            <TouchableOpacity
              style={styles.timeToggle}
              onPress={() => setEnableTimeWindow(!enableTimeWindow)}
            >
              <Text style={styles.timeToggleText}>
                {enableTimeWindow ? '✓ Horario restringido activo' : '+ Restringir por horario'}
              </Text>
            </TouchableOpacity>

            {enableTimeWindow && (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Desde (HH:MM:SS)</Text>
                  <TextInput
                    style={styles.input}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="18:00:00"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Hasta (HH:MM:SS)</Text>
                  <TextInput
                    style={styles.input}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="21:00:00"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, createMutation.isPending && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator size="small" color="#001A2C" />
              ) : (
                <Text style={styles.saveBtnText}>Guardar Aviso</Text>
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
      maxHeight: '90%',
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
      marginBottom: 12,
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
    label: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 10,
      marginBottom: 4,
    },
    labelInner: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 6,
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
    modeTabs: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 10,
      padding: 3,
      gap: 4,
      marginBottom: 10,
    },
    modeTab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
    },
    modeTabActive: {
      backgroundColor: theme.primary,
    },
    modeTabText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    modeTabTextActive: {
      color: '#001A2C',
      fontWeight: '800',
    },
    sectionBox: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    geoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    gpsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    gpsBtnText: {
      fontSize: 11,
      color: theme.primary,
      fontWeight: '700',
    },
    row: {
      flexDirection: 'row',
      gap: 8,
    },
    daysRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 4,
    },
    dayBtn: {
      flex: 1,
      height: 38,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    dayBtnActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    dayBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    dayBtnTextActive: {
      color: '#001A2C',
      fontWeight: '900',
    },
    timeToggle: {
      paddingVertical: 10,
      marginTop: 8,
    },
    timeToggleText: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: '700',
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
    saveBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
    },
    saveBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#001A2C',
    },
    btnDisabled: {
      opacity: 0.5,
    },
  });
