import { BackgroundGradient } from "@/components/BackgroundGradient";
import { LayoutHeader } from "@/components/LayoutHeader";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { CreatePlayerModal } from "@/components/players/CreatePlayerModal";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { Match, PaginatedMatches } from "@/types/match";
import { PaginatedPlayers, Player } from "@/types/player";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowUpRight,
  Bell,
  Calendar,
  Plus,
  TrendingUp,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [isPlayersLoading, setIsPlayersLoading] = useState(true);
  const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);

  useEffect(() => {
    loadPlayers();
    loadNextMatch();
  }, []);

  const loadPlayers = async () => {
    try {
      const res = await api.get<PaginatedPlayers>("/v1/players/");
      setPlayers(res.results);
    } catch (err) {
      console.error("Error loading players:", err);
    } finally {
      setIsPlayersLoading(false);
    }
  };

  const loadNextMatch = async () => {
    try {
      const res = await api.get<PaginatedMatches>(
        "/v1/matches/?status=scheduled&ordering=start_datetime&limit=1",
      );
      if (res.results.length > 0) {
        setNextMatch(res.results[0]);
      }
    } catch (err) {
      console.error("Error loading next match:", err);
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <SafeAreaView style={GlobalStyles.safeArea}>
        <LayoutHeader />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.webContainer}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionOverline}>RESUMEN SEMANAL</Text>
                <Text
                  style={[GlobalStyles.sectionTitle, { color: theme.text }]}
                >
                  MIS EQUIPOS
                </Text>
              </View>
              <TouchableOpacity style={styles.bellButton}>
                <Bell size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>

            {/* Featured Match Card */}
            <View style={styles.featuredCard}>
              <LinearGradient
                colors={
                  isDark ? [theme.surface, "#0A1525"] : ["#FFFFFF", "#F3F4F6"]
                }
                style={styles.cardGradient}
              >
                <View style={styles.userHighlight} />

                {nextMatch ? (
                  <>
                    <View style={styles.cardHeader}>
                      <View style={styles.leagueTag}>
                        <Text style={styles.leagueTagText}>
                          {nextMatch.tournament_name.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.matchTime}>
                        {new Date(nextMatch.start_datetime)
                          .toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })
                          .toUpperCase()}{" "}
                        •{" "}
                        {new Date(nextMatch.start_datetime).toLocaleTimeString(
                          "es-ES",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </Text>
                    </View>

                    <Text style={styles.matchdayText}>
                      {nextMatch.status === "ongoing"
                        ? "En Vivo"
                        : "Próximo Partido"}
                    </Text>
                    <Text style={styles.matchPhase}>Temporada Regular</Text>

                    <View style={styles.matchTeams}>
                      <View style={styles.team}>
                        <View
                          style={[
                            styles.teamBadgePlaceholder,
                            { backgroundColor: theme.primary + "10" },
                          ]}
                        />
                        <Text style={styles.teamName}>
                          {nextMatch.home_team_name}
                        </Text>
                      </View>
                      <Text style={styles.vsText}>VS</Text>
                      <View style={styles.team}>
                        <View
                          style={[
                            styles.teamBadgePlaceholder,
                            { backgroundColor: theme.primary + "10" },
                          ]}
                        />
                        <Text style={styles.teamName}>
                          {nextMatch.away_team_name}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.matchFooter}>
                      <View style={styles.locationContainer}>
                        <Text style={styles.locationText}>
                          📍 {nextMatch.venue_name || "Sede por definir"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.viewDetailsButton}
                        onPress={() =>
                          router.push({
                            pathname: "/tournament-detail",
                            params: { id: nextMatch.tournament },
                          })
                        }
                      >
                        <Text style={styles.viewDetailsText}>VER DETALLES</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyFeaturedCard}>
                    <Calendar
                      size={32}
                      color={theme.textSecondary}
                      opacity={0.3}
                    />
                    <Text style={styles.emptyFeaturedTitle}>
                      NO HAY PARTIDOS PRÓXIMOS
                    </Text>
                    <Text style={styles.emptyFeaturedSubtitle}>
                      Los encuentros aparecerán aquí cuando la liga anuncie la
                      nueva jornada.
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Stats Summary Area */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>VICTORIAS</Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>94%</Text>
                  <TrendingUp size={16} color={theme.primary} />
                </View>
                <View style={styles.statBarContainer}>
                  <View style={[styles.statBar, { width: "94%" }]} />
                </View>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>GOLES / PARTIDO</Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>2.2</Text>
                  <TrendingUp size={16} color={theme.primary} />
                </View>
                <View style={styles.statBarContainer}>
                  <View style={[styles.statBar, { width: "70%" }]} />
                </View>
              </View>
            </View>

            {/* Promotional Banner */}
            <TouchableOpacity style={styles.bannerCard}>
              <LinearGradient
                colors={["#004E92", "#000428"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bannerGradient}
              >
                <View>
                  <Text style={styles.bannerOverline}>
                    LIGA DE INVIERNO 2024
                  </Text>
                  <Text style={styles.bannerTitle}>El Camino a la Gloria</Text>
                  <Text style={styles.bannerSubtitle}>
                    Inscripciones abiertas ahora.
                  </Text>
                </View>
                <View style={styles.bannerArrow}>
                  <ArrowUpRight size={20} color="#FFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Players List Section */}
            <View style={styles.sectionHeader}>
              <Text style={[GlobalStyles.sectionTitle, { color: theme.text }]}>
                JUGADORES
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => setIsPlayerModalVisible(true)}
                  style={styles.actionIcon}
                >
                  <Plus size={20} color={theme.primary} />
                </TouchableOpacity>
                {players.length > 0 && (
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>VER TODOS</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {isPlayersLoading ? (
              <ActivityIndicator
                color={theme.primary}
                style={{ marginLeft: 20, marginTop: 20 }}
              />
            ) : players.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No se encontraron jugadores
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.playersScrollContent}
              >
                {players.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() =>
                      router.push({
                        pathname: "/profile",
                        params: { id: item.id },
                      })
                    }
                  >
                    <PlayerAvatar player={item} theme={theme} isDark={isDark} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* MODAL DE CREACIÓN DE JUGADOR */}
      <CreatePlayerModal
        visible={isPlayerModalVisible}
        onClose={() => setIsPlayerModalVisible(false)}
        onSuccess={loadPlayers}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: 110,
    },
    emptyText: {
      fontSize: 12,
      marginLeft: 20,
      fontStyle: "italic",
    },
    webContainer: {
      maxWidth: 800,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: 20,
    },
    userHighlight: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: theme.primary,
      zIndex: 10,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 20,
      marginBottom: 15,
    },
    sectionOverline: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    bellButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(0, 245, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      justifyContent: "center",
      alignItems: "center",
    },
    featuredCard: {
      width: "100%",
      borderRadius: 24,
      overflow: "hidden",
      marginBottom: 25,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.08)",
      elevation: isDark ? 0 : 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.18,
      shadowRadius: 12,
    },
    cardGradient: {
      padding: 20,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    leagueTag: {
      backgroundColor: isDark ? "rgba(0, 245, 255, 0.2)" : theme.primary + "26", // opacity 0.15
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    leagueTagText: {
      fontSize: 9,
      fontWeight: "800",
      color: theme.primary,
      letterSpacing: 0.5,
    },
    matchTime: {
      fontSize: 10,
      color: theme.textSecondary,
      fontWeight: "600",
    },
    matchdayText: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.text,
    },
    matchPhase: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 20,
    },
    matchTeams: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 25,
    },
    team: {
      alignItems: "center",
      width: "40%",
    },
    teamBadgePlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      marginBottom: 8,
    },
    teamName: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
      textAlign: "center",
    },
    vsText: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.textSecondary,
    },
    matchFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.05)",
      paddingTop: 15,
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    locationText: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    viewDetailsButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.03)",
    },
    viewDetailsText: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.text,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 25,
    },
    statBox: {
      width: (width - 55) / 2,
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 15,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.08)",
      elevation: isDark ? 0 : 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.12,
      shadowRadius: 8,
    },
    statLabel: {
      fontSize: 9,
      fontWeight: "700",
      color: theme.textSecondary,
      marginBottom: 5,
    },
    statValueContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.text,
    },
    statBarContainer: {
      height: 4,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      borderRadius: 2,
      overflow: "hidden",
    },
    statBar: {
      height: "100%",
      backgroundColor: theme.primary,
    },
    bannerCard: {
      width: "100%",
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 25,
    },
    bannerGradient: {
      padding: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    bannerOverline: {
      fontSize: 9,
      fontWeight: "800",
      color: "rgba(255, 255, 255, 0.7)",
      marginBottom: 4,
    },
    bannerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#FFF",
    },
    bannerSubtitle: {
      fontSize: 12,
      color: "rgba(255, 255, 255, 0.6)",
    },
    bannerArrow: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    seeAllText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.primary,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },
    actionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
    },
    playersScrollContent: {
      paddingRight: 20,
      marginBottom: 20,
    },
    playerContainer: {
      alignItems: "center",
      marginRight: 20,
    },
    avatarBorder: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: isDark ? "rgba(0, 245, 255, 0.3)" : theme.primary + "4D", // opacity 0.3
      padding: 3,
      marginBottom: 8,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: 29,
    },
    playerName: {
      fontSize: 11,
      fontWeight: "500",
    },
    emptyFeaturedCard: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 30,
      gap: 12,
    },
    emptyFeaturedTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.text,
      letterSpacing: 1,
    },
    emptyFeaturedSubtitle: {
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: "center",
      paddingHorizontal: 20,
      lineHeight: 16,
    },
    playerSection: {
        marginTop: 10,
    }
  });
