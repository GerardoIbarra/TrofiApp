import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { X, Trophy, Save } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Match } from '@/types/match';
import api from '@/services/api';

interface MatchResultModalProps {
  visible: boolean;
  match: Match | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function MatchResultModal({ visible, match, onClose, onSuccess }: MatchResultModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (match) {
      setHomeScore(match.result?.home_score?.toString() || '0');
      setAwayScore(match.result?.away_score?.toString() || '0');
    }
  }, [match]);

  const handleSubmit = async () => {
    if (!match) return;

    setIsSubmitting(true);
    try {
      await api.post(`/v1/matches/${match.id}/result/`, {
        home_score: parseInt(homeScore),
        away_score: parseInt(awayScore),
        result_type: 'normal',
      });
      
      Alert.alert("¡Resultado Guardado!", "El marcador ha sido actualizado correctamente.");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving match result:', error);
      Alert.alert("Error", "No se pudo guardar el resultado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!match) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.modalCard}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>REGISTRAR MARCADOR</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.matchTeams}>
              {/* LOCAL */}
              <View style={styles.teamContainer}>
                <View style={[styles.teamBadge, { backgroundColor: theme.primary + '10' }]} />
                <Text style={styles.teamName} numberOfLines={2}>{match.home_team_name}</Text>
                <TextInput
                  style={styles.scoreInput}
                  value={homeScore}
                  onChangeText={setHomeScore}
                  keyboardType="numeric"
                  placeholder="0"
                  maxLength={2}
                />
              </View>

              <Text style={styles.vsText}>-</Text>

              {/* VISITANTE */}
              <View style={styles.teamContainer}>
                <View style={[styles.teamBadge, { backgroundColor: theme.primary + '10' }]} />
                <Text style={styles.teamName} numberOfLines={2}>{match.away_team_name}</Text>
                <TextInput
                  style={styles.scoreInput}
                  value={awayScore}
                  onChangeText={setAwayScore}
                  keyboardType="numeric"
                  placeholder="0"
                  maxLength={2}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#001A2C" size="small" />
              ) : (
                <>
                  <Save size={18} color="#001A2C" />
                  <Text style={styles.saveBtnText}>GUARDAR RESULTADO</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Trophy size={14} color={theme.textSecondary} />
              <Text style={styles.infoText}>
                Al guardar el resultado, la tabla de posiciones se actualizará automáticamente.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.primary,
    letterSpacing: 2,
  },
  closeBtn: {
    padding: 5,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  teamContainer: {
    alignItems: 'center',
    width: '40%',
  },
  teamBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
    height: 35,
    marginBottom: 15,
  },
  scoreInput: {
    width: 70,
    height: 70,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    borderRadius: 15,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '900',
    color: theme.text,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  vsText: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.textSecondary,
    marginBottom: -40, // Alineado con los inputs
  },
  saveButton: {
    backgroundColor: theme.primary,
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#001A2C',
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 10,
    color: theme.textSecondary,
    fontWeight: '600',
    lineHeight: 14,
  },
});
