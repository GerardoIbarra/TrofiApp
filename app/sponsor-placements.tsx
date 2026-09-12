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
  Modal,
  TextInput,
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
  Building2,
  X,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useGetSponsorPlacements } from '@/features/sponsors/services/sponsorApi';
import { PlacementCard } from '@/components/sponsors/PlacementCard';
import { CreatePlacementModal } from '@/components/sponsors/CreatePlacementModal';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';

export default function SponsorPlacementsScreen() {
  const { theme, isDark } = useTheme();
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);

  const [filterType, setFilterType] = useState<'my' | 'all'>('my');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isSponsorModalVisible, setIsSponsorModalVisible] = useState(false);
  const [companyName, setCompanyName] = useState('');

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
    const trimmed = companyName.trim();
    if (!trimmed) {
      Alert.alert(
        isEn ? 'Name required' : 'Nombre requerido',
        isEn ? 'Please enter your company or brand name.' : 'Por favor ingresa el nombre de tu empresa o marca.'
      );
      return;
    }

    setIsCreatingProfile(true);
    try {
      await api.post('/v1/sponsor-profiles/', {
        company_name: trimmed,
      });
      const meRes = await api.get<any>('/v1/me/');
      useAuthStore.setState({ user: meRes });
      setIsSponsorModalVisible(false);
      setCompanyName('');
      Alert.alert(
        isEn ? 'Profile Created!' : '¡Perfil Creado!',
        isEn ? 'Your Sponsor profile is now active.' : 'Ya tienes tu perfil de Sponsor activo.'
      );
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.company_name?.[0] ||
        err?.response?.data?.detail ||
        (isEn ? 'There was an error creating your sponsor profile.' : 'Hubo un error al crear tu perfil de sponsor.');
      Alert.alert(isEn ? 'Error' : 'Error', errMsg);
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
            <Text style={styles.addBtnText}>{isEn ? 'New' : 'Nuevo'}</Text>
          </TouchableOpacity>
        </View>

        {/* Sponsor Profile Onboarding Notice if missing */}
        {!hasSponsorProfile && (
          <View style={styles.onboardingBanner}>
            <Megaphone size={20} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.onboardingTitle, { color: theme.text }]}>
                {isEn ? 'Sponsor Profile' : 'Perfil de Sponsor'}
              </Text>
              <Text style={[styles.onboardingText, { color: theme.textSecondary }]}>
                {isEn
                  ? 'To link your brands and request sponsorships, you need to activate your Sponsor profile.'
                  : 'Para asociar tus marcas y solicitar patrocinios necesitas activar tu perfil de Sponsor.'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.createProfileBtn, { backgroundColor: theme.primary }]}
              onPress={() => setIsSponsorModalVisible(true)}
            >
              <Text style={styles.createProfileBtnText}>{isEn ? 'Activate' : 'Activar'}</Text>
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
              {isEn ? 'My Placements' : 'Mis Espacios'}
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
              {isEn ? 'Explore Active' : 'Explorar Activos'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Placements List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            {isEn ? 'Loading sponsor placements...' : 'Cargando espacios publicitarios...'}
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
                {isEn ? 'No sponsor placements' : 'No hay espacios publicitarios'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {filterType === 'my'
                  ? (isEn
                      ? 'You have not requested any sponsor placement yet. Tap "New" to start.'
                      : 'Aún no has solicitado ningún espacio publicitario. Toca en "Nuevo" para comenzar.')
                  : (isEn
                      ? 'No active sponsor placements found.'
                      : 'No se encontraron espacios publicitarios activos.')}
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
                onPress={() => setIsCreateModalVisible(true)}
              >
                <Plus size={16} color="#001A2C" />
                <Text style={styles.emptyBtnText}>
                  {isEn ? 'Request Placement' : 'Pedir Espacio Publicitario'}
                </Text>
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

      {/* Activate Sponsor Profile Modal */}
      <Modal
        visible={isSponsorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSponsorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#0D1E36' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Building2 size={20} color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {isEn ? 'Activate Sponsor Profile' : 'Activar Perfil Sponsor'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsSponsorModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              {isEn
                ? 'Enter your company or brand name.'
                : 'Ingresa el nombre de tu empresa o marca patrocinadora.'}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                {isEn ? 'Company Name *' : 'Nombre de la Empresa *'}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.text,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                  },
                ]}
                placeholder={isEn ? 'e.g. Nike, Sports Express, etc.' : 'Ej. Nike, Deportes Express, etc.'}
                placeholderTextColor={theme.textSecondary}
                value={companyName}
                onChangeText={setCompanyName}
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1' },
                ]}
                onPress={() => setIsSponsorModalVisible(false)}
                disabled={isCreatingProfile}
              >
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>
                  {isEn ? 'Cancel' : 'Cancelar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
                onPress={handleCreateSponsorProfile}
                disabled={isCreatingProfile}
              >
                {isCreatingProfile ? (
                  <ActivityIndicator size="small" color="#001A2C" />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    {isEn ? 'Activate Profile' : 'Activar Perfil'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalCard: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 18,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    modalTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '800',
    },
    modalCloseBtn: {
      padding: 4,
    },
    modalSubtitle: {
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 18,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    textInput: {
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      fontSize: 14,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'flex-end',
    },
    modalCancelBtn: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCancelText: {
      fontSize: 13,
      fontWeight: '700',
    },
    modalSubmitBtn: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 120,
    },
    modalSubmitText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#001A2C',
    },
  });
