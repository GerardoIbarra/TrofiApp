import { BackgroundGradient } from "@/components/BackgroundGradient";
import { LayoutHeader } from "@/components/LayoutHeader";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { User as UserType } from "@/types/auth";
import { PlayerStats } from "@/types/player";
import { LinearGradient } from "expo-linear-gradient";
import {
  Activity,
  Award,
  ChevronRight,
  LogOut,
  Moon,
  Settings,
  Shield,
  Star,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");

const PERFORMANCE_DATA = [
  { height: 40, active: false },
  { height: 60, active: false },
  { height: 75, active: false },
  { height: 50, active: false },
  { height: 80, active: true },
  { height: 45, active: false },
  { height: 70, active: false },
  { height: 78, active: false },
  { height: 85, active: true },
];

const MATCHES = [
  {
    id: "1",
    date: "OCT 24",
    opp: "Blue Hawks",
    score: "3 - 1",
    rating: "9.2",
    stats: "2 GOALS • 90'",
    winner: true,
  },
  {
    id: "2",
    date: "OCT 18",
    opp: "Strikers United",
    score: "0 - 0",
    rating: "7.1",
    stats: "0 ASSIST • 78'",
    winner: false,
  },
  {
    id: "3",
    date: "OCT 12",
    opp: "City Stars",
    score: "2 - 0",
    rating: "8.4",
    stats: "1 ASSIST • 90'",
    winner: true,
  },
];

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const signOut = useAuthStore((state) => state.signOut);
  const styles = createStyles(theme, isDark);
  const { id } = useLocalSearchParams<{ id: string }>();

  const [profile, setProfile] = useState<any | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      // Fetch Stats
      if (userId) {
        try {
          const statsRes = await api.get<PlayerStats>(
            `/v1/player-stats/${userId}/`,
          );
          setStats(statsRes);
        } catch (err) {
          console.warn("Player stats not found for this user/player", err);
          setStats(null);
        }
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (!profile) return "??";
    if (profile.full_name) {
      const parts = profile.full_name.split(' ');
      return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
    }
    const first = profile.first_name?.[0] || "";
    const last = profile.last_name?.[0] || "";
    return (first + last).toUpperCase();
  };

  const fullName = profile 
    ? (profile.full_name || `${profile.first_name} ${profile.last_name}`)
    : "Cargando...";
  const initials = getInitials();

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={GlobalStyles.safeArea} edges={["top"]}>
        <LayoutHeader title="PLAYER PROFILE" />

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
                    />

                    <View style={styles.infoRow}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>POSITION</Text>
                        <Text style={styles.infoValue}>Striker</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>JERSEY</Text>
                        <Text style={styles.infoValue}>#9</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>HEIGHT</Text>
                        <Text style={styles.infoValue}>188cm</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Core Stats */}
            <View style={styles.kpiRow}>
              <KPIBox
                label="GOALS"
                value={stats?.goals?.toString() || "0"}
                theme={theme}
                isDark={isDark}
              />
              <KPIBox
                label="ASSISTS"
                value={stats?.assists?.toString() || "0"}
                theme={theme}
                isDark={isDark}
              />
              <KPIBox
                label="MATCHES"
                value={stats?.matches_played?.toString() || "0"}
                theme={theme}
                isDark={isDark}
              />
            </View>

            {/* Current Team Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionOverline}>CURRENT TEAM</Text>
            </View>
            <View style={styles.teamCard}>
              <View style={styles.teamBrandBox}>
                <Activity size={24} color={theme.primary} />
              </View>
              <View style={styles.teamCoreInfo}>
                <Text style={styles.teamNameTitle}>Real Metros FC</Text>
                <Text style={styles.teamSubtitle}>Elite Division • Tier A</Text>
              </View>
              <TouchableOpacity style={styles.viewTeamBtn}>
                <Text style={styles.viewTeamBtnText}>VIEW TEAM PAGE</Text>
              </TouchableOpacity>
            </View>

            {/* Performance Trend Chart */}
            <View style={styles.trendSection}>
              <View style={styles.trendHeader}>
                <View>
                  <Text style={styles.trendTitle}>PERFORMANCE TREND</Text>
                  <Text style={styles.trendSubtitle}>
                    Avg. Match Rating:{" "}
                    <Text style={{ color: theme.primary }}>8.4</Text>
                  </Text>
                </View>
                <Text style={styles.lastGamesText}>LAST 10 GAMES</Text>
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
            <Text style={styles.mainSectionTitle}>RECENT MATCHES</Text>
            {MATCHES.map((match) => (
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
            ))}

            {/* CONFIGURATION */}
            <View style={[styles.sectionHeader, { marginTop: 40 }]}>
              <Text style={styles.mainSectionTitle}>CONFIGURACIÓN</Text>
            </View>

            {/* Theme Toggle Switch */}
            <View style={styles.menuItem}>
              <View style={styles.menuIconText}>
                <Moon size={20} color={theme.primary} />
                <Text style={styles.menuLabel}>Modo Oscuro</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: "#767577", true: theme.primary }}
                thumbColor={isDark ? "#FFF" : "#f4f3f4"}
              />
            </View>

            <MenuItem
              icon={<User size={20} color={theme.primary} />}
              label="Mi Cuenta"
              theme={theme}
              isDark={isDark}
            />
            <MenuItem
              icon={<Award size={20} color={theme.primary} />}
              label="Logros y Trofeos"
              theme={theme}
              isDark={isDark}
            />
            <MenuItem
              icon={<Shield size={20} color={theme.primary} />}
              label="Privacidad y Seguridad"
              theme={theme}
              isDark={isDark}
            />
            <MenuItem
              icon={<Settings size={20} color={theme.primary} />}
              label="Ajustes de la App"
              theme={theme}
              isDark={isDark}
            />

            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
              <LogOut size={20} color={theme.error} />
              <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
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
}: {
  theme: any;
  isDark: boolean;
  name: string;
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
          <Text style={styles.ratingNumber}>88</Text>
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
            <Text style={styles.statValue}>90</Text>
            <Text style={styles.statKey}>PAC</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>92</Text>
            <Text style={styles.statKey}>SHO</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>85</Text>
            <Text style={styles.statKey}>PAS</Text>
          </View>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.statsColumn}>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>88</Text>
            <Text style={styles.statKey}>DRI</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statKey}>DEF</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statValue}>82</Text>
            <Text style={styles.statKey}>PHY</Text>
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
}: {
  icon: React.ReactNode;
  label: string;
  theme: any;
  isDark: boolean;
}) {
  const styles = createStyles(theme, isDark);
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
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
      paddingBottom: 110,
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
      marginTop: 20,
      padding: 15,
    },
    logoutText: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.error,
      letterSpacing: 1,
    },
  });
