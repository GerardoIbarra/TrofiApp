import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { X, Check } from 'lucide-react-native';
import { useCreateManualSuspension } from '@/features/discipline/services/disciplineApi';
import api from '@/services/api';

interface ManualSuspensionModalProps {
  tournamentId: string;
  onClose: () => void;
}

export function ManualSuspensionModal({ tournamentId, onClose }: ManualSuspensionModalProps) {
  const { theme, isDark } = useTheme();
  
  const [teams, setTeams] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);
  
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedRoster, setSelectedRoster] = useState('');
  const [matchesSuspended, setMatchesSuspended] = useState('1');
  const [notes, setNotes] = useState('');
  
  const [loadingContext, setLoadingContext] = useState(true);
  
  const suspendMutation = useCreateManualSuspension();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoadingContext(true);
    try {
      const res = await api.get<any>(`/v1/tournaments/${tournamentId}/teams/`);
      setTeams(res.results || res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingContext(false);
    }
  };

  const fetchRoster = async (teamId: string) => {
    setSelectedTeam(teamId);
    setSelectedRoster('');
    setRoster([]);
    try {
      const res = await api.get<any>(`/v1/rosters/?tournament_team=${teamId}`);
      setRoster(res.results || res || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = () => {
    if (!selectedRoster) {
      Alert.alert('Error', 'Selecciona un jugador.');
      return;
    }
    
    if (!matchesSuspended || isNaN(Number(matchesSuspended)) || Number(matchesSuspended) < 1) {
      Alert.alert('Error', 'Ingresa una cantidad válida de partidos.');
      return;
    }

    suspendMutation.mutate({
      tournament: tournamentId,
      roster_membership: selectedRoster,
      reason: 'manual',
      matches_suspended: Number(matchesSuspended),
      notes: notes,
    }, {
      onSuccess: () => {
        Alert.alert('Éxito', 'Sanción aplicada correctamente.');
        onClose();
      },
      onError: (err: any) => {
        Alert.alert('Error', err?.response?.data?.detail || 'Error al aplicar sanción.');
      }
    });
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Sanción Manual</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {loadingContext ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            <ScrollView style={styles.form}>
              
              <Text style={[styles.label, { color: theme.textSecondary }]}>Equipo</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                {teams.map(t => (
                  <TouchableOpacity 
                    key={t.id} 
                    style={[styles.pill, selectedTeam === t.id && { backgroundColor: theme.primary + '30', borderColor: theme.primary }]}
                    onPress={() => fetchRoster(t.id)}
                  >
                    <Text style={{ color: theme.text, fontSize: 12 }}>{t.team_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedTeam !== '' && (
                <>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Jugador</Text>
                  {roster.length === 0 ? (
                     <Text style={{ color: '#FF4444', fontSize: 12, marginBottom: 15 }}>No hay jugadores en este equipo.</Text>
                  ) : (
                    <View style={styles.rosterGrid}>
                      {roster.map(r => (
                        <TouchableOpacity 
                          key={r.id} 
                          style={[styles.rosterPill, selectedRoster === r.id && { backgroundColor: theme.primary }]}
                          onPress={() => setSelectedRoster(r.id)}
                        >
                          <Text style={{ color: selectedRoster === r.id ? '#000' : theme.text, fontSize: 12 }}>{r.player_name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}

              <Text style={[styles.label, { color: theme.textSecondary }]}>Partidos de Suspensión</Text>
              <TextInput 
                style={[styles.input, { color: theme.text, borderColor: isDark ? '#333' : '#E0E0E0' }]}
                keyboardType="number-pad"
                value={matchesSuspended}
                onChangeText={setMatchesSuspended}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>Motivo / Notas</Text>
              <TextInput 
                style={[styles.input, { color: theme.text, borderColor: isDark ? '#333' : '#E0E0E0', height: 80, textAlignVertical: 'top' }]}
                placeholder="Ej. Conducta antideportiva en gradas..."
                placeholderTextColor={theme.textSecondary}
                multiline
                value={notes}
                onChangeText={setNotes}
              />

              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: '#FF4444' }, suspendMutation.isPending && { opacity: 0.5 }]}
                onPress={handleSubmit}
                disabled={suspendMutation.isPending}
              >
                {suspendMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Check size={20} color="#FFF" />
                    <Text style={styles.submitText}>Aplicar Sanción</Text>
                  </>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    padding: 5,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 15,
  },
  selectorScroll: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
    marginRight: 10,
  },
  rosterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  rosterPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    gap: 8,
  },
  submitText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  }
});
