import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { LayoutHeader } from "@/components/ui/layout/LayoutHeader";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useTheme } from "@/context/ThemeContext";
import { Skeleton } from "@/components/ui/feedback/Skeleton";
import { useAuthStore } from "@/features/auth/store/authStore";
import { User as UserType } from "@/features/auth/types/auth";
import {
  PlayerAchievement,
  PlayerCard,
  PlayerStats,
} from "@/features/players/types/player";
import { LANGUAGE_KEY } from "@/i18n";
import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { useCelebrationStore } from "@/features/notifications/store/celebrationStore";
import { UltimateCard } from "@/components/players/profile/UltimateCard";
import {
  Award,
  ChevronRight,
  Shield,
  Star,
  User,
} from "lucide-react-native";
import { NotificationPreferencesModal } from "@/components/notifications/NotificationPreferencesModal";
import { AchievementsModal } from "@/components/achievements/AchievementsModal";
import { ProfileSettingsMenu } from "@/components/profile/ProfileSettingsMenu";
import { ProfileLanguageModal } from "@/components/profile/ProfileLanguageModal";
import { PrivacySecurityModal } from "@/components/profile/PrivacySecurityModal";
import { AppSettingsModal } from "@/components/profile/AppSettingsModal";
import { ProfileRoleBadge } from "@/components/profile/ProfileRoleBadge";
import { SponsorProfileView } from "@/components/profile/SponsorProfileView";
import { RefereeProfileView } from "@/components/profile/RefereeProfileView";
import { SpectatorProfileView } from "@/components/profile/SpectatorProfileView";
import { UserProfileRole } from "@/features/auth/types/auth";
import { getUserAvailableRoles, getDefaultUserRole } from "@/features/auth/utils/profileRoles";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  useWindowDimensions,
  Image,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const PERFORMANCE_DATA = [
  { height: 5, active: false },
  { height: 5, active: false },
  { height: 5, active: false },
  { height: 5, active: false },
  { height: 5, active: false },
  { height: 5, active: false },
  { height: 5, active: false },
  { height: 5, active: false },
  { height: 5, active: false },
];

