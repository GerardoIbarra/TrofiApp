import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Match } from '@/features/tournaments/types/match';
import { useTheme } from '@/context/ThemeContext';
import { X, AlertTriangle } from 'lucide-react-native';
import { useChangeMatchStatus, useForfeitMatch } from '@/features/matches/services/liveMatchApi';
import { ChangeStatusSchema } from '@/features/matches/schemas/liveMatchSchema';

interface MatchStatusModalProps {
  visible: boolean;
  onClose: () => void;
  match: Match;
}

const STATUS_OPTIONS = [
  { label: 'Posponer', value: 'postponed' },
  { label: 'Cancelar', value: 'canceled' },
  { label: 'Forfeit (W.O)', value: 'forfeit' },
];

export function MatchStatusModal({ visible, onClose, match }: MatchStatusModalProps) {
  const { theme, isDark } = useTheme();
  const changeStatus = useChangeMatchStatus(match.id);
  const forfeitMatch = useForfeitMatch(match.id);
  
  const [selectedStatus, setSelectedStatus] = useState<string>('postponed');
  const [forfeitingTeam, setForfeitingTeam] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (selectedStatus === 'forfeit') {
      if (!forfeitingTeam) {
        Alert.alert('Error', 'Selecciona qué equipo comete el forfeit.');
        return;
      }
      forfeitMatch.mutate({ forfeiting_team: forfeitingTeam, note }, {
        onSuccess: onClose,
        onError: (err: any) => Alert.alert('Error', err.message || 'No se pudo aplicar el forfeit'),
      });
    } else {
      changeStatus.mutate({ status: selectedStatus as any, note }, {
        onSuccess: onClose,
        onError: (err: any) => Alert.alert('Error', err.message || 'No se pudo cambiar el estado'),
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Estado del Partido</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.optionsGroup}>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionBtn,
                  { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                  selectedStatus === opt.value && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                ]}
                onPress={() => setSelectedStatus(opt.value)}
              >
                <Text style={[styles.optionText, { color: theme.text }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedStatus === 'forfeit' && (
            <>
              <Text style={[styles.label, { color: theme.textSecondary }]}>¿Qué equipo pierde por W.O?</Text>
              <View style={styles.teamSelector}>
                <TouchableOpacity 
                  style={[styles.teamBtn, forfeitingTeam === match.home_team && { backgroundColor: '#F44336' }]}
                  onPress={() => setForfeitingTeam(match.home_team)}
                >
                  <Text style={[styles.teamBtnText, forfeitingTeam === match.home_team && { color: '#FFF' }]}>{match.home_team_name}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.teamBtn, forfeitingTeam === match.away_team && { backgroundColor: '#F44336' }]}
                  onPress={() => setForfeitingTeam(match.away_team)}
                >
                  <Text style={[styles.teamBtnText, forfeitingTeam === match.away_team && { color: '#FFF' }]}>{match.away_team_name}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={[styles.label, { color: theme.textSecondary }]}>Nota / Razón (Opcional)</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
            placeholder="Escribe un motivo..."
            placeholderTextColor={theme.textSecondary}
            value={note}
            onChangeText={setNote}
            multiline
          />

          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: selectedStatus === 'forfeit' ? '#F44336' : theme.primary }]} 
            onPress={handleSubmit} 
            disabled={changeStatus.isPending || forfeitMatch.isPending}
          >
            {changeStatus.isPending || forfeitMatch.isPending ? (
              <ActivityIndicator color={selectedStatus === 'forfeit' ? '#FFF' : '#001A2C'} />
            ) : (
              <>
                <AlertTriangle size={20} color={selectedStatus === 'forfeit' ? '#FFF' : '#001A2C'} />
                <Text style={[styles.submitBtnText, { color: selectedStatus === 'forfeit' ? '#FFF' : '#001A2C' }]}>Confirmar Acción</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  optionsGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  optionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionText: {
    fontWeight: '700',
    fontSize: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  teamSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  teamBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(150,150,150,0.1)',
    alignItems: 'center',
  },
  teamBtnText: {
    fontWeight: '700',
    color: '#888',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    marginTop: 32,
  },
  submitBtnText: {
    fontWeight: '800',
    fontSize: 16,
  },
});
