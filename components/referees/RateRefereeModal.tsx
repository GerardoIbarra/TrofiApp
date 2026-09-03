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
import { X, Star } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRateReferee } from '@/features/referees/services/refereeApi';

interface RateRefereeModalProps {
  visible: boolean;
  onClose: () => void;
  matchId: string;
  refereeName?: string;
  currentRating?: number;
}

const STAR_LABELS: Record<number, string> = {
  1: 'Deficiente',
  2: 'Regular',
  3: 'Bueno',
  4: 'Muy Bueno',
  5: 'Excelente',
};

export const RateRefereeModal: React.FC<RateRefereeModalProps> = ({
  visible,
  onClose,
  matchId,
  refereeName,
  currentRating = 5,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [stars, setStars] = useState<number>(currentRating || 5);
  const rateMutation = useRateReferee(matchId);

  const handleSubmit = () => {
    rateMutation.mutate(
      { stars },
      {
        onSuccess: () => {
          Alert.alert(
            '¡Calificación Enviada!',
            'Tu evaluación ha sido registrada exitosamente.'
          );
          onClose();
        },
        onError: (err: any) => {
          const detail =
            err?.response?.data?.detail ||
            err?.message ||
            'Solo jugadores del roster pueden calificar al árbitro una vez finalizado el encuentro.';
          Alert.alert('No se pudo calificar', detail);
        },
      }
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Calificar Árbitro</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {refereeName
                ? `¿Cómo fue el desempeño de ${refereeName}?`
                : '¿Cómo fue el desempeño del árbitro en este partido?'}
            </Text>

            {/* Stars Row */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => {
                const filled = s <= stars;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStars(s)}
                    style={styles.starTouch}
                    activeOpacity={0.7}
                  >
                    <Star
                      size={36}
                      color={filled ? '#F59E0B' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                      fill={filled ? '#F59E0B' : 'transparent'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.starLabel, { color: theme.primary }]}>
              {STAR_LABELS[stars] || ''}
            </Text>

            <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
              Solo jugadores del roster de este partido pueden calificar una vez terminado el encuentro.
            </Text>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
              disabled={rateMutation.isPending}
            >
              {rateMutation.isPending ? (
                <ActivityIndicator size="small" color="#001A2C" />
              ) : (
                <Text style={styles.submitBtnText}>Enviar Calificación</Text>
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
      maxWidth: 380,
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
    title: {
      fontSize: 17,
      fontWeight: '800',
    },
    closeBtn: {
      padding: 4,
    },
    body: {
      padding: 20,
      alignItems: 'center',
    },
    subtitle: {
      fontSize: 13,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 18,
    },
    starsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    starTouch: {
      padding: 4,
    },
    starLabel: {
      fontSize: 15,
      fontWeight: '800',
      marginBottom: 16,
    },
    noticeText: {
      fontSize: 11,
      textAlign: 'center',
      lineHeight: 16,
      marginBottom: 24,
      paddingHorizontal: 12,
    },
    submitBtn: {
      width: '100%',
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
