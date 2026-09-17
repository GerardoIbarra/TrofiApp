import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

export interface ConfirmEndMatchModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | string;
  awayScore: number | string;
  isLoading?: boolean;
}

export function ConfirmEndMatchModal({
  visible,
  onClose,
  onConfirm,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  isLoading = false,
}: ConfirmEndMatchModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  // Trigger warning vibration upon opening the confirmation modal
  useEffect(() => {
    if (visible && Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (err) {
        console.warn('Haptics not supported or failed:', err);
      }
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err) {
        console.warn('Haptics not supported or failed:', err);
      }
    }
    await onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.warningIconBadge}>
                <AlertTriangle size={18} color="#D97706" />
              </View>
              <Text style={styles.headerTitle}>FINALIZAR PARTIDO</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Subtitle instructions */}
          <Text style={styles.subtitle}>
            Verifica que el marcador final sea el correcto antes de cerrar el encuentro:
          </Text>

          {/* Large Typography Score Card */}
          <View style={styles.scoreContainer}>
            <Text style={styles.bigScoreHeadline} numberOfLines={3}>
              {homeTeamName} [{homeScore}] - [{awayScore}] {awayTeamName}
            </Text>

            <View style={styles.teamsSplitRow}>
              <View style={styles.teamColumn}>
                <Text style={styles.teamLabel}>LOCAL</Text>
                <Text style={styles.teamNameText} numberOfLines={2}>
                  {homeTeamName}
                </Text>
                <View style={styles.digitBox}>
                  <Text style={styles.digitText}>{homeScore}</Text>
                </View>
              </View>

              <Text style={styles.vsSeparator}>VS</Text>

              <View style={styles.teamColumn}>
                <Text style={styles.teamLabel}>VISITANTE</Text>
                <Text style={styles.teamNameText} numberOfLines={2}>
                  {awayTeamName}
                </Text>
                <View style={styles.digitBox}>
                  <Text style={styles.digitText}>{awayScore}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Warning Notice */}
          <View style={styles.warningCard}>
            <AlertTriangle size={20} color="#D97706" style={styles.warningCardIcon} />
            <Text style={styles.warningText}>
              Una vez cerrado, el resultado pasará a ser oficial.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancelar / Corregir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                isLoading && { opacity: 0.7 },
              ]}
              onPress={handleConfirm}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#001A2C" size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirmar y Cerrar Partido</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalCard: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: theme.surface,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    warningIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(217, 119, 6, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: 0.5,
    },
    closeBtn: {
      padding: 4,
    },
    subtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 16,
      lineHeight: 18,
    },
    scoreContainer: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      alignItems: 'center',
    },
    bigScoreHeadline: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.text,
      textAlign: 'center',
      letterSpacing: 0.3,
      marginBottom: 14,
    },
    teamsSplitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    teamColumn: {
      flex: 1,
      alignItems: 'center',
    },
    teamLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.textSecondary,
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    teamNameText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
      minHeight: 34,
    },
    digitBox: {
      minWidth: 48,
      height: 48,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
      borderWidth: 1,
      borderColor: theme.primary + '50',
      justifyContent: 'center',
      alignItems: 'center',
    },
    digitText: {
      fontSize: 26,
      fontWeight: '900',
      color: theme.primary,
    },
    vsSeparator: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.textSecondary,
      paddingHorizontal: 10,
      marginTop: 20,
    },
    warningCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(217, 119, 6, 0.12)' : 'rgba(254, 243, 199, 0.9)',
      borderLeftWidth: 4,
      borderLeftColor: '#D97706',
      borderRadius: 10,
      padding: 12,
      marginBottom: 20,
      gap: 10,
    },
    warningCardIcon: {
      flexShrink: 0,
    },
    warningText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: isDark ? '#FDE68A' : '#92400E',
      lineHeight: 18,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 10,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    cancelBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
    },
    confirmBtn: {
      flex: 1.4,
      paddingVertical: 14,
      paddingHorizontal: 8,
      borderRadius: 12,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 4,
    },
    confirmBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#001A2C',
      textAlign: 'center',
    },
  });
