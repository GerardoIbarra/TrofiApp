import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { X, Check, Users, User } from 'lucide-react-native';
import { useCreateMarketListing } from '@/features/market/services/marketApi';
import api from '@/services/api';
import { useAuthStore } from '@/features/auth/store/authStore';

interface CreateListingModalProps {
  onClose: () => void;
}

export function CreateListingModal({ onClose }: CreateListingModalProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);

  const [listingType, setListingType] = useState<'team_seeking_player' | 'player_seeking_team'>('team_seeking_player');
  const [league, setLeague] = useState('');
  const [team, setTeam] = useState('');
  const [position, setPosition] = useState<'GK' | 'DEF' | 'MED' | 'DEL' | 'SUB' | ''>('');
  const [availabilityNote, setAvailabilityNote] = useState('');
  const [notes, setNotes] = useState('');
  
  const [myLeagues, setMyLeagues] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [loadingContext, setLoadingContext] = useState(true);

  const createMutation = useCreateMarketListing();

  useEffect(() => {
    fetchContext();
  }, []);

  const fetchContext = async () => {
    setLoadingContext(true);
    try {
      const [leaguesRes, teamsRes] = await Promise.all([
        api.get<any>('/v1/leagues/my_leagues/'),
        api.get<any>('/v1/teams/?is_owner=true') // Simplified assuming backend allows ?is_owner
      ]);
      setMyLeagues(leaguesRes.results || leaguesRes || []);
      
      // We only need to show teams where the user is an owner, or just fetch user's teams and filter
      // For now we assume teamsRes returns teams the user manages.
      setMyTeams(teamsRes.results || teamsRes || []);
      
      if (leaguesRes?.length > 0) setLeague(leaguesRes[0].id);
      if (teamsRes?.length > 0) setTeam(teamsRes[0].id);
    } catch (e) {
      console.error('Error fetching context', e);
    } finally {
      setLoadingContext(false);
    }
  };

  const handleCreate = () => {
    if (!league) {
      Alert.alert('Error', 'Debes seleccionar una liga.');
      return;
    }
    
    if (listingType === 'team_seeking_player' && !team) {
      Alert.alert('Error', 'Debes seleccionar un equipo.');
      return;
    }
    
    if (listingType === 'player_seeking_team' && !user?.player_profile_id) {
      Alert.alert('Error', 'Debes crear tu perfil de jugador primero.');
      return;
    }

    createMutation.mutate(
      {
        league,
        listing_type: listingType,
        team: listingType === 'team_seeking_player' ? team : undefined,
        position: position || undefined,
        availability_note: availabilityNote || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert('Éxito', 'Anuncio publicado en el mercado.');
          onClose();
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.response?.data?.detail || 'No se pudo crear el anuncio.');
        }
      }
    );
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Nuevo Anuncio</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {loadingContext ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : (
            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              
              <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo de Anuncio</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity 
                  style={[styles.typeBtn, listingType === 'team_seeking_player' && { backgroundColor: theme.primary }]}
                  onPress={() => setListingType('team_seeking_player')}
                >
                  <Users size={16} color={listingType === 'team_seeking_player' ? '#000' : theme.text} />
                  <Text style={[styles.typeBtnText, { color: listingType === 'team_seeking_player' ? '#000' : theme.text }]}>Busco Jugador</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, listingType === 'player_seeking_team' && { backgroundColor: theme.primary }]}
                  onPress={() => setListingType('player_seeking_team')}
                >
                  <User size={16} color={listingType === 'player_seeking_team' ? '#000' : theme.text} />
                  <Text style={[styles.typeBtnText, { color: listingType === 'player_seeking_team' ? '#000' : theme.text }]}>Busco Equipo</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.textSecondary }]}>Liga (Requerido)</Text>
              {myLeagues.length === 0 ? (
                <Text style={{ color: '#FF4444', fontSize: 12, marginBottom: 15 }}>No perteneces a ninguna liga.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                  {myLeagues.map(l => (
                    <TouchableOpacity 
                      key={l.id} 
                      style={[styles.pill, league === l.id && { backgroundColor: theme.primary + '30', borderColor: theme.primary }]}
                      onPress={() => setLeague(l.id)}
                    >
                      <Text style={{ color: theme.text, fontSize: 12 }}>{l.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {listingType === 'team_seeking_player' && (
                <>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Mi Equipo</Text>
                  {myTeams.length === 0 ? (
                    <Text style={{ color: '#FF4444', fontSize: 12, marginBottom: 15 }}>No tienes equipos.</Text>
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                      {myTeams.map(t => (
                        <TouchableOpacity 
                          key={t.id} 
                          style={[styles.pill, team === t.id && { backgroundColor: theme.primary + '30', borderColor: theme.primary }]}
                          onPress={() => setTeam(t.id)}
                        >
                          <Text style={{ color: theme.text, fontSize: 12 }}>{t.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </>
              )}

              <Text style={[styles.label, { color: theme.textSecondary }]}>Posición (Opcional)</Text>
              <View style={styles.positionsRow}>
                {['GK', 'DEF', 'MED', 'DEL'].map(pos => (
                  <TouchableOpacity 
                    key={pos} 
                    style={[styles.posBtn, position === pos && { backgroundColor: theme.primary }]}
                    onPress={() => setPosition(position === pos ? '' : pos as any)}
                  >
                    <Text style={{ color: position === pos ? '#000' : theme.text, fontSize: 12, fontWeight: '700' }}>{pos}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.textSecondary }]}>Disponibilidad (Opcional)</Text>
              <TextInput 
                style={[styles.input, { color: theme.text, borderColor: isDark ? '#333' : '#E0E0E0' }]}
                placeholder="Ej. Martes y jueves en la noche"
                placeholderTextColor={theme.textSecondary}
                value={availabilityNote}
                onChangeText={setAvailabilityNote}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>Notas adicionales</Text>
              <TextInput 
                style={[styles.input, { color: theme.text, borderColor: isDark ? '#333' : '#E0E0E0', height: 80, textAlignVertical: 'top' }]}
                placeholder="Ej. Buscamos central con buen pie..."
                placeholderTextColor={theme.textSecondary}
                multiline
                value={notes}
                onChangeText={setNotes}
              />

              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: theme.primary, opacity: createMutation.isPending ? 0.7 : 1 }]}
                onPress={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Check size={20} color="#000" />
                    <Text style={styles.submitText}>Publicar Anuncio</Text>
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
    height: '85%',
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
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    gap: 8,
  },
  typeBtnText: {
    fontWeight: '700',
    fontSize: 13,
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
  positionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  posBtn: {
    paddingHorizontal: 16,
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
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
  }
});
