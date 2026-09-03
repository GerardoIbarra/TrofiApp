import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Award,
  Search,
  Mail,
  CheckCircle,
  XCircle,
  Radio,
  Star,
  Shield,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  useGetAvailableReferees,
  useVerifyReferee,
  useUnverifyReferee,
} from '@/features/referees/services/refereeApi';
import { RefereeBadge } from '@/components/referees/RefereeBadge';
import { RefereeAvailabilityToggle } from '@/components/referees/RefereeAvailabilityToggle';
import { RefereeOffersListModal } from '@/components/referees/RefereeOffersListModal';
import { RefereeAvailability } from '@/features/referees/types/referee';

export default function RefereeMarketplaceScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [isOffersModalVisible, setIsOffersModalVisible] = useState(false);

  const isReferee = Boolean((user as any)?.referee_profile);
  const isStaff = Boolean((user as any)?.is_staff);

  const {
    data: referees,
    isLoading,
    isRefetching,
    refetch,
  } = useGetAvailableReferees(true);

  const verifyMutation = useVerifyReferee();
  const unverifyMutation = useUnverifyReferee();

  const handleToggleVerification = (referee: RefereeAvailability) => {
    if (!isStaff) return;

    if (referee.admin_verified) {
      Alert.alert(
        'Remover Certificación',
        `¿Deseas revocar el sello de certificación de Trofi para ${referee.referee_name}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Revocar',
            style: 'destructive',
            onPress: () => {
              unverifyMutation.mutate(referee.id, {
                onSuccess: () => {
                  Alert.alert('Actualizado', 'Se ha revocado la certificación.');
                  refetch();
                },
                onError: (err: any) => {
                  Alert.alert('Error', err?.response?.data?.detail || 'No se pudo revocar certificación.');
                },
              });
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Certificar Árbitro',
        `¿Deseas otorgar el sello oficial de verificación a ${referee.referee_name}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Certificar',
            onPress: () => {
              verifyMutation.mutate(referee.id, {
                onSuccess: () => {
                  Alert.alert('Certificado', 'El árbitro ahora cuenta con sello oficial de verificación.');
                  refetch();
                },
                onError: (err: any) => {
                  Alert.alert('Error', err?.response?.data?.detail || 'No se pudo verificar árbitro.');
                },
              });
            },
          },
        ]
      );
    }
  };

  const filteredReferees = (referees || []).filter((r) => {
    if (!searchQuery) return true;
    const name = (r.referee_name || '').toLowerCase();
    const notes = (r.notes || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || notes.includes(query);
  });

  const refereeUserId = (user as any)?.referee_profile?.id || user?.id;

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.titleRow}>
            <Award size={20} color={theme.primary} />
            <Text style={[styles.title, { color: theme.text }]}>Mercado de Árbitros</Text>
          </View>

          {isReferee ? (
            <TouchableOpacity
              style={[styles.offersBtn, { backgroundColor: theme.primary }]}
              onPress={() => setIsOffersModalVisible(true)}
            >
              <Mail size={15} color="#001A2C" />
              <Text style={styles.offersBtnText}>Ofertas</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Search Input */}
        <View style={[styles.searchBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
          <Search size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar por nombre o nota de disponibilidad..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </SafeAreaView>

      <FlatList
        data={filteredReferees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />
        }
        ListHeaderComponent={
          isReferee ? (
            <RefereeAvailabilityToggle
              initialIsOpen={true}
              onUpdated={refetch}
            />
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Radio size={44} color={theme.textSecondary} opacity={0.3} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No hay árbitros disponibles
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {searchQuery
                ? 'No encontramos árbitros con ese criterio de búsqueda.'
                : 'En este momento ningún árbitro colegiado ha marcado disponibilidad.'}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
              <RefereeBadge
                name={item.referee_name || 'Árbitro'}
                averageRating={item.average_rating}
                ratingCount={item.rating_count}
                adminVerified={item.admin_verified}
                yearsExperience={item.years_experience}
              />

              {isStaff && (
                <TouchableOpacity
                  style={[
                    styles.verifyBtn,
                    item.admin_verified
                      ? { backgroundColor: 'rgba(239, 68, 68, 0.12)' }
                      : { backgroundColor: 'rgba(16, 185, 129, 0.12)' },
                  ]}
                  onPress={() => handleToggleVerification(item)}
                >
                  <Text
                    style={[
                      styles.verifyBtnText,
                      { color: item.admin_verified ? '#EF4444' : '#10B981' },
                    ]}
                  >
                    {item.admin_verified ? 'Revocar Staff' : 'Certificar Staff'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {item.notes && (
              <Text style={[styles.notesText, { color: theme.textSecondary }]}>
                "{item.notes}"
              </Text>
            )}
          </View>
        )}
      />

      {isReferee && refereeUserId && (
        <RefereeOffersListModal
          visible={isOffersModalVisible}
          onClose={() => setIsOffersModalVisible(false)}
          refereeId={refereeUserId}
        />
      )}
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    backBtn: {
      padding: 6,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
    },
    offersBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
    },
    offersBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#001A2C',
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 42,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },
    card: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    verifyBtn: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    verifyBtnText: {
      fontSize: 11,
      fontWeight: '700',
    },
    notesText: {
      fontSize: 12,
      fontStyle: 'italic',
      marginTop: 8,
    },
    emptyContainer: {
      padding: 50,
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
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
    },
  });
