import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Award,
  Plus,
  ArrowLeft,
  Filter,
  Megaphone,
  Briefcase,
  Layers,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useGetSponsorPlacements } from '@/features/sponsors/services/sponsorApi';
import { PlacementCard } from '@/components/sponsors/PlacementCard';
import { CreatePlacementModal } from '@/components/sponsors/CreatePlacementModal';
import api from '@/services/api';

export default function SponsorPlacementsScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);

  const [filterType, setFilterType] = useState<'my' | 'all'>('my');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // If user has sponsor_profile or sponsor_id
  const sponsorId = user?.sponsor_profile?.id || (user?.sponsor_profile as any);

  const {
    data: placements,
    isLoading,
    isRefetching,
    refetch,
  } = useGetSponsorPlacements(
    filterType === 'my' && sponsorId ? { sponsor: sponsorId } : undefined
  );

  const handleCreateSponsorProfile = async () => {
    setIsCreatingProfile(true);
    try {
      await api.post('/v1/sponsor-profiles/', {});
      const meRes = await api.get<any>('/v1/me/');
      useAuthStore.setState({ user: meRes });
      Alert.alert('¡Perfil Creado!', 'Ya tienes tu perfil de Sponsor activo.');
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.detail || 'Hubo un error al crear tu perfil de sponsor.'
      );
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const hasSponsorProfile = Boolean(user?.sponsor_profile);

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <Award size={20} color="#F59E0B" />
            <Text style={[styles.title, { color: theme.text }]}>Sponsor Hub</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Plus size={18} color="#001A2C" />
            <Text style={styles.addBtnText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        {/* Sponsor Profile Onboarding Notice if missing */}
        {!hasSponsorProfile && (
          <View style={styles.onboardingBanner}>
            <Megaphone size={20} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.onboardingTitle, { color: theme.text }]}>
                Perfil de Sponsor
              </Text>
              <Text style={[styles.onboardingText, { color: theme.textSecondary }]}>
                Para asociar tus marcas y solicitar patrocinios necesitas activar tu perfil de Sponsor.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.createProfileBtn, { backgroundColor: theme.primary }]}
              onPress={handleCreateSponsorProfile}
              disabled={isCreatingProfile}
            >
              {isCreatingProfile ? (
                <ActivityIndicator size="small" color="#001A2C" />
              ) : (
                <Text style={styles.createProfileBtnText}>Activar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Filters Tab: Mis Espacios vs Todos */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setFilterType('my')}
            style={[
              styles.tabBtn,
              filterType === 'my' && {
                borderBottomColor: theme.primary,
                borderBottomWidth: 2,
              },
            ]}
          >
            <Briefcase
              size={15}
              color={filterType === 'my' ? theme.primary : theme.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: filterType === 'my' ? theme.primary : theme.textSecondary },
              ]}
            >
              Mis Espacios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterType('all')}
            style={[
              styles.tabBtn,
              filterType === 'all' && {
                borderBottomColor: theme.primary,
                borderBottomWidth: 2,
              },
            ]}
          >
            <Layers
              size={15}
              color={filterType === 'all' ? theme.primary : theme.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: filterType === 'all' ? theme.primary : theme.textSecondary },
              ]}
            >
              Explorar Activos
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Placements List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando espacios publicitarios...
          </Text>
        </View>
      ) : (
        <FlatList
          data={placements || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Award size={48} color={theme.textSecondary} opacity={0.3} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No hay espacios publicitarios
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {filterType === 'my'
                  ? 'Aún no has solicitado ningún espacio publicitario. Toca en "Nuevo" para comenzar.'
                  : 'No se encontraron espacios publicitarios activos.'}
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
                onPress={() => setIsCreateModalVisible(true)}
              >
                <Plus size={16} color="#001A2C" />
                <Text style={styles.emptyBtnText}>Pedir Espacio Publicitario</Text>
              </TouchableOpacity>
            </View>
          )}
          renderItem={({ item }) => (
            <PlacementCard placement={item} onRefresh={refetch} />
          )}
        />
      )}

      {/* Create Modal */}
      <CreatePlacementModal
        visible={isCreateModalVisible}
        onClose={() => {
          setIsCreateModalVisible(false);
          refetch();
        }}
      />
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
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    addBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#001A2C',
    },
    onboardingBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: 'rgba(56, 189, 248, 0.1)',
      borderRadius: 14,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: 'rgba(56, 189, 248, 0.25)',
    },
    onboardingTitle: {
      fontSize: 13,
      fontWeight: '800',
    },
    onboardingText: {
      fontSize: 11,
      marginTop: 2,
    },
    createProfileBtn: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
    },
    createProfileBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#001A2C',
    },
    tabsRow: {
      flexDirection: 'row',
      marginTop: 6,
    },
    tabBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '700',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      gap: 12,
    },
    loadingText: {
      fontSize: 13,
      fontWeight: '600',
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '800',
      marginTop: 16,
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 20,
    },
    emptyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
    },
    emptyBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#001A2C',
    },
  });
