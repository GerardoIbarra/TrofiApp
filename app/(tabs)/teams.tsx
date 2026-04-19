import { BackgroundGradient } from "@/components/BackgroundGradient";
import { LayoutHeader } from "@/components/LayoutHeader";
import { CreateTeamModal } from "@/components/teams/CreateTeamModal";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { Team, TeamsResponse } from "@/types/team";
import { AlertCircle, Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// Fallback logos for teams
const FALLBACK_LOGOS = [
  "https://images.pexels.com/photos/209637/pexels-photo-209637.jpeg?auto=compress&cs=tinysrgb&w=150",
  "https://images.pexels.com/photos/159515/football-gridiron-soccer-pitch-159515.jpeg?auto=compress&cs=tinysrgb&w=150",
  "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=150",
];

const getTeamLogo = (logo: string | null, index: number) =>
  logo || FALLBACK_LOGOS[index % FALLBACK_LOGOS.length];

export default function TeamsScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<TeamsResponse>("/v1/teams/");
      setTeams(response.results);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* Header Section */}

            {/* Teams List */}
            {isLoading ? (
              <View style={{ marginTop: 50, alignItems: "center" }}>
                <ActivityIndicator color={theme.primary} size="large" />
              </View>
            ) : teams.length > 0 ? (
              teams.map((team, index) => (
                <TouchableOpacity 
                  key={team.id} 
                  style={styles.teamCard}
                  activeOpacity={0.9}
                  onPress={() => router.push({ pathname: '/team-detail', params: { id: team.id } })}
                >
                  <View style={styles.teamHeader}>
                    <Image
                      source={{ uri: getTeamLogo(team.logo, index) }}
                      style={styles.teamLogo}
                    />
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamNameText}>{team.name}</Text>
                      <Text style={styles.leagueNameText}>
                        {team.league_name || "Free Agent Team"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statColumn}>
                      <Text style={styles.statLabel}>UBICACIÓN</Text>
                      <Text style={styles.standingValue}>{team.city}</Text>
                    </View>
                    <View style={styles.statColumn}>
                      <Text style={styles.statLabel}>DUEÑO</Text>
                      <View style={styles.nextMatchContainer}>
                        <Text style={styles.nextMatchValue}>
                          {team.owner_name}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => router.push({ pathname: '/team-detail', params: { id: team.id } })}
                    >
                      <Text style={styles.viewButtonText}>Ver Equipo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.manageButton}>
                      <Text style={styles.manageButtonText}>
                        Gestionar Plantilla
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <AlertCircle
                  size={48}
                  color={theme.primary}
                  style={{ marginBottom: 15 }}
                />
                <Text style={styles.emptyTitle}>Sin equipos aún</Text>
                <Text style={styles.emptySubtitle}>
                  Únete a una liga o crea tu propio equipo para empezar a
                  competir.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => setIsModalVisible(true)}
        >
          <Plus size={28} color="#001A2C" />
        </TouchableOpacity>

        {/* Create Team Modal */}
        <CreateTeamModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSuccess={fetchTeams}
        />
      </SafeAreaView>
    </View>
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
    headerRow: {
      marginTop: 25,
      marginBottom: 30,
    },
    mainTitle: {
      fontSize: 34,
      fontWeight: "900",
      color: theme.text,
      letterSpacing: -1,
      marginBottom: 8,
    },
    activeBadge: {
      backgroundColor: theme.primary + "26", // opacity 0.15
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: theme.primary + "4D", // opacity 0.3
    },
    activeBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: theme.primary,
      letterSpacing: 1,
    },
    teamCard: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 24,
      marginBottom: 25,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      position: "relative",
      overflow: "hidden",
      elevation: isDark ? 0 : 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.1,
      shadowRadius: 10,
    },
    teamHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 25,
    },
    teamLogo: {
      width: 65,
      height: 65,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.03)",
    },
    teamInfo: {
      marginLeft: 18,
    },
    teamNameText: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.text,
    },
    leagueNameText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 2,
    },
    exclusiveHighlight: {
      position: "absolute",
      left: 0,
      top: 75,
      bottom: 25,
      width: 3,
      backgroundColor: theme.primary,
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 25,
    },
    statColumn: {
      width: "45%",
    },
    statLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 8,
    },
    standingValue: {
      fontSize: 20,
      fontWeight: "900",
      color: theme.primary,
      fontStyle: "italic",
    },
    nextMatchContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    nextMatchValue: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.text,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 15,
    },
    viewButton: {
      flex: 1,
      height: 54,
      borderRadius: 12,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    viewButtonText: {
      fontSize: 14,
      fontWeight: "800",
      color: "#001A2C",
    },
    manageButton: {
      flex: 1,
      height: 54,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.03)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      justifyContent: "center",
      alignItems: "center",
    },
    manageButtonText: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.text,
    },
    fab: {
      position: "absolute",
      bottom: 115,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 10,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.3 : 0.6,
      shadowRadius: 12,
    },
    emptyContainer: {
      marginTop: 60,
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });
