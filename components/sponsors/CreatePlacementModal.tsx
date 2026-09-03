import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  X,
  Award,
  Trophy,
  Shield,
  Layers,
  AlertTriangle,
  Calendar,
  Image as ImageIcon,
  Link,
  Info,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PlacementType } from '@/features/sponsors/types/sponsor';
import { useCreateSponsorPlacement } from '@/features/sponsors/services/sponsorApi';
import api from '@/services/api';

interface CreatePlacementModalProps {
  visible: boolean;
  onClose: () => void;
  preselectedLeagueId?: string;
  preselectedTournamentId?: string;
  preselectedTeamId?: string;
}

type TargetType = 'league' | 'tournament' | 'team';

export const CreatePlacementModal: React.FC<CreatePlacementModalProps> = ({
  visible,
  onClose,
  preselectedLeagueId,
  preselectedTournamentId,
  preselectedTeamId,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);

  const [targetType, setTargetType] = useState<TargetType>(
    preselectedTournamentId
      ? 'tournament'
      : preselectedTeamId
      ? 'team'
      : 'league'
  );

  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(preselectedLeagueId || '');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(preselectedTournamentId || '');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(preselectedTeamId || '');

  const [placementType, setPlacementType] = useState<PlacementType>('standings_banner');
  const [durationDays, setDurationDays] = useState<number>(30);

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');

  const [leaguesList, setLeaguesList] = useState<any[]>([]);
  const [tournamentsList, setTournamentsList] = useState<any[]>([]);
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  const createMutation = useCreateSponsorPlacement();

  useEffect(() => {
    if (visible) {
      loadContextData();
    }
  }, [visible]);

  const loadContextData = async () => {
    setIsLoadingContext(true);
    try {
      const [leaguesRes, tournamentsRes, teamsRes] = await Promise.allSettled([
        api.get<any>('/v1/leagues/'),
        api.get<any>('/v1/tournaments/'),
        api.get<any>('/v1/teams/'),
      ]);

      const fetchedLeagues =
        leaguesRes.status === 'fulfilled'
          ? Array.isArray(leaguesRes.value)
            ? leaguesRes.value
            : leaguesRes.value?.results || []
          : [];

      const fetchedTournaments =
        tournamentsRes.status === 'fulfilled'
          ? Array.isArray(tournamentsRes.value)
            ? tournamentsRes.value
            : tournamentsRes.value?.results || []
          : [];

      const fetchedTeams =
        teamsRes.status === 'fulfilled'
          ? Array.isArray(teamsRes.value)
            ? teamsRes.value
            : teamsRes.value?.results || []
          : [];

      setLeaguesList(fetchedLeagues);
      setTournamentsList(fetchedTournaments);
      setTeamsList(fetchedTeams);

      if (!selectedLeagueId && fetchedLeagues.length > 0) {
        setSelectedLeagueId(fetchedLeagues[0].id);
      }
      if (!selectedTournamentId && fetchedTournaments.length > 0) {
        setSelectedTournamentId(fetchedTournaments[0].id);
      }
      if (!selectedTeamId && fetchedTeams.length > 0) {
        setSelectedTeamId(fetchedTeams[0].id);
      }
    } catch (e) {
      console.warn('Error loading context for sponsor placement:', e);
    } finally {
      setIsLoadingContext(false);
    }
  };

  // Find governing league to verify sponsors_enabled flag
  const getGoverningLeague = () => {
    if (targetType === 'league') {
      return leaguesList.find((l) => l.id === selectedLeagueId);
    }
    if (targetType === 'tournament') {
      const tournament = tournamentsList.find((t) => t.id === selectedTournamentId);
      if (!tournament) return null;
      return leaguesList.find((l) => l.id === tournament.league || l.name === tournament.league_name);
    }
    if (targetType === 'team') {
      const team = teamsList.find((t) => t.id === selectedTeamId);
      if (!team) return null;
      return leaguesList.find((l) => l.id === team.league);
    }
    return null;
  };

  const governingLeague = getGoverningLeague();
  const isSponsorsDisabled = governingLeague && governingLeague.features?.sponsors_enabled === false;

  const handleSubmit = async () => {
    // 1. Ensure exactly one target is specified
    let leagueTarget: string | undefined = undefined;
    let tournamentTarget: string | undefined = undefined;
    let teamTarget: string | undefined = undefined;

    if (targetType === 'league') {
      if (!selectedLeagueId) {
        Alert.alert('Error', 'Debes seleccionar una liga.');
        return;
      }
      leagueTarget = selectedLeagueId;
    } else if (targetType === 'tournament') {
      if (!selectedTournamentId) {
        Alert.alert('Error', 'Debes seleccionar un torneo.');
        return;
      }
      tournamentTarget = selectedTournamentId;
    } else if (targetType === 'team') {
      if (!selectedTeamId) {
        Alert.alert('Error', 'Debes seleccionar un equipo.');
        return;
      }
      teamTarget = selectedTeamId;
    }

    // 2. Pre-check sponsors_enabled
    if (isSponsorsDisabled) {
      Alert.alert(
        'Patrocinios Deshabilitados',
        `La liga "${governingLeague?.name || ''}" no tiene habilitada la función de patrocinadores (sponsors_enabled = false). El pedido será rechazado con 400.`
      );
      return;
    }

    // 3. Prepare dates
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const payload = {
      league: leagueTarget,
      tournament: tournamentTarget,
      team: teamTarget,
      placement_type: placementType,
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
      title: title.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      redirect_url: redirectUrl.trim() || undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        Alert.alert(
          '¡Espacio Solicitado!',
          'El espacio publicitario ha sido creado exitosamente con métricas activadas.'
        );
        onClose();
      },
      onError: (err: any) => {
        const detail =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          'Ocurrió un error al solicitar el espacio publicitario.';
        Alert.alert('Error al solicitar patrocinio', detail);
      },
    });
  };

  const PLACEMENT_TYPES: { type: PlacementType; label: string; desc: string }[] = [
    {
      type: 'standings_banner',
      label: 'Banner en Tabla de Posiciones',
      desc: 'Visible para todos los jugadores y fans al consultar clasificaciones.',
    },
    {
      type: 'match_banner',
      label: 'Banner en Detalle del Partido',
      desc: 'Alta visibilidad durante convocatorias, alineaciones y resultados.',
    },
    {
      type: 'share_card',
      label: 'Tarjeta Compartible',
      desc: 'Presencia de marca al exportar y compartir tarjetas de partidos o equipos.',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Award size={22} color={theme.primary} />
              <Text style={[styles.title, { color: theme.text }]}>
                Pedir Espacio Publicitario
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {isLoadingContext ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Cargando ligas, torneos y equipos...
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Target Type Selector: League | Tournament | Team */}
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                1. ¿Dónde deseas pautar? (Exactamente uno)
              </Text>
              <View style={styles.targetTypeRow}>
                <TouchableOpacity
                  onPress={() => setTargetType('league')}
                  style={[
                    styles.targetTab,
                    targetType === 'league' && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Layers
                    size={16}
                    color={targetType === 'league' ? '#001A2C' : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.targetTabText,
                      { color: targetType === 'league' ? '#001A2C' : theme.text },
                    ]}
                  >
                    Liga
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setTargetType('tournament')}
                  style={[
                    styles.targetTab,
                    targetType === 'tournament' && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Trophy
                    size={16}
                    color={targetType === 'tournament' ? '#001A2C' : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.targetTabText,
                      { color: targetType === 'tournament' ? '#001A2C' : theme.text },
                    ]}
                  >
                    Torneo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setTargetType('team')}
                  style={[
                    styles.targetTab,
                    targetType === 'team' && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Shield
                    size={16}
                    color={targetType === 'team' ? '#001A2C' : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.targetTabText,
                      { color: targetType === 'team' ? '#001A2C' : theme.text },
                    ]}
                  >
                    Equipo
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Target Picker List */}
              <View style={styles.selectorContainer}>
                {targetType === 'league' && (
                  <View>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                      Selecciona la Liga:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                      {leaguesList.map((item) => {
                        const isSelected = selectedLeagueId === item.id;
                        return (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => setSelectedLeagueId(item.id)}
                            style={[
                              styles.chip,
                              isSelected && {
                                backgroundColor: theme.primary + '20',
                                borderColor: theme.primary,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                isSelected && { color: theme.primary, fontWeight: '700' },
                              ]}
                            >
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {targetType === 'tournament' && (
                  <View>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                      Selecciona el Torneo:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                      {tournamentsList.map((item) => {
                        const isSelected = selectedTournamentId === item.id;
                        return (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => setSelectedTournamentId(item.id)}
                            style={[
                              styles.chip,
                              isSelected && {
                                backgroundColor: theme.primary + '20',
                                borderColor: theme.primary,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                isSelected && { color: theme.primary, fontWeight: '700' },
                              ]}
                            >
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {targetType === 'team' && (
                  <View>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                      Selecciona el Equipo:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                      {teamsList.map((item) => {
                        const isSelected = selectedTeamId === item.id;
                        return (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => setSelectedTeamId(item.id)}
                            style={[
                              styles.chip,
                              isSelected && {
                                backgroundColor: theme.primary + '20',
                                borderColor: theme.primary,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                isSelected && { color: theme.primary, fontWeight: '700' },
                              ]}
                            >
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* sponsors_enabled verification banner */}
              {isSponsorsDisabled && (
                <View style={styles.warningBanner}>
                  <AlertTriangle size={18} color="#EF4444" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.warningTitle}>Patrocinios no disponibles</Text>
                    <Text style={styles.warningDesc}>
                      La liga dueña ({governingLeague?.name}) tiene desactivada la opción de patrocinadores (sponsors_enabled = false).
                    </Text>
                  </View>
                </View>
              )}

              {/* 2. Placement Type */}
              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>
                2. Tipo de Espacio Publicitario
              </Text>
              <View style={styles.typesColumn}>
                {PLACEMENT_TYPES.map((pt) => {
                  const isSelected = placementType === pt.type;
                  return (
                    <TouchableOpacity
                      key={pt.type}
                      onPress={() => setPlacementType(pt.type)}
                      style={[
                        styles.typeCard,
                        isSelected && {
                          borderColor: theme.primary,
                          backgroundColor: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(56, 189, 248, 0.05)',
                        },
                      ]}
                    >
                      <View style={styles.typeHeader}>
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && { borderColor: theme.primary },
                          ]}
                        >
                          {isSelected && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                        </View>
                        <Text style={[styles.typeLabel, { color: theme.text }]}>
                          {pt.label}
                        </Text>
                      </View>
                      <Text style={[styles.typeDesc, { color: theme.textSecondary }]}>
                        {pt.desc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 3. Duration */}
              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>
                3. Duración del Contrato
              </Text>
              <View style={styles.durationRow}>
                {[30, 60, 90, 180].map((days) => {
                  const active = durationDays === days;
                  return (
                    <TouchableOpacity
                      key={days}
                      onPress={() => setDurationDays(days)}
                      style={[
                        styles.durationBtn,
                        active && { backgroundColor: theme.primary, borderColor: theme.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.durationText,
                          { color: active ? '#001A2C' : theme.text },
                        ]}
                      >
                        {days} días
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 4. Creative Details */}
              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>
                4. Detalles de la Publicidad (Opcional)
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Título Promocional o Eslogan
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                  placeholder="Ej: Gatorade - Hidratación Oficial"
                  placeholderTextColor={theme.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  URL de Imagen / Banner
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                  placeholder="https://..."
                  placeholderTextColor={theme.textSecondary}
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  URL de Redirección al Tocar (Click)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                  placeholder="https://marca.com/promo"
                  placeholderTextColor={theme.textSecondary}
                  value={redirectUrl}
                  onChangeText={setRedirectUrl}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: theme.primary },
                  isSponsorsDisabled && { opacity: 0.5 },
                ]}
                onPress={handleSubmit}
                disabled={createMutation.isPending || isSponsorsDisabled}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator size="small" color="#001A2C" />
                ) : (
                  <Text style={styles.submitBtnText}>Confirmar y Pedir Espacio</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end',
    },
    card: {
      maxHeight: '90%',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 30,
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
    loadingContainer: {
      padding: 50,
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 13,
      fontWeight: '600',
    },
    scrollContent: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 10,
      letterSpacing: 0.2,
    },
    targetTypeRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 14,
    },
    targetTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    },
    targetTabText: {
      fontSize: 13,
      fontWeight: '700',
    },
    selectorContainer: {
      marginBottom: 14,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 6,
    },
    chipScroll: {
      flexDirection: 'row',
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      marginRight: 8,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.3)',
      padding: 12,
      borderRadius: 12,
      marginBottom: 14,
    },
    warningTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: '#EF4444',
    },
    warningDesc: {
      fontSize: 11,
      color: '#EF4444',
      marginTop: 2,
    },
    typesColumn: {
      gap: 10,
      marginBottom: 14,
    },
    typeCard: {
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    typeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 4,
    },
    radioCircle: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    typeLabel: {
      fontSize: 13,
      fontWeight: '700',
    },
    typeDesc: {
      fontSize: 11,
      lineHeight: 16,
      marginLeft: 28,
    },
    durationRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
    },
    durationBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
      alignItems: 'center',
    },
    durationText: {
      fontSize: 12,
      fontWeight: '700',
    },
    inputGroup: {
      marginBottom: 12,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 6,
    },
    input: {
      height: 44,
      borderRadius: 10,
      paddingHorizontal: 12,
      fontSize: 13,
    },
    submitBtn: {
      height: 50,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    submitBtnText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#001A2C',
    },
  });
