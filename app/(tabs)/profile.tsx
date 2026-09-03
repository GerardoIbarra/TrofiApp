import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { LayoutHeader } from "@/components/ui/layout/LayoutHeader";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useTheme } from "@/context/ThemeContext";
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
import { useLocalSearchParams, router } from "expo-router";
import {
  Award,
  ChevronRight,
  Globe,
  LogOut,
  Moon,
  Settings,
  Shield,
  Star,
  User,
  Lock,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

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
  const styles = createStyles(theme, isDark);
  const { id } = useLocalSearchParams<{ id: string }>();

  const [profile, setProfile] = useState<any | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [card, setCard] = useState<PlayerCard | null>(null);
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);

  const currentLanguage = i18n.language;

  const handleLanguageSelect = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    setShowLangModal(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let userId = id;

      if (id) {
        // Fetch specific player
        const playerRes = await api.get<any>(`/v1/players/${id}/`);
        setProfile(playerRes);
        // Note: In player-stats, the ID usually corresponds to the user or player.
        // If the ID passed is already the player ID, we use it directly.
        userId = playerRes.user || id;
      } else {
        // Fetch current user
        const userRes = await api.get<UserType>("/v1/me/");
        setProfile(userRes);
        userId = userRes.id;
      }

      // Fetch Stats, Achievements and Cards
      if (userId) {
        // 1. Stats
        try {
          const statsRes = await api.get<PlayerStats>(
            `/v1/player-stats/?player=${userId}`,
            { silent: true },
          );
          // Assuming the endpoint returns a list or we pick the first one if multiple
          setStats(
            Array.isArray(statsRes)
              ? statsRes[0]
              : (statsRes as any).results?.[0] || statsRes,
          );
        } catch (err: any) {
          if (err?.status !== 404)
            console.warn("Player stats fetch issue:", err);
          setStats(null);
        }

        // 2. Achievements
        try {
          const achRes = await api.get<any>(
            `/v1/player-achievements/?player=${userId}`,
            { silent: true },
          );
          setAchievements(
            Array.isArray(achRes) ? achRes : achRes.results || [],
          );
        } catch (err: any) {
          if (err?.status !== 404)
            console.warn("Achievements fetch issue:", err);
        }

        // 3. Active Card
        try {
          const cardRes = await api.get<any>(
            `/v1/player-cards/?player=${userId}&is_active=true`,
            { silent: true },
          );
          const activeCard = Array.isArray(cardRes)
            ? cardRes[0]
            : cardRes.results?.[0] || cardRes;
          setCard(activeCard);
        } catch (err: any) {
          if (err?.status !== 404) console.warn("Card fetch issue:", err);
          setCard(null);
        }
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (!profile) return "??";
    if (profile.full_name) {
      const parts = profile.full_name.split(" ");
      return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
    }
    const first = profile.first_name?.[0] || "";
    const last = profile.last_name?.[0] || "";
    return (first + last).toUpperCase();
  };

  const fullName = profile
    ? profile.full_name || `${profile.first_name} ${profile.last_name}`
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
      <SafeAreaView style={GlobalStyles.safeArea} edges={["top"]}>
        <LayoutHeader />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.webContainer}>
            {/* Player Hero Section with Ultimate Card */}
            <View style={styles.heroSection}>
              {isLoading ? (
                <View
                  style={[
                    styles.heroImage,
                    {
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: theme.surface,
                    },
                  ]}
                >
                  <ActivityIndicator size="large" color={theme.primary} />
                </View>
              ) : (
                <>
                  <View style={[styles.heroImage, styles.initialsContainer]}>
                    <Text style={styles.initialsText}>{initials}</Text>
                  </View>
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
                      theme={theme}
                      isDark={isDark}
                      name={fullName}
                      card={card}
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
                  {profile?.memberships?.[0]?.team_name || t("profile.no_team")}
                </Text>
                <Text style={styles.teamSubtitle}>
                  {profile?.memberships?.[0]
                    ? t("profile.active_member")
                    : t("profile.no_team")}
                </Text>
              </View>
              {profile?.memberships?.[0] && (
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

            {/* CONFIGURATION - Only visible on my profile */}
            {!id && (
              <>
                <View style={[styles.sectionHeader, { marginTop: 25 }]}>
                  <Text style={styles.mainSectionTitle}>
                    {t("profile.configuration")}
                  </Text>
                </View>

                {/* Theme Toggle Switch */}
                <View style={styles.menuItem}>
                  <View style={styles.menuIconText}>
                    <Moon size={20} color={theme.primary} />
                    <Text style={styles.menuLabel}>
                      {t("profile.dark_mode")}
                    </Text>
                  </View>
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: "#767577", true: theme.primary }}
                    thumbColor={isDark ? "#FFF" : "#f4f3f4"}
                  />
                </View>

                {/* Language Selector */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => setShowLangModal(true)}
                >
                  <View style={styles.menuIconText}>
                    <Globe size={20} color={theme.primary} />
                    <Text style={styles.menuLabel}>
                      {t("profile.language")}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text style={{ color: theme.primary, fontWeight: "700" }}>
                      {currentLanguage === "es" ? "Español" : "English"}
                    </Text>
                    <ChevronRight size={18} color={theme.textSecondary} />
                  </View>
                </TouchableOpacity>

                <MenuItem
                  icon={<User size={20} color={theme.primary} />}
                  label={t("profile.my_account")}
                  theme={theme}
                  isDark={isDark}
                  onPress={() => router.push('/(tabs)/edit-profile' as any)}
                />
                <MenuItem
                  icon={<Award size={20} color="#F59E0B" />}
                  label="Espacios Publicitarios (Sponsors)"
                  theme={theme}
                  isDark={isDark}
                  onPress={() => router.push('/sponsor-placements' as any)}
                />
                <MenuItem
                  icon={<Award size={20} color="#10B981" />}
                  label="Mercado de Árbitros"
                  theme={theme}
                  isDark={isDark}
                  onPress={() => router.push('/referee-marketplace' as any)}
                />
                <MenuItem
                  icon={<Award size={20} color={theme.primary} />}
                  label={t("profile.achievements")}
                  theme={theme}
                  isDark={isDark}
                />
                <MenuItem
                  icon={<Shield size={20} color={theme.primary} />}
                  label={t("profile.privacy")}
                  theme={theme}
                  isDark={isDark}
                />
                <MenuItem
                  icon={<Lock size={20} color={theme.primary} />}
                  label="Cambiar Contraseña"
                  theme={theme}
                  isDark={isDark}
                  onPress={() => router.push('/(tabs)/change-password' as any)}
                />
                <MenuItem
                  icon={<Settings size={20} color={theme.primary} />}
                  label={t("profile.app_settings")}
                  theme={theme}
                  isDark={isDark}
                />

                <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                  <LogOut size={20} color={theme.error} />
                  <Text style={styles.logoutText}>{t("profile.logout")}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLangModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLangModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLangModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("profile.language")}</Text>

            <TouchableOpacity
              style={[
                styles.langOption,
                currentLanguage === "es" && styles.langOptionSelected,
              ]}
              onPress={() => handleLanguageSelect("es")}
            >
              <Text
                style={[
                  styles.langOptionText,
                  currentLanguage === "es" && styles.langOptionTextSelected,
                ]}
              >
                Español
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langOption,
                currentLanguage === "en" && styles.langOptionSelected,
              ]}
              onPress={() => handleLanguageSelect("en")}
            >
              <Text
                style={[
                  styles.langOptionText,
                  currentLanguage === "en" && styles.langOptionTextSelected,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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

function UltimateCard({
  theme,
  isDark,
  name,
  card,
}: {
  theme: any;
  isDark: boolean;
  name: string;
  card: PlayerCard | null;
}) {
  const styles = createStyles(theme, isDark);
  return (
    <View style={styles.cardShield}>
      <LinearGradient
        colors={isDark ? ["#1A2B48", "#0A1525"] : ["#F8FAFC", "#E2E8F0"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Brush Stroke Effect */}
      <LinearGradient
        colors={["transparent", theme.primary + "22", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.cardHeader}>
        <View style={styles.ratingInfo}>
          <Text style={styles.ratingNumber}>{card?.overall || "--"}</Text>
          <Text style={styles.posLabel}>ST</Text>
          <View style={styles.flagPlaceholder} />
        </View>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?u=avatar2" }}
          style={styles.cardPlayerImage}
        />
      </View>

      <View style={styles.cardNameSection}>
        <Text style={styles.cardNameText}>{name.toUpperCase()}</Text>
        <View style={styles.nameDivider} />
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statsColumn}>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>{card?.pace || "--"}</Text>
            <Text style={styles.statKey}>RIT</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>{card?.shooting || "--"}</Text>
            <Text style={styles.statKey}>TIR</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>{card?.passing || "--"}</Text>
            <Text style={styles.statKey}>PAS</Text>
          </View>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.statsColumn}>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>{card?.dribbling || "--"}</Text>
            <Text style={styles.statKey}>REG</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>{card?.defense || "--"}</Text>
            <Text style={styles.statKey}>DEF</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>{card?.physical || "--"}</Text>
            <Text style={styles.statKey}>FIS</Text>
          </View>
        </View>
      </View>
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
      height: 480,
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
      ...StyleSheet.absoluteFillObject,
    },
    heroContent: {
      position: "absolute",
      bottom: 20,
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 10,
    },
    cardShield: {
      width: 200,
      height: 300,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: theme.primary,
      overflow: "hidden",
      backgroundColor: theme.surface,
      elevation: 20,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
    },
    cardHeader: {
      flexDirection: "row",
      height: 140,
      paddingTop: 20,
      paddingLeft: 15,
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
    ratingInfo: {
      alignItems: "center",
      width: 40,
    },
    ratingNumber: {
      fontSize: 32,
      fontWeight: "900",
      color: theme.text,
      lineHeight: 34,
    },
    posLabel: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.textSecondary,
      marginTop: -2,
    },
    flagPlaceholder: {
      width: 20,
      height: 12,
      backgroundColor: "#006847", // Mexico Green
      marginTop: 10,
      borderRadius: 2,
    },
    cardPlayerImage: {
      flex: 1,
      height: "110%",
      width: "100%",
      resizeMode: "contain",
      marginTop: -10,
    },
    cardNameSection: {
      alignItems: "center",
      paddingVertical: 5,
    },
    cardNameText: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.text,
      letterSpacing: 1,
    },
    nameDivider: {
      width: "80%",
      height: 1,
      backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
      marginTop: 4,
    },
    statsGrid: {
      flexDirection: "row",
      justifyContent: "center",
      paddingTop: 10,
      paddingHorizontal: 15,
    },
    statsColumn: {
      width: 60,
    },
    statsDivider: {
      width: 1,
      height: 45,
      backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
      marginHorizontal: 10,
    },
    statLine: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    statValue: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
    },
    statKey: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.textSecondary,
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
