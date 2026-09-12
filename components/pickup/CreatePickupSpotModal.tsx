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
import { MapPin, X, Navigation, Compass } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { SpotType } from '@/features/pickup/types/pickup';
import { useCreatePickupSpot } from '@/features/pickup/services/pickupApi';
import { LocationService } from '@/services/locationService';

interface CreatePickupSpotModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SPOT_TYPES: { key: SpotType; label: string }[] = [
  { key: 'park', label: 'Parque' },
  { key: 'street', label: 'Calle' },
  { key: 'court', label: 'Cancha' },
  { key: 'field', label: 'Campo' },
  { key: 'other', label: 'Otro' },
];

export function CreatePickupSpotModal({
  visible,
  onClose,
  onSuccess,
}: CreatePickupSpotModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [name, setName] = useState('');
  const [spotType, setSpotType] = useState<SpotType>('court');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const createMutation = useCreatePickupSpot();

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const pos = await LocationService.fetchCurrentPosition();
      if (pos) {
        setLatitude(pos.latitude.toString());
        setLongitude(pos.longitude.toString());
      } else {
        Alert.alert('Ubicación no disponible', 'No se pudo obtener tu ubicación actual.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo obtener la posición GPS.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Nombre requerido', 'Ingresa el nombre del lugar.');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      Alert.alert('Ubicación requerida', 'Debes ingresar o capturar la latitud y longitud del lugar.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: trimmedName,
        spot_type: spotType,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        latitude: latNum,
        longitude: lngNum,
      });

      Alert.alert('Cancha creada', 'El lugar para retas ha sido registrado exitosamente.');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      Alert.alert('Error al crear lugar', err?.message || 'No se pudo registrar la cancha.');
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
              <MapPin size={22} color={theme.primary} />
              <Text style={styles.headerTitle}>Nueva Cancha de Retas</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Name */}
            <Text style={styles.label}>Nombre del Lugar *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Cancha de la Plaza González"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
            />

            {/* Spot Type Chips */}
            <Text style={styles.label}>Tipo de Terreno *</Text>
            <View style={styles.typeChipsRow}>
              {SPOT_TYPES.map((t) => {
                const isSelected = spotType === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                    onPress={() => setSpotType(t.key)}
                  >
                    <Text
                      style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* City & Address */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: CDMX"
                  placeholderTextColor={theme.textSecondary}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Av. Juárez s/n"
                  placeholderTextColor={theme.textSecondary}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            {/* Description */}
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Piso de cemento, arcos con red, luz de noche..."
              placeholderTextColor={theme.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />

            {/* Coordinates */}
            <View style={styles.geoHeaderRow}>
              <Text style={styles.label}>Coordenadas GPS *</Text>
              <TouchableOpacity
                style={styles.useGpsBtn}
                onPress={handleUseCurrentLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <>
                    <Navigation size={13} color={theme.primary} />
                    <Text style={styles.useGpsText}>Mi ubicación actual</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Latitud (ej: 19.4326)"
                  placeholderTextColor={theme.textSecondary}
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Longitud (ej: -99.1332)"
                  placeholderTextColor={theme.textSecondary}
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, (!name.trim() || createMutation.isPending) && styles.saveBtnDisabled]}
              onPress={handleSubmit}
              disabled={!name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.saveBtnText}>Registrar Cancha</Text>
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
      maxWidth: 500,
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
      fontSize: 17,
      fontWeight: '800',
      color: theme.text,
    },
    closeBtn: {
      padding: 4,
    },
    scrollBody: {
      gap: 6,
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
    textArea: {
      minHeight: 60,
      textAlignVertical: 'top',
    },
    row: {
      flexDirection: 'row',
      gap: 10,
    },
    typeChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 6,
    },
    typeChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    typeChipSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    typeChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    typeChipTextSelected: {
      color: '#001A2C',
      fontWeight: '800',
    },
    geoHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 4,
    },
    useGpsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    useGpsText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.primary,
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
    saveBtnDisabled: {
      opacity: 0.5,
    },
    saveBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#001A2C',
    },
  });
