import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, Calendar, MapPin, Trophy, Check, Trash2, Mail } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { RefereeOffer } from '@/features/referees/types/referee';
import {
  useGetRefereeOffers,
  useAcceptRefereeOffer,
  useDeclineRefereeOffer,
} from '@/features/referees/services/refereeApi';

interface RefereeOffersListModalProps {
  visible: boolean;
  onClose: () => void;
  refereeId: string;
}

export const RefereeOffersListModal: React.FC<RefereeOffersListModalProps> = ({
  visible,
  onClose,
  refereeId,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const {
    data: offers,
    isLoading,
    refetch,
  } = useGetRefereeOffers({
    referee: refereeId,
    status: 'pending',
  });

  const acceptMutation = useAcceptRefereeOffer();
  const declineMutation = useDeclineRefereeOffer();

  const handleAccept = (offer: RefereeOffer) => {
    Alert.alert(
      'Aceptar Oferta de Partido',
      '¿Deseas aceptar dirigir este partido? Quedarás asignado automáticamente y se cancelarán otras ofertas pendientes para este encuentro.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: () => {
            acceptMutation.mutate(offer.id, {
              onSuccess: () => {
                Alert.alert(
                  '¡Partido Asignado!',
                  'Has aceptado la oferta y quedaste registrado como árbitro del partido.'
                );
                refetch();
              },
              onError: (err: any) => {
                const detail =
                  err?.response?.data?.detail ||
                  'No se pudo aceptar la oferta o ya fue asignada a otro árbitro.';
                Alert.alert('Error', detail);
              },
            });
          },
        },
      ]
    );
  };

  const handleDecline = (offer: RefereeOffer) => {
    declineMutation.mutate(offer.id, {
      onSuccess: () => {
        Alert.alert('Oferta Rechazada', 'Has rechazado esta oferta.');
        refetch();
      },
      onError: (err: any) => {
        const detail =
          err?.response?.data?.detail || 'No se pudo rechazar la oferta.';
        Alert.alert('Error', detail);
      },
    });
  };

  const renderOfferItem = ({ item }: { item: RefereeOffer }) => {
    const details = item.match_details;
    const homeTeam = details?.home_team_name || 'Equipo Local';
    const awayTeam = details?.away_team_name || 'Equipo Visitante';
    const formattedDate = details?.start_datetime
      ? new Date(details.start_datetime).toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Horario por confirmar';

    return (
      <View style={[styles.offerCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
        <View style={styles.cardHeader}>
          <View style={styles.tournamentRow}>
            <Trophy size={13} color={theme.primary} />
            <Text style={[styles.tournamentText, { color: theme.primary }]} numberOfLines={1}>
              {details?.tournament_name || 'Torneo Oficial'}
            </Text>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pendiente</Text>
          </View>
        </View>

        <Text style={[styles.matchTitle, { color: theme.text }]}>
          {homeTeam} vs {awayTeam}
        </Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Calendar size={13} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              {formattedDate}
            </Text>
          </View>

          {details?.venue_name && (
            <View style={styles.detailRow}>
              <MapPin size={13} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]} numberOfLines={1}>
                {details.venue_name}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: theme.primary }]}
            onPress={() => handleAccept(item)}
            disabled={acceptMutation.isPending}
          >
            <Check size={14} color="#001A2C" />
            <Text style={styles.acceptBtnText}>Aceptar Partido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.declineBtn, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }]}
            onPress={() => handleDecline(item)}
            disabled={declineMutation.isPending}
          >
            <Text style={[styles.declineBtnText, { color: theme.textSecondary }]}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Mail size={20} color={theme.primary} />
              <Text style={[styles.title, { color: theme.text }]}>Ofertas de Partidos</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Cargando ofertas de partidos...
              </Text>
            </View>
          ) : (
            <FlatList
              data={offers || []}
              keyExtractor={(item) => item.id}
              renderItem={renderOfferItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Mail size={40} color={theme.textSecondary} opacity={0.3} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    No tienes ofertas pendientes
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    Cuando un administrador de liga te ofrezca un encuentro aparecerá aquí para que puedas aceptarlo.
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

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
      fontSize: 17,
      fontWeight: '800',
    },
    closeBtn: {
      padding: 4,
    },
    listContent: {
      padding: 16,
    },
    loadingContainer: {
      padding: 50,
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 13,
      fontWeight: '600',
    },
    offerCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    tournamentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      maxWidth: '75%',
    },
    tournamentText: {
      fontSize: 12,
      fontWeight: '700',
    },
    pendingBadge: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    pendingText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#F59E0B',
      textTransform: 'uppercase',
    },
    matchTitle: {
      fontSize: 15,
      fontWeight: '800',
      marginBottom: 10,
    },
    detailsGrid: {
      gap: 6,
      marginBottom: 14,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    detailText: {
      fontSize: 12,
      fontWeight: '500',
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    acceptBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 38,
      borderRadius: 10,
    },
    acceptBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#001A2C',
    },
    declineBtn: {
      paddingHorizontal: 16,
      height: 38,
      borderRadius: 10,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    declineBtnText: {
      fontSize: 13,
      fontWeight: '700',
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      marginTop: 14,
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 18,
    },
  });
