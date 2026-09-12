import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  Plus,
  Search,
  Trophy,
  Users,
  Bell,
  MapPin,
  Trash2,
  Check,
  X,
  Swords,
  Shield,
  Star,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { LayoutHeader } from '@/components/ui/layout/LayoutHeader';
import { LocationService } from '@/services/locationService';
import {
  useGetPickupSpots,
  useGetPickupLeaderboard,
  useGetPickupCrews,
  useJoinPickupCrew,
  useLeavePickupCrew,
  useGetCrewChallenges,
  useRespondCrewChallenge,
  useGetPickupAlerts,
  useTogglePickupAlert,
  useDeletePickupAlert,
  useCreatePickupCrew,
} from '@/features/pickup/services/pickupApi';
import { PickupSpotCard } from '@/components/pickup/PickupSpotCard';
import { CreatePickupSpotModal } from '@/components/pickup/CreatePickupSpotModal';
import { CreatePickupAlertModal } from '@/components/pickup/CreatePickupAlertModal';
import { SpotType } from '@/features/pickup/types/pickup';

type RetasTab = 'SPOTS' | 'LEADERBOARD' | 'CREWS' | 'ALERTS';

const SPOT_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'court', label: 'Canchas' },
  { key: 'park', label: 'Parques' },
  { key: 'street', label: 'Calles' },
  { key: 'field', label: 'Campos' },
];

