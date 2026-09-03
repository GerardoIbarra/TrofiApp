import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Match } from '@/features/tournaments/types/match';
import { useTheme } from '@/context/ThemeContext';
import { X, Award, Send, UserCheck, AlertTriangle, Radio } from 'lucide-react-native';
import { useGetAvailableReferees, useOfferMatchReferee } from '@/features/referees/services/refereeApi';
import { useAssignReferee } from '@/features/matches/services/liveMatchApi';
import { RefereeBadge } from '@/components/referees/RefereeBadge';
import { RefereeAvailability } from '@/features/referees/types/referee';
import api from '@/services/api';

interface AssignRefereeModalProps {
  visible: boolean;
  onClose: () => void;
  match: Match;
}

export function AssignRefereeModal({ visible, onClose, match }: AssignRefereeModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [activeTab, setActiveTab] = useState<'marketplace' | 'direct'>('marketplace');
  const [leagueFeatures, setLeagueFeatures] = useState<any>(null);
  const [isLoadingLeague, setIsLoadingLeague] = useState(false);

  const {
    data: availableReferees,
    isLoading: isLoadingAvailable,
    refetch,
  } = useGetAvailableReferees(true);

  const offerMutation = useOfferMatchReferee(match.id);
  const assignMutation = useAssignReferee(match.id);

  useEffect(() => {
    if (visible && match) {
      checkLeagueFeatures();
    }
  }, [visible, match?.id]);

  const checkLeagueFeatures = async () => {
    setIsLoadingLeague(true);
    try {
      // Find tournament or league governing this match
      if (match.tournament) {
        const tournamentData = await api.get<any>(`/v1/tournaments/${match.tournament}/`);
        if (tournamentData?.league) {
          const leagueData = await api.get<any>(`/v1/leagues/${tournamentData.league}/`);
          setLeagueFeatures(leagueData?.features || null);
        }
      }
    } catch (e) {
      console.warn('Error checking league features for referee marketplace:', e);
    } finally {
      setIsLoadingLeague(false);
    }
  };

  const isMarketplaceDisabled = leagueFeatures && leagueFeatures.referee_marketplace_enabled === false;

  const handleOffer = (item: RefereeAvailability) => {
    if (isMarketplaceDisabled) {
      Alert.alert(
        'Mercado Deshabilitado',
        'La liga no tiene habilitado el mercado de árbitros (referee_marketplace_enabled = false). La solicitud dará error 400.'
      );
      return;
    }

    Alert.alert(
      'Ofrecer Partido',
      `¿Deseas enviar una oferta a ${item.referee_name || 'este árbitro'} para dirigir este encuentro?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar Oferta',
          onPress: () => {
            offerMutation.mutate(
              { referee: item.referee },
              {
                onSuccess: () => {
                  Alert.alert(
                    '¡Oferta Enviada!',
                    `Se ha enviado la oferta a ${item.referee_name || 'el árbitro'}. Recibirás la asignación cuando acepte.`
                  );
                  onClose();
                },
                onError: (err: any) => {
                  const detail =
                    err?.response?.data?.detail ||
                    err?.response?.data?.error ||
                    'No se pudo enviar la oferta (puede que el árbitro ya tenga una oferta pendiente en este partido o el módulo no esté habilitado).';
                  Alert.alert('Error al ofrecer partido', detail);
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleDirectAssign = (item: RefereeAvailability) => {
    Alert.alert(
      'Asignar Directamente',
      `¿Deseas asignar a ${item.referee_name || 'este árbitro'} directamente al partido?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Asignar',
          onPress: () => {
            assignMutation.mutate(
              { referee: item.referee },
              {
                onSuccess: () => {
                  Alert.alert('¡Árbitro Asignado!', 'El árbitro ha quedado asignado al partido.');
                  onClose();
                },
                onError: (err: any) => {
                  const detail =
                    err?.response?.data?.detail || 'No se pudo asignar el árbitro al partido.';
                  Alert.alert('Error al asignar', detail);
                },
              }
            );
          },
        },
      ]
    );
  };

  const renderRefereeItem = ({ item }: { item: RefereeAvailability }) => {
    return (
      <View style={[styles.refereeCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
        <View style={styles.cardHeader}>
          <RefereeBadge
            name={item.referee_name || 'Árbitro Colegiado'}
            averageRating={item.average_rating}
            ratingCount={item.rating_count}
            adminVerified={item.admin_verified}
            yearsExperience={item.years_experience}
          />
        </View>

        {item.notes && (
          <Text style={[styles.notesText, { color: theme.textSecondary }]}>
            "{item.notes}"
          </Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[
              styles.offerBtn,
              { backgroundColor: theme.primary },
              isMarketplaceDisabled && { opacity: 0.6 },
            ]}
            onPress={() => handleOffer(item)}
            disabled={offerMutation.isPending || isMarketplaceDisabled}
          >
            <Send size={13} color="#001A2C" />
            <Text style={styles.offerBtnText}>Ofrecer Partido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.directBtn, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }]}
            onPress={() => handleDirectAssign(item)}
            disabled={assignMutation.isPending}
          >
            <UserCheck size={13} color={theme.text} />
            <Text style={[styles.directBtnText, { color: theme.text }]}>Asignar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Award size={20} color={theme.primary} />
              <Text style={[styles.title, { color: theme.text }]}>Designar Árbitro</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Warning banner if referee marketplace is disabled on governing league */}
          {isMarketplaceDisabled && (
            <View style={styles.warningBanner}>
              <AlertTriangle size={16} color="#EF4444" />
              <Text style={styles.warningText}>
                El Mercado de Árbitros está deshabilitado en esta liga (referee_marketplace_enabled = false).
              </Text>
            </View>
          )}

          <View style={styles.subHeader}>
            <View style={styles.matchBadge}>
              <Text style={[styles.matchBadgeText, { color: theme.textSecondary }]}>
                {match.home_team_name} vs {match.away_team_name}
              </Text>
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Árbitros Disponibles en el Mercado
            </Text>
          </View>

          {isLoadingAvailable || isLoadingLeague ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Buscando árbitros disponibles...
              </Text>
            </View>
          ) : (
            <FlatList
              data={availableReferees || []}
              keyExtractor={(item) => item.id}
              renderItem={renderRefereeItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => (
                <View style={styles.emptyBox}>
                  <Radio size={36} color={theme.textSecondary} opacity={0.3} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    No hay árbitros disponibles en este momento
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    Los árbitros deben marcarse como disponibles en su perfil para aparecer en la lista de ofertas.
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      maxHeight: '85%',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 24,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
    },
    closeBtn: {
      padding: 4,
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      marginHorizontal: 16,
      marginTop: 12,
      padding: 10,
      borderRadius: 10,
    },
    warningText: {
      flex: 1,
      fontSize: 11,
      color: '#EF4444',
      fontWeight: '600',
    },
    subHeader: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    matchBadge: {
      marginBottom: 8,
    },
    matchBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    listContent: {
      padding: 16,
    },
    loadingBox: {
      padding: 50,
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 13,
      fontWeight: '600',
    },
    refereeCard: {
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    cardHeader: {
      marginBottom: 8,
    },
    notesText: {
      fontSize: 12,
      fontStyle: 'italic',
      marginBottom: 12,
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    offerBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 36,
      borderRadius: 10,
    },
    offerBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#001A2C',
    },
    directBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      height: 36,
      borderRadius: 10,
      borderWidth: 1,
    },
    directBtnText: {
      fontSize: 12,
      fontWeight: '700',
    },
    emptyBox: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '800',
      marginTop: 12,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 16,
    },
  });
