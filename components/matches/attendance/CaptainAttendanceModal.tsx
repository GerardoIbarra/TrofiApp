import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { X, Check, Users } from 'lucide-react-native';
import { useCaptainConfirmAttendance } from '@/features/matches/services/matchApi';

interface CaptainAttendanceModalProps {
  matchId: string;
  teamId: string;
  roster: any[]; // Lineup players or team roster
  onClose: () => void;
}

export function CaptainAttendanceModal({ matchId, teamId, roster, onClose }: CaptainAttendanceModalProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const confirmMutation = useCaptainConfirmAttendance();

  const togglePlayer = (rosterId: string) => {
    const newSet = new Set(selectedPlayers);
    if (newSet.has(rosterId)) {
      newSet.delete(rosterId);
    } else {
      newSet.add(rosterId);
    }
    setSelectedPlayers(newSet);
  };

  const selectAll = () => {
    setSelectedPlayers(new Set(roster.map(p => p.roster_membership_id)));
  };

  const clearSelection = () => {
    setSelectedPlayers(new Set());
  };

  const handleConfirm = () => {
    if (selectedPlayers.size === 0) {
      Alert.alert('Error', 'Selecciona al menos un jugador.');
      return;
    }

    // Convert Set to Array
    const playerIds = Array.from(selectedPlayers);

    confirmMutation.mutate(
      {
        matchId,
        data: {
          status: 'confirmed',
          roster_membership_ids: playerIds,
        }
      },
      {
        onSuccess: () => {
          Alert.alert('Éxito', 'Asistencia confirmada para los jugadores seleccionados.');
          onClose();
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.response?.data?.detail || 'No se pudo confirmar la asistencia.');
        }
      }
    );
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Gestionar Asistencia</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Confirma la asistencia en nombre de tus jugadores.
          </Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={selectAll} style={styles.actionBtn}>
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>Seleccionar Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearSelection} style={styles.actionBtn}>
              <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>Limpiar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.rosterList}>
            {roster.map(player => {
              const isSelected = selectedPlayers.has(player.roster_membership_id);
              return (
                <TouchableOpacity 
                  key={player.roster_membership_id}
                  style={[
                    styles.playerRow, 
                    { backgroundColor: theme.surface, borderColor: isDark ? '#222' : '#E0E0E0' },
                    isSelected && { borderColor: theme.primary, backgroundColor: theme.primary + '10' }
                  ]}
                  onPress={() => togglePlayer(player.roster_membership_id)}
                >
                  <View style={styles.playerInfo}>
                    <Text style={[styles.playerName, { color: theme.text }]}>{player.player_name}</Text>
                    {player.shirt_number && (
                      <Text style={[styles.playerNumber, { color: theme.textSecondary }]}>#{player.shirt_number}</Text>
                    )}
                  </View>
                  <View style={[
                    styles.checkbox,
                    isSelected ? { backgroundColor: theme.primary, borderColor: theme.primary } : { borderColor: theme.textSecondary }
                  ]}>
                    {isSelected && <Check size={14} color="#000" />}
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {roster.length === 0 && (
              <View style={styles.emptyContainer}>
                 <Users size={32} color={theme.textSecondary} opacity={0.5} />
                 <Text style={{ color: theme.textSecondary, marginTop: 10 }}>No hay jugadores en el roster.</Text>
              </View>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.submitButton, 
                { backgroundColor: theme.primary },
                (confirmMutation.isPending || selectedPlayers.size === 0) && { opacity: 0.5 }
              ]}
              onPress={handleConfirm}
              disabled={confirmMutation.isPending || selectedPlayers.size === 0}
            >
              {confirmMutation.isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitText}>Confirmar Seleccionados ({selectedPlayers.size})</Text>
              )}
            </TouchableOpacity>
          </View>

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
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    padding: 5,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  actionBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rosterList: {
    flex: 1,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  playerNumber: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  }
});
