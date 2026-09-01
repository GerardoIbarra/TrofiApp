import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { X, Settings2, Check } from 'lucide-react-native';
import { useUpdateTournamentTiebreaker } from '@/features/tournaments/services/tournamentApi';
import { Tournament } from '@/features/tournaments/types/tournament';

interface TiebreakerConfigModalProps {
  visible: boolean;
  onClose: () => void;
  tournament: Tournament;
}

export function TiebreakerConfigModal({ visible, onClose, tournament }: TiebreakerConfigModalProps) {
  const { theme, isDark } = useTheme();
  const updateTiebreaker = useUpdateTournamentTiebreaker();
  
  const [selected, setSelected] = useState<'goal_difference' | 'head_to_head'>(
    tournament.standings_tiebreaker || 'goal_difference'
  );

  useEffect(() => {
    if (visible) {
      setSelected(tournament.standings_tiebreaker || 'goal_difference');
    }
  }, [visible, tournament.standings_tiebreaker]);

  const handleSubmit = () => {
    updateTiebreaker.mutate({ id: tournament.id, standings_tiebreaker: selected }, {
      onSuccess: () => {
        Alert.alert('Éxito', 'Configuración de desempate actualizada');
        onClose();
      },
      onError: (err: any) => {
        Alert.alert('Error', err.message || 'No se pudo actualizar la configuración');
      }
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Settings2 size={24} color={theme.text} />
              <Text style={[styles.title, { color: theme.text }]}>Configurar Desempate</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Elige cómo se resolverán los empates a puntos en la tabla general de posiciones de este torneo.
          </Text>

          <View style={styles.optionsContainer}>
            {/* Goal Difference */}
            <TouchableOpacity
              style={[
                styles.optionBtn,
                { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                selected === 'goal_difference' && { backgroundColor: theme.primary + '10', borderColor: theme.primary }
              ]}
              onPress={() => setSelected('goal_difference')}
              activeOpacity={0.7}
            >
              <View style={styles.optionHeader}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>Diferencia de Goles</Text>
                {selected === 'goal_difference' && <Check size={18} color={theme.primary} />}
              </View>
              <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                (Predeterminado) Puntos → Diferencia de gol general → Goles a favor.
              </Text>
            </TouchableOpacity>

            {/* Head to Head */}
            <TouchableOpacity
              style={[
                styles.optionBtn,
                { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                selected === 'head_to_head' && { backgroundColor: theme.primary + '10', borderColor: theme.primary }
              ]}
              onPress={() => setSelected('head_to_head')}
              activeOpacity={0.7}
            >
              <View style={styles.optionHeader}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>Enfrentamiento Directo</Text>
                {selected === 'head_to_head' && <Check size={18} color={theme.primary} />}
              </View>
              <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                Puntos → Puntos entre empatados → Dif. Gol entre empatados → Goles entre empatados → Dif. Gol General.
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: selected === tournament.standings_tiebreaker ? theme.surface : theme.primary },
              selected === tournament.standings_tiebreaker && {
                borderWidth: 1, 
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }
            ]}
            onPress={handleSubmit}
            disabled={updateTiebreaker.isPending || selected === tournament.standings_tiebreaker}
          >
            {updateTiebreaker.isPending ? (
              <ActivityIndicator color={theme.surface} />
            ) : (
              <Text style={[
                styles.submitBtnText,
                { color: selected === tournament.standings_tiebreaker ? theme.textSecondary : '#001A2C' }
              ]}>
                Guardar Configuración
              </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    fontSize: 13,
    marginBottom: 24,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionBtn: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  submitBtn: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontWeight: '800',
    fontSize: 15,
  },
});
