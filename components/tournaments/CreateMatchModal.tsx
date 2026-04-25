import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useForm } from 'react-hook-form';
import { useTheme } from '@/context/ThemeContext';
import { FormInput } from '@/components/ui/forms/FormInput';
import { FormDatePicker } from '@/components/ui/forms/FormDatePicker';
import { X, MapPin } from 'lucide-react-native';
import api from '@/services/api';
import { Match, MatchStatus } from '@/features/tournaments/types/match';

interface MatchFormData {
  home_team: string;
  away_team: string;
  date: string;
  time: string;
  venue_name: string;
  status: MatchStatus;
}

interface TeamOption {
  id: string;
  name: string;
}

interface CreateMatchModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tournamentId: string;
  initialData?: Match | null;
}

export function CreateMatchModal({ 
  visible, 
  onClose, 
  onSuccess, 
  tournamentId,
  initialData 
}: CreateMatchModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teams, setTeams] = useState<TeamOption[]>([]);

  const { control, handleSubmit, reset, watch, setValue } = useForm<MatchFormData>({
    defaultValues: {
      home_team: '',
      away_team: '',
      date: new Date().toISOString().split('T')[0],
      time: '20:00',
      venue_name: '',
      status: 'scheduled'
    }
  });

  const selectedHomeTeam = watch('home_team');
  const selectedAwayTeam = watch('away_team');

  useEffect(() => {
    if (visible) {
      fetchTournamentTeams();
      if (initialData) {
        const matchDate = new Date(initialData.start_datetime);
        reset({
          home_team: initialData.home_team,
          away_team: initialData.away_team,
          date: matchDate.toISOString().split('T')[0],
          time: matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }),
          venue_name: initialData.venue_name || '',
          status: initialData.status
        });
      } else {
        reset({
          home_team: '',
          away_team: '',
          date: new Date().toISOString().split('T')[0],
          time: '20:00',
          venue_name: '',
          status: 'scheduled'
        });
      }
    }
  }, [visible, initialData]);

  const fetchTournamentTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const response = await api.get<any[]>(`/v1/standings/by_tournament/?tournament_id=${tournamentId}`);
      const mappedTeams = response.map(item => ({
        id: item.team_id || item.tournament_team,
        name: item.team_name
      }));
      setTeams(mappedTeams);
    } catch (error) {
      console.error('Error fetching tournament teams:', error);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const onSubmit = async (data: MatchFormData) => {
    if (data.home_team === data.away_team) {
      Alert.alert('Error', 'El equipo local y el visitante no pueden ser el mismo.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Intentar formatear la fecha correctamente para el backend
      const start_datetime = `${data.date}T${data.time}:00Z`;
      const payload = {
        tournament: tournamentId,
        home_team: data.home_team,
        away_team: data.away_team,
        start_datetime,
        venue_name: data.venue_name,
        status: data.status
      };

      if (initialData) {
        await api.put(`/v1/matches/${initialData.id}/`, payload);
        Alert.alert('¡Éxito!', 'El partido ha sido actualizado.');
      } else {
        await api.post('/v1/matches/', payload);
        Alert.alert('¡Éxito!', 'El partido ha sido programado.');
      }
      onSuccess();
      onClose();
    } catch (error) {
        console.error('Error saving match:', error);
        Alert.alert('Error', 'No se pudo guardar el partido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {initialData ? 'EDITAR PARTIDO' : 'PROGRAMAR PARTIDO'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>EQUIPO LOCAL</Text>
            <View style={styles.selectContainer}>
              {isLoadingTeams ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <View style={styles.teamGrid}>
                  {teams.map(team => (
                    <TouchableOpacity
                      key={team.id}
                      style={[
                        styles.teamOption,
                        selectedHomeTeam === team.id && styles.teamOptionActive
                      ]}
                      onPress={() => setValue('home_team', team.id)}
                    >
                      <Text style={[
                        styles.teamOptionText,
                        selectedHomeTeam === team.id && styles.teamOptionTextActive
                      ]}>
                        {team.name.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Text style={styles.label}>EQUIPO VISITANTE</Text>
            <View style={styles.selectContainer}>
              {isLoadingTeams ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <View style={styles.teamGrid}>
                  {teams.map(team => (
                    <TouchableOpacity
                      key={team.id}
                      style={[
                        styles.teamOption,
                        selectedAwayTeam === team.id && styles.teamOptionActive
                      ]}
                      onPress={() => setValue('away_team', team.id)}
                    >
                      <Text style={[
                        styles.teamOptionText,
                        selectedAwayTeam === team.id && styles.teamOptionTextActive
                      ]}>
                        {team.name.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <FormDatePicker
                        label="FECHA"
                        name="date"
                        control={control}
                        required
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                     <FormInput
                        label="HORA (HH:MM)"
                        name="time"
                        control={control}
                        placeholder="20:00"
                        required
                    />
                </View>
            </View>

            <FormInput
              label="SEDE / CAMPO"
              name="venue_name"
              control={control}
              placeholder="Ej: Campo Monumental 4"
            />

            {initialData && (
                 <View style={styles.statusSection}>
                    <Text style={styles.label}>ESTADO</Text>
                    <View style={styles.statusGrid}>
                        {['scheduled', 'ongoing', 'finished', 'canceled'].map((s) => (
                             <TouchableOpacity
                                key={s}
                                style={[
                                    styles.statusTag,
                                    watch('status') === s && { backgroundColor: theme.primary, borderColor: theme.primary }
                                ]}
                                onPress={() => setValue('status', s as MatchStatus)}
                             >
                                <Text style={[styles.statusTagText, watch('status') === s && { color: '#FFF' }]}>{s.toUpperCase()}</Text>
                             </TouchableOpacity>
                        ))}
                    </View>
                 </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.saveBtn, isSubmitting && styles.btnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {initialData ? 'GUARDAR CAMBIOS' : 'PROGRAMAR JUEGO'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '85%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.textSecondary,
    marginBottom: 10,
    letterSpacing: 1,
  },
  selectContainer: {
    marginBottom: 20,
    minHeight: 60,
    justifyContent: 'center',
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  teamOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
  },
  teamOptionActive: {
    backgroundColor: theme.primary + '20',
    borderColor: theme.primary,
  },
  teamOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.textSecondary,
  },
  teamOptionTextActive: {
    color: theme.primary,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  statusSection: {
    marginTop: 10,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  statusTag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)',
  },
  statusTagText: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.textSecondary,
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  saveBtn: {
    backgroundColor: theme.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
