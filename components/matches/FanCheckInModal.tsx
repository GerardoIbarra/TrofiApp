import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {
  MapPin,
  Camera,
  CheckCircle,
  AlertCircle,
  Flame,
  Award,
  X,
  Navigation,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/context/ThemeContext';
import { LocationService } from '@/services/locationService';
import { useFanCheckIn } from '@/features/matches/services/matchApi';
import { FanCheckInResponse } from '@/features/matches/types/fanCheckIn';

interface FanCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  matchId: string;
  matchTitle?: string;
  venueName?: string;
}

export function FanCheckInModal({
  visible,
  onClose,
  matchId,
  matchTitle,
  venueName,
}: FanCheckInModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [checkInResult, setCheckInResult] = useState<FanCheckInResponse | null>(null);

  const fanCheckInMutation = useFanCheckIn();

  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    try {
      const pos = await LocationService.fetchCurrentPosition();
      if (pos) {
        setCoords({ latitude: pos.latitude, longitude: pos.longitude });
      } else {
        Alert.alert(
          'GPS no disponible',
          'Asegúrate de conceder permisos de ubicación para verificar tu asistencia en la cancha.'
        );
      }
    } catch {
      Alert.alert('Error', 'No se pudo obtener la posición GPS actual.');
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        // Fallback to media library if camera permission is denied
        const libStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libStatus.status !== 'granted') {
          Alert.alert('Permiso requerido', 'Se requiere acceso a la cámara o galería para adjuntar tu foto.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          setPhotoUri(result.assets[0].uri);
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error al capturar foto:', err);
      Alert.alert('Error', 'No se pudo abrir la cámara.');
    }
  };

  const handleConfirmCheckIn = async () => {
    try {
      const result = await fanCheckInMutation.mutateAsync({
        matchId,
        data: {
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          photo: photoUri,
        },
      });

      setCheckInResult(result);
    } catch (err: any) {
      Alert.alert('Error al registrar', err?.message || 'No se pudo completar el check-in.');
    }
  };

  const handleModalClose = () => {
    setCheckInResult(null);
    setPhotoUri(null);
    setCoords(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleModalClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.overline}>CHECK-IN DE HINCHA</Text>
              <Text style={styles.title} numberOfLines={1}>
                {matchTitle || '¡Presente en el Partido!'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleModalClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {checkInResult ? (
            /* Result State */
            <View style={styles.resultContainer}>
              <View style={styles.successIconCircle}>
                <CheckCircle size={44} color="#10B981" />
              </View>

              <Text style={styles.resultTitle}>¡Check-in Registrado!</Text>
              <Text style={styles.resultSubtitle}>
                Tu asistencia ha sido anotada en tu historial de hincha.
              </Text>

              {/* Location Verification Badge */}
              <View
                style={[
                  styles.badgeBox,
                  {
                    backgroundColor: checkInResult.is_location_verified
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(245, 158, 11, 0.12)',
                    borderColor: checkInResult.is_location_verified
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(245, 158, 11, 0.3)',
                  },
                ]}
              >
                {checkInResult.is_location_verified ? (
                  <>
                    <MapPin size={18} color="#10B981" />
                    <Text style={[styles.badgeText, { color: '#10B981' }]}>
                      Ubicación verificada en la cancha (&lt;1km)
                    </Text>
                  </>
                ) : (
                  <>
                    <AlertCircle size={18} color="#F59E0B" />
                    <Text style={[styles.badgeText, { color: '#F59E0B' }]}>
                      Asistencia registrada (sin verificar por GPS)
                    </Text>
                  </>
                )}
              </View>

              {/* Attendance Streak */}
              {checkInResult.attendance_streak && checkInResult.attendance_streak.count > 0 && (
                <View style={styles.streakBox}>
                  <Flame size={20} color="#FF5722" />
                  <Text style={styles.streakText}>
                    Racha: {checkInResult.attendance_streak.count} partidos seguidos alentando
                  </Text>
                </View>
              )}

              {/* Milestone Info */}
              <View style={styles.milestoneBox}>
                <Award size={18} color={theme.primary} />
                <Text style={styles.milestoneText}>
                  ¡A los 5 check-ins ganas el logro <Text style={{ fontWeight: '800', color: theme.primary }}>Fan Fiel</Text> y a los 20 <Text style={{ fontWeight: '800', color: theme.primary }}>Presente</Text>!
                </Text>
              </View>

              <TouchableOpacity style={styles.actionBtn} onPress={handleModalClose}>
                <Text style={styles.actionBtnText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Input State */
            <View style={styles.formContainer}>
              <Text style={styles.instructionText}>
                Confirma que estás viviendo el partido en la cancha para sumar rachas y desbloquear logros exclusivos de hincha.
              </Text>

              {venueName && (
                <View style={styles.venueRow}>
                  <MapPin size={16} color={theme.primary} />
                  <Text style={styles.venueText}>Sede: {venueName}</Text>
                </View>
              )}

              {/* GPS Detection */}
              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>UBICACIÓN GPS</Text>
                  <Text style={styles.inputSubtext}>
                    {coords
                      ? `📍 ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
                      : 'Detecta si estás a menos de 1 km de la cancha'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.smallBtn, coords && styles.smallBtnActive]}
                  onPress={handleDetectGps}
                  disabled={isDetectingGps}
                >
                  {isDetectingGps ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Navigation size={14} color={coords ? '#FFF' : theme.primary} />
                      <Text style={[styles.smallBtnText, coords && { color: '#FFF' }]}>
                        {coords ? 'Actualizar' : 'Detectar'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Photo Attachment (Optional) */}
              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>FOTO DE PRUEBA (OPCIONAL)</Text>
                  <Text style={styles.inputSubtext}>
                    {photoUri ? 'Foto adjuntada' : 'Sube o toma una foto en la cancha'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.smallBtn} onPress={handlePickPhoto}>
                  <Camera size={14} color={theme.primary} />
                  <Text style={styles.smallBtnText}>{photoUri ? 'Cambiar' : 'Tomar Foto'}</Text>
                </TouchableOpacity>
              </View>

              {photoUri && (
                <View style={styles.photoPreviewWrapper}>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => setPhotoUri(null)}
                  >
                    <X size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  fanCheckInMutation.isPending && { opacity: 0.7 },
                ]}
                onPress={handleConfirmCheckIn}
                disabled={fanCheckInMutation.isPending}
              >
                {fanCheckInMutation.isPending ? (
                  <ActivityIndicator size="small" color="#001A2C" />
                ) : (
                  <Text style={styles.actionBtnText}>¡Marcar que Estuve Aquí!</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalCard: {
      width: '100%',
      maxWidth: 440,
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    overline: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.5,
      color: theme.primary,
      marginBottom: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.text,
    },
    closeBtn: {
      padding: 6,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    formContainer: {
      gap: 16,
    },
    instructionText: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    venueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 10,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    },
    venueText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      gap: 12,
    },
    inputLabel: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    inputSubtext: {
      fontSize: 12,
      color: theme.text,
      fontWeight: '600',
    },
    smallBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(0, 245, 255, 0.15)',
      borderWidth: 1,
      borderColor: theme.primary + '40',
    },
    smallBtnActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    smallBtnText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.primary,
    },
    photoPreviewWrapper: {
      position: 'relative',
      width: '100%',
      height: 140,
      borderRadius: 14,
      overflow: 'hidden',
    },
    photoPreview: {
      width: '100%',
      height: '100%',
    },
    removePhotoBtn: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.6)',
      width: 26,
      height: 26,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionBtn: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    actionBtnText: {
      fontSize: 14,
      fontWeight: '900',
      color: '#001A2C',
      letterSpacing: 0.5,
    },
    resultContainer: {
      alignItems: 'center',
      gap: 14,
      paddingVertical: 10,
    },
    successIconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    resultTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.text,
    },
    resultSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: 10,
    },
    badgeBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 1,
      width: '100%',
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '800',
      flex: 1,
    },
    streakBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 87, 34, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255, 87, 34, 0.3)',
      width: '100%',
    },
    streakText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#FF5722',
      flex: 1,
    },
    milestoneBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    },
    milestoneText: {
      fontSize: 11,
      color: theme.textSecondary,
      lineHeight: 16,
      flex: 1,
    },
  });