const MATCHES: any[] = [];

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const signOut = useAuthStore((state) => state.signOut);
  const { height: screenHeight } = useWindowDimensions();
  // 480 en el baseline de diseño (812pt de alto) y hacia abajo; se achica
  // proporcionalmente solo en pantallas más bajas que ese baseline (ej. iPhone SE).
  const heroHeight = Math.min(480, Math.max(360, screenHeight * (480 / 812)));
  const styles = createStyles(theme, isDark);
  const { id, userId, openAchievements } = useLocalSearchParams<{
    id?: string;
    userId?: string;
    openAchievements?: string;
  }>();

  const [profile, setProfile] = useState<any | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [card, setCard] = useState<PlayerCard | null>(null);
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showNotificationPrefsModal, setShowNotificationPrefsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAppSettingsModal, setShowAppSettingsModal] = useState(false);

  const currentLanguage = i18n.language;

  const handleLanguageSelect = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    setShowLangModal(false);
  };

  const user = useAuthStore((state) => state.user);
  const availableRoles = getUserAvailableRoles(profile || user);
  // Derivado en vez de sincronizado con un effect: si el rol elegido no está
  // disponible (o aún no se eligió), se usa el principal. Así no se pinta
  // primero la vista de jugador y luego salta a la del rol real.
  const [chosenRole, setSelectedRole] = useState<UserProfileRole | null>(null);
  const selectedRole: UserProfileRole =
    chosenRole && availableRoles.includes(chosenRole)
      ? chosenRole
      : availableRoles[0] || 'player';

  const isOwnProfile = !id || id === user?.id || id === user?.player_profile?.id;
  const activePhoto =
    profile?.player_profile?.photo ||
    profile?.photo ||
    (isOwnProfile ? user?.photo : undefined);

  // Qué perfil está cargado y cuándo: el skeleton solo se muestra la primera
  // vez (o al cambiar de perfil); volver al tab refresca en segundo plano.
  const loadedKeyRef = useRef<string | null>(null);
  const lastFetchAtRef = useRef(0);
  const profileKey = id ? `player:${id}` : userId ? `user:${userId}` : "me";

  const fetchData = useCallback(async (isRefresh = false) => {
    const hasDataForThisProfile = loadedKeyRef.current === profileKey;
    if (isRefresh) {
      setIsRefreshing(true);
    } else if (!hasDataForThisProfile) {
      setIsLoading(true);
    }
    lastFetchAtRef.current = Date.now();
    try {
      let activePlayerId = id;

      if (id) {
        // Fetch specific player by player ID
        const playerRes = await api.get<any>(`/v1/players/${id}/`);
        setProfile(playerRes);
        activePlayerId = playerRes.id || id;
      } else if (userId) {
        // Fetch specific player by user ID
        const playersRes = await api.get<any>(`/v1/players/?user=${userId}`);
        const playerProfile = playersRes.results?.[0];
        if (playerProfile) {
          setProfile(playerProfile);
          activePlayerId = playerProfile.id;
        } else {
          // If no player profile exists yet, fallback to user? (Ideally shouldn't happen)
          setProfile(null);
          activePlayerId = undefined;
        }
      } else {
        // Fetch current user
        const userRes = await api.get<any>("/v1/me/");
        setProfile(userRes);
        activePlayerId = userRes.player_profile?.id || undefined;
        // Solo si cambió: hay ~20 componentes suscritos a `user` y un objeto
        // nuevo en cada visita los re-renderiza a todos.
        const currentUser = useAuthStore.getState().user;
        if (JSON.stringify(currentUser) !== JSON.stringify(userRes)) {
          useAuthStore.setState({ user: userRes });
        }
      }

      // Stats, logros y card son independientes: pedirlos en paralelo (antes
      // iban en cascada) y aplicar los tres resultados en un solo render.
      if (activePlayerId) {
        const [statsResult, achResult, cardResult] = await Promise.allSettled([
          api.get<any>(`/v1/player-stats/?player=${activePlayerId}`, { silent: true }),
          api.get<any>(`/v1/player-achievements/?player=${activePlayerId}`, { silent: true }),
          api.get<any>(
            `/v1/player-cards/?player=${activePlayerId}&is_active=true`,
            { silent: true },
          ),
        ]);

        const warnUnlessNotFound = (label: string, reason: any) => {
          if (reason?.status !== 404) console.warn(`${label} fetch issue:`, reason);
        };

        if (statsResult.status === "fulfilled") {
          const statsRes = statsResult.value;
          setStats(
            Array.isArray(statsRes)
              ? statsRes[0]
              : statsRes?.results?.[0] || statsRes,
          );
        } else {
          warnUnlessNotFound("Player stats", statsResult.reason);
          setStats(null);
        }

        if (achResult.status === "fulfilled") {
          const achRes = achResult.value;
          setAchievements(Array.isArray(achRes) ? achRes : achRes?.results || []);
        } else {
          warnUnlessNotFound("Achievements", achResult.reason);
        }

        if (cardResult.status === "fulfilled") {
          const cardRes = cardResult.value;
          setCard(Array.isArray(cardRes) ? cardRes[0] : cardRes?.results?.[0] || cardRes);
        } else {
          warnUnlessNotFound("Card", cardResult.reason);
          setCard(null);
        }
      }
      loadedKeyRef.current = profileKey;
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id, userId, profileKey]);

  // Logro nuevo / cambio de overall mientras el perfil propio está montado:
  // refrescar desde los endpoints normales (esta pantalla no usa TanStack Query).
  useEffect(() => {
    if (!isOwnProfile) return;
    return useCelebrationStore.subscribe((state, prev) => {
      if (state.lastEventAt !== prev.lastEventAt) fetchData(true);
    });
  }, [isOwnProfile, fetchData]);

  useFocusEffect(
    React.useCallback(() => {
      // Evitar refetch si se acaba de cargar este mismo perfil (ir y volver
      // rápido entre tabs). Pull-to-refresh y los eventos siguen forzándolo.
      const isFresh =
        loadedKeyRef.current === profileKey &&
        Date.now() - lastFetchAtRef.current < 15000;
      if (!isFresh) fetchData();
    }, [fetchData, profileKey])
  );

  const getInitials = () => {
    if (!profile) return "??";
    const name = profile.player_profile?.full_name || profile.full_name;
    if (name) {
      const parts = name.trim().split(" ");
      return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
    }
    const first = profile.first_name?.[0] || "";
    const last = profile.last_name?.[0] || "";
    if (first || last) return (first + last).toUpperCase();
    return (profile.username?.[0] || "?").toUpperCase();
  };

  const fullName = profile
    ? profile.player_profile?.full_name ||
      profile.full_name ||
      `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
      profile.username ||
      "Usuario"
    : "Cargando...";
  const initials = getInitials();

  if (hasError) {
    return (
      <View style={GlobalStyles.container}>
        <BackgroundGradient />
        <SafeAreaView
          style={[
            GlobalStyles.safeArea,
            { justifyContent: "center", alignItems: "center", gap: 16 },
          ]}
        >
          <User size={56} color={theme.textSecondary} opacity={0.4} />
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: "800" }}>
            {t("errors.profile_title")}
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 13,
              textAlign: "center",
              paddingHorizontal: 40,
            }}
          >
            {t("errors.profile_subtitle")}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
              fetchData();
            }}
            style={{
              backgroundColor: theme.primary,
              paddingHorizontal: 28,
              paddingVertical: 14,
              borderRadius: 16,
              marginTop: 8,
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 14 }}>
              {t("errors.retry")}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <LayoutHeader />

      <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchData(true)}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        >
          <View style={styles.webContainer}>
            {/* Account Type Badge & Multi-Role Selector */}
            <ProfileRoleBadge
              currentRole={selectedRole}
              availableRoles={availableRoles}
              onSelectRole={(role) => setSelectedRole(role)}
              isStaff={Boolean(profile?.is_staff || user?.is_staff)}
            />

            {/* DYNAMIC ROLE VIEWS */}
            {selectedRole === "sponsor" && (profile?.sponsor_profile || user?.sponsor_profile) ? (
              <SponsorProfileView
                sponsor={profile?.sponsor_profile || user?.sponsor_profile}
                userEmail={profile?.email || user?.email}
                userPhone={profile?.phone || user?.phone}
                memberships={profile?.memberships || user?.memberships}
              />
            ) : selectedRole === "referee" && (profile?.referee_profile || user?.referee_profile) ? (
              <RefereeProfileView
                referee={profile?.referee_profile || user?.referee_profile}
                fullName={fullName}
                memberships={profile?.memberships || user?.memberships}
              />
            ) : selectedRole === "spectator" && (profile?.spectator_profile || user?.spectator_profile) ? (
              <SpectatorProfileView
                spectator={profile?.spectator_profile || user?.spectator_profile}
                fullName={fullName}
                username={profile?.username || user?.username || ""}
                favorites={profile?.favorites || user?.favorites}
              />
            ) : (
              <>
                {/* Player Hero Section with Ultimate Card */}
                <View style={[styles.heroSection, { height: heroHeight }]}>
              {isLoading ? (
                <Skeleton
                  width="100%"
                  height="100%"
                  borderRadius={0}
                  style={styles.heroImage}
                />
              ) : (
                <>
                  {activePhoto ? (
                    <Image
                      source={{ uri: activePhoto }}
                      style={[styles.heroImage, { opacity: 0.3 }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.heroImage, styles.initialsContainer]}>
                      <Text style={styles.initialsText}>{initials}</Text>
                    </View>
                  )}
                  <LinearGradient
                    colors={[
                      "transparent",
                      isDark
                        ? "rgba(10, 25, 47, 0.95)"
                        : "rgba(255, 255, 255, 0.95)",
                    ]}
                    style={styles.heroGradient}
                  />
                  <View style={styles.heroContent}>
                    <UltimateCard
                      name={fullName}
                      card={card}
                      photoUrl={activePhoto}
                    />

                    <View style={styles.infoRow}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>
                          {t("profile.position")}
                        </Text>
                        <Text style={styles.infoValue}>
                          {profile?.position || "--"}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>
                          {t("profile.dorsal")}
                        </Text>
                        <Text style={styles.infoValue}>--</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>
                          {t("profile.height")}
                        </Text>
                        <Text style={styles.infoValue}>--</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Core Stats */}
            <View style={styles.kpiRow}>
              <KPIBox
                label={t("profile.goals")}
                value={stats?.goals?.toString() || "0"}
                theme={theme}
                isDark={isDark}
              />
              <KPIBox
                label={t("profile.assists")}
                value={stats?.assists?.toString() || "0"}
                theme={theme}
                isDark={isDark}
              />
              <KPIBox
                label={t("profile.matches")}
                value={stats?.matches_played?.toString() || "0"}
                theme={theme}
                isDark={isDark}
              />
            </View>

            {/* Current Team Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionOverline}>
                {t("profile.current_team")}
              </Text>
            </View>
            <View style={styles.teamCard}>
              <View style={styles.teamBrandBox}>
                <Shield size={24} color={theme.primary} />
              </View>
              <View style={styles.teamCoreInfo}>
                <Text style={styles.teamNameTitle}>
                  {profile?.player_teams?.[0]?.team_name || t("profile.no_team")}
                </Text>
                <Text style={styles.teamSubtitle}>
                  {profile?.player_teams?.[0]
                    ? t("profile.active_member")
                    : t("profile.no_team")}
                </Text>
              </View>
              {profile?.player_teams?.[0] && (
                <TouchableOpacity style={styles.viewTeamBtn}>
                  <Text style={styles.viewTeamBtnText}>
                    {t("profile.view_team")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Achievements Section */}
            {achievements.length > 0 && (
              <View style={styles.achievementsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionOverline}>
                    {t("profile.achievements")}
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.achievementsList}
                >
                  {achievements.map((ach) => (
                    <View key={ach.id} style={styles.achievementBadge}>
                      <View style={styles.achievementIconWrapper}>
                        {ach.image ? (
                          <Image
                            source={{ uri: ach.image }}
                            style={styles.achievementIcon}
                          />
                        ) : (
                          <Award size={32} color={theme.primary} />
                        )}
                      </View>
                      <Text style={styles.achievementTitle} numberOfLines={1}>
                        {ach.title}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Detailed Stats Summary */}
            <View style={styles.statsSummaryCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionOverline}>
                  ESTADÍSTICAS DE TEMPORADA
                </Text>
              </View>
              <View style={styles.statsDetailGrid}>
                <DetailStatBox
                  label="LIMPIAS"
                  value={stats?.clean_sheets?.toString() || "0"}
                  theme={theme}
                />
                <DetailStatBox
                  label="ROJAS"
                  value={stats?.red_cards?.toString() || "0"}
                  theme={theme}
                  color="#FF4B4B"
                />
                <DetailStatBox
                  label="AMARILLAS"
                  value={stats?.yellow_cards?.toString() || "0"}
                  theme={theme}
                  color="#FFD700"
                />
                <DetailStatBox
                  label="MVP"
                  value={stats?.mvp_count?.toString() || "0"}
                  theme={theme}
                  color={theme.primary}
                />
              </View>
            </View>

            {/* Performance Trend Chart */}
            <View style={styles.trendSection}>
              <View style={styles.trendHeader}>
                <View>
                  <Text style={styles.trendTitle}>{t("profile.trend")}</Text>
                  <Text style={styles.trendSubtitle}>
                    Calificación Promedio:{" "}
                    <Text style={{ color: theme.primary }}>0.0</Text>
                  </Text>
                </View>
                <Text style={styles.lastGamesText}>SIN DATOS</Text>
              </View>

              <View style={styles.chartContainer}>
                {PERFORMANCE_DATA.map((bar, i) => (
                  <View
                    key={i}
                    style={[
                      styles.chartBar,
                      {
                        height: bar.height,
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.05)",
                      },
                      bar.active && { backgroundColor: theme.primary },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Recent Matches */}
            <Text style={styles.mainSectionTitle}>
              {t("profile.recent_matches")}
            </Text>
            {MATCHES.length > 0 ? (
              MATCHES.map((match) => (
                <TouchableOpacity key={match.id} style={styles.matchCard}>
                  <View style={styles.matchDateColumn}>
                    <Text style={styles.matchDateMonth}>OCT</Text>
                    <Text style={styles.matchDateDay}>
                      {match.date.split(" ")[1]}
                    </Text>
                  </View>

                  <View style={styles.matchMainInfo}>
                    <View style={styles.matchTeamsRow}>
                      <View style={styles.teamsNameBox}>
                        <Text style={styles.matchTeamName}>
                          {match.winner ? "Real Metros FC" : match.opp}
                        </Text>
                        <Text style={styles.matchTeamName}>
                          {match.winner ? match.opp : "Real Metros FC"}
                        </Text>
                      </View>
                      <View style={styles.scoreBox}>
                        <Text style={styles.matchScore}>{match.score}</Text>
                      </View>
                    </View>
                    <View style={styles.matchSmallStats}>
                      <Star
                        size={12}
                        color={theme.primary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.smallStatsText}>{match.stats}</Text>
                    </View>
                  </View>

                  <View style={styles.ratingCircle}>
                    <Text style={styles.ratingText}>{match.rating}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyMatchesBox}>
                <Award
                  size={48}
                  color={theme.primary}
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.emptyMatchesText}>
                  {t("profile.no_recent_matches")}
                </Text>
              </View>
            )}
              </>
            )}

            {/* CONFIGURATION - Only visible on my profile */}
            {!id && (
              <ProfileSettingsMenu
                onOpenLanguage={() => setShowLangModal(true)}
                onOpenNotifications={() => setShowNotificationPrefsModal(true)}
                onOpenAchievements={() => setShowAchievementsModal(true)}
                onOpenPrivacy={() => setShowPrivacyModal(true)}
                onOpenAppSettings={() => setShowAppSettingsModal(true)}
              />
            )}
          </View>
        </ScrollView>

      {/* Language Selection Modal */}
      <ProfileLanguageModal
        visible={showLangModal}
        onClose={() => setShowLangModal(false)}
        onSelectLanguage={handleLanguageSelect}
      />

      <NotificationPreferencesModal
        visible={showNotificationPrefsModal}
        onClose={() => setShowNotificationPrefsModal(false)}
      />

      <AchievementsModal
        // `openAchievements=1` llega al tocar un push de `achievement_unlocked`.
        visible={showAchievementsModal || openAchievements === "1"}
        onClose={() => {
          setShowAchievementsModal(false);
          if (openAchievements) router.setParams({ openAchievements: undefined });
        }}
        userId={profile?.id || user?.id}
        userName={fullName}
      />

      <PrivacySecurityModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onOpenNotifications={() => setShowNotificationPrefsModal(true)}
      />

      <AppSettingsModal
        visible={showAppSettingsModal}
        onClose={() => setShowAppSettingsModal(false)}
        onOpenLanguage={() => setShowLangModal(true)}
      />
    </View>
  );
}

function KPIBox({
  label,
  value,
  theme,
  isDark,
}: {
  label: string;
  value: string;
  theme: any;
  isDark: boolean;
}) {
  const styles = createStyles(theme, isDark);
  return (
    <View style={styles.kpiBox}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  theme,
  isDark,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  theme: any;
  isDark: boolean;
  onPress?: () => void;
}) {
  const styles = createStyles(theme, isDark);
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.menuIconText}>
        {icon}
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <ChevronRight size={18} color={theme.textSecondary} />
    </TouchableOpacity>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: 150,
    },
    webContainer: {
      maxWidth: 800,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: 20,
    },
    heroSection: {
      width: "100%",
      borderRadius: 24,
      overflow: "hidden",
      marginTop: 10,
      marginBottom: 20,
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    heroGradient: {
      ...StyleSheet.absoluteFill,
    },
    heroContent: {
      position: "absolute",
      bottom: 20,
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 10,
    },
    initialsContainer: {
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    initialsText: {
      fontSize: 100,
      fontWeight: "900",
      color: "#000",
      letterSpacing: -5,
    },
    infoRow: {
      flexDirection: "row",
      marginTop: 30,
      gap: 30,
    },
    infoItem: {
      alignItems: "flex-start",
    },
    infoLabel: {
      fontSize: 9,
      fontWeight: "700",
      color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: "800",
      color: isDark ? "#FFF" : theme.text,
    },
    kpiRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 25,
    },
    kpiBox: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      elevation: isDark ? 0 : 2,
    },
    kpiValue: {
      fontSize: 32,
      fontWeight: "900",
      color: theme.text,
    },
    kpiLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.textSecondary,
      marginTop: 4,
      letterSpacing: 0.5,
    },
    sectionHeader: {
      marginBottom: 15,
    },
    sectionOverline: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 12,
    },
    teamCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      elevation: isDark ? 0 : 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 10,
    },
    teamBrandBox: {
      width: 50,
      height: 50,
      borderRadius: 12,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 15,
    },
    teamCoreInfo: {
      flex: 1,
    },
    teamNameTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.text,
    },
    teamSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    viewTeamBtn: {
      marginTop: 20,
      width: "100%",
      height: 50,
      borderRadius: 12,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
    },
    viewTeamBtnText: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.text,
    },
    trendSection: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      elevation: isDark ? 0 : 3,
    },
    trendHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 30,
    },
    trendTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.text,
    },
    trendSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },
    lastGamesText: {
      fontSize: 10,
      fontWeight: "800",
      color: theme.textSecondary,
    },
    emptyMatchesBox: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 30,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      borderStyle: "dashed",
    },
    emptyMatchesText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
    },
    chartContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      height: 100,
      paddingHorizontal: 10,
    },
    chartBar: {
      width: 25,
      borderRadius: 4,
    },
    mainSectionTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 20,
    },
    matchCard: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 15,
      marginBottom: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      elevation: isDark ? 0 : 2,
    },
    matchDateColumn: {
      alignItems: "center",
      paddingRight: 15,
      borderRightWidth: 1,
      borderRightColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.05)",
      width: 60,
    },
    matchDateMonth: {
      fontSize: 10,
      fontWeight: "800",
      color: theme.textSecondary,
    },
    matchDateDay: {
      fontSize: 24,
      fontWeight: "900",
      color: theme.text,
    },
    matchMainInfo: {
      flex: 1,
      paddingLeft: 15,
    },
    matchTeamsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    teamsNameBox: {
      flex: 1,
    },
    matchTeamName: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.text,
    },
    scoreBox: {
      paddingHorizontal: 10,
    },
    matchScore: {
      fontSize: 22,
      fontWeight: "900",
      color: theme.primary,
      fontStyle: "italic",
    },
    matchSmallStats: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    smallStatsText: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.textSecondary,
    },
    ratingCircle: {
      width: 48,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primary + "1A",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.primary + "4D",
    },
    ratingText: {
      fontSize: 13,
      fontWeight: "900",
      color: theme.primary,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surface,
      padding: 18,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      elevation: isDark ? 0 : 2,
    },
    menuIconText: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },
    menuLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginTop: 10,
      marginBottom: 20,
      padding: 15,
    },
    logoutText: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.error,
      letterSpacing: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 40,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 20,
      textAlign: "center",
    },
    langOption: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 10,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      alignItems: "center",
    },
    langOptionSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + "1A", // 10% opacity
    },
    langOptionText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    langOptionTextSelected: {
      color: theme.primary,
      fontWeight: "800",
    },
    achievementsSection: {
      marginBottom: 30,
    },
    achievementsList: {
      paddingRight: 20,
      gap: 15,
    },
    achievementBadge: {
      alignItems: "center",
      width: 80,
    },
    achievementIconWrapper: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      marginBottom: 8,
      elevation: 2,
    },
    achievementIcon: {
      width: 40,
      height: 40,
      resizeMode: "contain",
    },
    achievementTitle: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.textSecondary,
      textAlign: "center",
    },
    statsSummaryCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
    },
    statsDetailGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
    },
    detailStatItem: {
      flex: 1,
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      paddingVertical: 12,
      borderRadius: 12,
    },
    detailStatValue: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.text,
    },
    detailStatLabel: {
      fontSize: 8,
      fontWeight: "800",
      color: theme.textSecondary,
      marginTop: 2,
    },
  });

function DetailStatBox({
  label,
  value,
  theme,
  color,
}: {
  label: string;
  value: string;
  theme: any;
  color?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: theme.isDark
          ? "rgba(255,255,255,0.03)"
          : "rgba(0,0,0,0.02)",
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: color ? 1 : 0,
        borderColor: color ? color + "40" : "transparent",
      }}
    >
      <Text
        style={[
          { fontSize: 18, fontWeight: "900", color: theme.text },
          color && { color },
        ]}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 8,
          fontWeight: "800",
          color: theme.textSecondary,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