export default function RetasScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const [activeTab, setActiveTab] = useState<RetasTab>('SPOTS');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateSpotVisible, setIsCreateSpotVisible] = useState(false);
  const [isCreateAlertVisible, setIsCreateAlertVisible] = useState(false);
  const [newCrewName, setNewCrewName] = useState('');
  const [isCreatingCrew, setIsCreatingCrew] = useState(false);

  // User location for proximity sorting
  const userLoc = LocationService.getLocation();

  // 1. SPOTS
  const {
    data: spots = [],
    isLoading: isLoadingSpots,
    refetch: refetchSpots,
  } = useGetPickupSpots({
    spot_type: selectedType !== 'all' ? selectedType : undefined,
    search: searchQuery.trim() || undefined,
    latitude: userLoc?.latitude,
    longitude: userLoc?.longitude,
    radius: 50,
  });

  // 2. LEADERBOARD
  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } =
    useGetPickupLeaderboard();

  // 3. CREWS & CHALLENGES
  const { data: crews = [], refetch: refetchCrews } = useGetPickupCrews();
  const { data: challenges = [], refetch: refetchChallenges } = useGetCrewChallenges();
  const joinCrewMutation = useJoinPickupCrew();
  const leaveCrewMutation = useLeavePickupCrew();
  const createCrewMutation = useCreatePickupCrew();
  const respondChallengeMutation = useRespondCrewChallenge();

  // 4. ALERTS
  const { data: alerts = [], refetch: refetchAlerts } = useGetPickupAlerts();
  const toggleAlertMutation = useTogglePickupAlert();
  const deleteAlertMutation = useDeletePickupAlert();

  const handleCreateCrew = async () => {
    if (!newCrewName.trim()) return;
    try {
      await createCrewMutation.mutateAsync({ name: newCrewName.trim() });
      setNewCrewName('');
      setIsCreatingCrew(false);
      refetchCrews();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo crear el crew.');
    }
  };

  const handleChallengeAction = async (id: string, action: 'accept' | 'decline') => {
    try {
      await respondChallengeMutation.mutateAsync({ id, action });
      refetchChallenges();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo responder el desafío.');
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <LayoutHeader title="RETAS" showBackButton={true} />

      <View style={styles.content}>
        {/* Navigation Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'SPOTS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('SPOTS')}
          >
            <Text style={[styles.tabText, activeTab === 'SPOTS' && styles.tabTextActive]}>
              CANCHAS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'LEADERBOARD' && styles.tabBtnActive]}
            onPress={() => setActiveTab('LEADERBOARD')}
          >
            <Text
              style={[styles.tabText, activeTab === 'LEADERBOARD' && styles.tabTextActive]}
            >
              RANKING
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'CREWS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('CREWS')}
          >
            <Text style={[styles.tabText, activeTab === 'CREWS' && styles.tabTextActive]}>
              CREWS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'ALERTS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('ALERTS')}
          >
            <Text style={[styles.tabText, activeTab === 'ALERTS' && styles.tabTextActive]}>
              AVISOS ({alerts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================= */}
        {/* TAB 1: SPOTS */}
        {/* ========================================================= */}
        {activeTab === 'SPOTS' && (
          <View style={{ flex: 1 }}>
            {/* Search & Add Bar */}
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Search size={16} color={theme.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar cancha o parque..."
                  placeholderTextColor={theme.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <TouchableOpacity
                style={styles.addSpotBtn}
                onPress={() => setIsCreateSpotVisible(true)}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#001A2C" />
                <Text style={styles.addSpotBtnText}>Nueva</Text>
              </TouchableOpacity>
            </View>

            {/* Type Filter Pills */}
            <View style={styles.filterPills}>
              {SPOT_FILTERS.map((f) => {
                const isSelected = selectedType === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => setSelectedType(f.key)}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Spots List */}
            {isLoadingSpots ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={styles.loadingText}>Buscando canchas cercanas...</Text>
              </View>
            ) : spots.length === 0 ? (
              <View style={styles.centerContainer}>
                <MapPin size={40} color={theme.textSecondary} opacity={0.3} />
                <Text style={styles.emptyTitle}>No hay canchas registradas</Text>
                <Text style={styles.emptySubtitle}>
                  Sé el primero en registrar un lugar de reta en tu zona.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => setIsCreateSpotVisible(true)}
                >
                  <Text style={styles.emptyActionBtnText}>+ Agregar Cancha</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={spots}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => <PickupSpotCard spot={item} />}
              />
            )}
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LEADERBOARD */}
        {/* ========================================================= */}
        {activeTab === 'LEADERBOARD' && (
          <View style={{ flex: 1 }}>
            {isLoadingLeaderboard ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            ) : leaderboard.length === 0 ? (
              <View style={styles.centerContainer}>
                <Trophy size={40} color={theme.textSecondary} opacity={0.3} />
                <Text style={styles.emptyTitle}>Sin jugadores en el ranking</Text>
                <Text style={styles.emptySubtitle}>
                  Los jugadores aparecerán aquí a medida que hagan check-in en retas.
                </Text>
              </View>
            ) : (
              <FlatList
                data={leaderboard}
                keyExtractor={(item) => item.user_id}
                contentContainerStyle={{ paddingBottom: 30 }}
                renderItem={({ item, index }) => (
                  <View style={styles.leaderboardRow}>
                    <Text style={styles.rankNumber}>#{index + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.playerName}>{item.user_name}</Text>
                      <Text style={styles.playerSub}>
                        {item.tier?.name || 'Novato'} • {item.distinct_spot_count} canchas visitadas
                      </Text>
                    </View>
                    <View style={styles.checkinBadge}>
                      <Text style={styles.checkinBadgeCount}>{item.check_in_count}</Text>
                      <Text style={styles.checkinBadgeLabel}>retas</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CREWS & CHALLENGES */}
        {/* ========================================================= */}
        {activeTab === 'CREWS' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Pending Challenges Section */}
            {challenges.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Swords size={16} color="#F59E0B" />
                  <Text style={styles.sectionHeaderTitle}>Desafíos Entre Crews</Text>
                </View>
                {challenges.map((ch) => (
                  <View key={ch.id} style={styles.challengeCard}>
                    <Text style={styles.challengeTitle}>
                      {ch.challenger_crew_name} vs {ch.challenged_crew_name}
                    </Text>
                    {ch.message && <Text style={styles.challengeMsg}>"{ch.message}"</Text>}
                    <Text style={styles.challengeSub}>
                      {ch.spot_name ? `En ${ch.spot_name}` : 'Lugar por acordar'}
                    </Text>

                    {ch.status === 'pending' ? (
                      <View style={styles.challengeActions}>
                        <TouchableOpacity
                          style={styles.challengeAcceptBtn}
                          onPress={() => handleChallengeAction(ch.id, 'accept')}
                        >
                          <Check size={13} color="#FFF" />
                          <Text style={styles.challengeAcceptText}>Aceptar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.challengeDeclineBtn}
                          onPress={() => handleChallengeAction(ch.id, 'decline')}
                        >
                          <X size={13} color="#EF4444" />
                          <Text style={styles.challengeDeclineText}>Rechazar</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={styles.challengeStatus}>Estado: {ch.status}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Create Crew Row */}
            <View style={styles.createCrewCard}>
              <TextInput
                style={styles.createCrewInput}
                placeholder="Nombre de tu nuevo Crew..."
                placeholderTextColor={theme.textSecondary}
                value={newCrewName}
                onChangeText={setNewCrewName}
              />
              <TouchableOpacity
                style={[styles.createCrewBtn, !newCrewName.trim() && styles.btnDisabled]}
                onPress={handleCreateCrew}
                disabled={!newCrewName.trim()}
              >
                <Plus size={16} color="#001A2C" />
                <Text style={styles.createCrewBtnText}>Crear</Text>
              </TouchableOpacity>
            </View>

            {/* Crews List */}
            {crews.length === 0 ? (
              <View style={styles.centerContainer}>
                <Users size={36} color={theme.textSecondary} opacity={0.3} />
                <Text style={styles.emptyTitle}>No hay crews registrados</Text>
                <Text style={styles.emptySubtitle}>Crea un grupo para coordinar retas con tus amigos.</Text>
              </View>
            ) : (
              crews.map((c) => (
                <View key={c.id} style={styles.crewRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.crewName}>{c.name}</Text>
                    <Text style={styles.crewSub}>{c.members_count || 1} miembros</Text>
                  </View>

                  {c.is_member ? (
                    <TouchableOpacity
                      style={styles.leaveBtn}
                      onPress={async () => {
                        await leaveCrewMutation.mutateAsync(c.id);
                        refetchCrews();
                      }}
                    >
                      <Text style={styles.leaveBtnText}>Salir</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.joinBtn}
                      onPress={async () => {
                        await joinCrewMutation.mutateAsync(c.id);
                        refetchCrews();
                      }}
                    >
                      <Text style={styles.joinBtnText}>Unirme</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ALERTS */}
        {/* ========================================================= */}
        {activeTab === 'ALERTS' && (
          <View style={{ flex: 1 }}>
            <View style={styles.alertHeaderRow}>
              <Text style={styles.alertHeaderSubtitle}>
                Te avisamos cuando alguien juegue cerca o en tus canchas favoritas.
              </Text>
              <TouchableOpacity
                style={styles.newAlertBtn}
                onPress={() => setIsCreateAlertVisible(true)}
              >
                <Plus size={14} color="#001A2C" />
                <Text style={styles.newAlertBtnText}>Nuevo</Text>
              </TouchableOpacity>
            </View>

            {alerts.length === 0 ? (
              <View style={styles.centerContainer}>
                <Bell size={40} color={theme.textSecondary} opacity={0.3} />
                <Text style={styles.emptyTitle}>No tienes avisos activos</Text>
                <Text style={styles.emptySubtitle}>
                  Configura alertas para recibir notificaciones cuando haya reta cerca.
                </Text>
              </View>
            ) : (
              <FlatList
                data={alerts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 30 }}
                renderItem={({ item }) => (
                  <View style={styles.alertCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>
                        {item.label || item.spot_name || 'Aviso de proximidad'}
                      </Text>
                      <Text style={styles.alertSub}>
                        {item.radius_km ? `Radio: ${item.radius_km} km` : 'Cancha puntual'}
                        {item.start_time && ` • ${item.start_time} a ${item.end_time}`}
                      </Text>
                    </View>

                    <View style={styles.alertActions}>
                      <TouchableOpacity
                        style={[styles.toggleBtn, item.is_active && styles.toggleBtnActive]}
                        onPress={async () => {
                          await toggleAlertMutation.mutateAsync({
                            id: item.id,
                            is_active: !item.is_active,
                          });
                          refetchAlerts();
                        }}
                      >
                        <Text style={[styles.toggleBtnText, item.is_active && styles.toggleBtnTextActive]}>
                          {item.is_active ? 'Activo' : 'Pausa'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteAlertBtn}
                        onPress={async () => {
                          await deleteAlertMutation.mutateAsync(item.id);
                          refetchAlerts();
                        }}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}
      </View>

      {/* Modals */}
      <CreatePickupSpotModal
        visible={isCreateSpotVisible}
        onClose={() => setIsCreateSpotVisible(false)}
        onSuccess={() => refetchSpots()}
      />

      <CreatePickupAlertModal
        visible={isCreateAlertVisible}
        onClose={() => setIsCreateAlertVisible(false)}
        onSuccess={() => refetchAlerts()}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: 16,
      maxWidth: 800,
      width: '100%',
      alignSelf: 'center',
    },
    tabsRow: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 12,
      padding: 4,
      marginBottom: 12,
      gap: 4,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 9,
      alignItems: 'center',
      borderRadius: 9,
    },
    tabBtnActive: {
      backgroundColor: theme.primary,
    },
    tabText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
      letterSpacing: 0.3,
    },
    tabTextActive: {
      color: '#001A2C',
      fontWeight: '900',
    },
    searchRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 10,
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 10,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 13,
      color: theme.text,
    },
    addSpotBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.primary,
      paddingHorizontal: 14,
      borderRadius: 10,
      justifyContent: 'center',
    },
    addSpotBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#001A2C',
    },
    filterPills: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 12,
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    pillActive: {
      backgroundColor: isDark ? '#FFF' : '#001A2C',
    },
    pillText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    pillTextActive: {
      color: isDark ? '#000' : '#FFF',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
    },
    loadingText: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 8,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      marginTop: 10,
      marginBottom: 4,
    },
    emptySubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    emptyActionBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 14,
    },
    emptyActionBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#001A2C',
    },
    leaderboardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      gap: 12,
    },
    rankNumber: {
      fontSize: 15,
      fontWeight: '900',
      color: theme.primary,
      width: 32,
    },
    playerName: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
    },
    playerSub: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    checkinBadge: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      alignItems: 'center',
    },
    checkinBadgeCount: {
      fontSize: 14,
      fontWeight: '900',
      color: theme.primary,
    },
    checkinBadgeLabel: {
      fontSize: 9,
      color: theme.textSecondary,
    },
    sectionContainer: {
      marginBottom: 16,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    sectionHeaderTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
    },
    challengeCard: {
      backgroundColor: 'rgba(245, 158, 11, 0.08)',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.25)',
      marginBottom: 8,
      gap: 4,
    },
    challengeTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text,
    },
    challengeMsg: {
      fontSize: 12,
      fontStyle: 'italic',
      color: theme.text,
    },
    challengeSub: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    challengeActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 6,
    },
    challengeAcceptBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#10B981',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    challengeAcceptText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#FFF',
    },
    challengeDeclineBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
    },
    challengeDeclineText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#EF4444',
    },
    challengeStatus: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
      marginTop: 4,
    },
    createCrewCard: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    createCrewInput: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 10,
      paddingHorizontal: 12,
      fontSize: 13,
      color: theme.text,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    createCrewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.primary,
      paddingHorizontal: 14,
      borderRadius: 10,
      justifyContent: 'center',
    },
    createCrewBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#001A2C',
    },
    crewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    crewName: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
    },
    crewSub: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    joinBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    joinBtnText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#001A2C',
    },
    leaveBtn: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
    },
    leaveBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    alertHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      gap: 10,
    },
    alertHeaderSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      flex: 1,
    },
    newAlertBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    newAlertBtnText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#001A2C',
    },
    alertCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      gap: 10,
    },
    alertTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text,
    },
    alertSub: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    alertActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    toggleBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    toggleBtnActive: {
      backgroundColor: 'rgba(74, 222, 128, 0.2)',
    },
    toggleBtnText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    toggleBtnTextActive: {
      color: '#4ADE80',
    },
    deleteAlertBtn: {
      padding: 6,
    },
    btnDisabled: {
      opacity: 0.5,
    },
  });
