import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Match } from '@/features/tournaments/types/match';
import { useTheme } from '@/context/ThemeContext';
import { X, Check } from 'lucide-react-native';
import { useAddMatchEvent } from '@/features/matches/services/liveMatchApi';
import { MatchEventSchema } from '@/features/matches/schemas/liveMatchSchema';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  match: Match;
}

const EVENT_TYPES = [
  { label: '⚽ Gol', value: 'goal' },
  { label: '⚽ Autogol', value: 'own_goal' },
  { label: '🟨 Tarjeta Amarilla', value: 'yellow_card' },
  { label: '🟥 Tarjeta Roja', value: 'red_card' },
  { label: '⭐ MVP', value: 'mvp' },
];

export function AddEventModal({ visible, onClose, match }: AddEventModalProps) {
  const { theme, isDark } = useTheme();
  const addEvent = useAddMatchEvent();
  
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string>('goal');
  const [minute, setMinute] = useState<string>('');

  const handleSubmit = () => {
    if (!selectedTeam || !minute) {
      Alert.alert('Error', 'Debes seleccionar un equipo y el minuto del evento.');
      return;
    }

    const payload: MatchEventSchema = {
      match: match.id,
      team: selectedTeam,
      event_type: selectedEvent as any,
      minute: parseInt(minute, 10),
    };

    addEvent.mutate(payload, {
      onSuccess: () => {
        onClose();
        setSelectedTeam(null);
        setMinute('');
        setSelectedEvent('goal');
      },
      onError: (err: any) => {
        Alert.alert('Error', err.message || 'No se pudo registrar el evento');
      }
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Registrar Evento</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.label, { color: theme.textSecondary }]}>Selecciona el Equipo</Text>
          <View style={styles.teamSelector}>
            <TouchableOpacity 
              style={[styles.teamBtn, selectedTeam === match.home_team && { backgroundColor: theme.primary }]}
              onPress={() => setSelectedTeam(match.home_team)}
            >
              <Text style={[styles.teamBtnText, selectedTeam === match.home_team && { color: '#001A2C' }]}>{match.home_team_name}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.teamBtn, selectedTeam === match.away_team && { backgroundColor: theme.primary }]}
              onPress={() => setSelectedTeam(match.away_team)}
            >
              <Text style={[styles.teamBtnText, selectedTeam === match.away_team && { color: '#001A2C' }]}>{match.away_team_name}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo de Evento</Text>
          <View style={styles.eventGrid}>
            {EVENT_TYPES.map(evt => (
              <TouchableOpacity 
                key={evt.value}
                style={[
                  styles.eventBtn, 
                  { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                  selectedEvent === evt.value && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                ]}
                onPress={() => setSelectedEvent(evt.value)}
              >
                <Text style={[styles.eventBtnText, { color: theme.text }]}>{evt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Minuto del Partido</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
            placeholder="Ej: 45"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={minute}
            onChangeText={setMinute}
          />

          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleSubmit} disabled={addEvent.isPending}>
            {addEvent.isPending ? (
              <ActivityIndicator color="#001A2C" />
            ) : (
              <>
                <Check size={20} color="#001A2C" />
                <Text style={styles.submitBtnText}>Guardar Evento</Text>
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
    minHeight: 500,
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
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
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
  eventGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  eventBtnText: {
    fontWeight: '600',
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
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
    color: '#001A2C',
    fontWeight: '800',
    fontSize: 16,
  },
});
