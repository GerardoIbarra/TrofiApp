import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { router } from "expo-router";
import { ChevronRight, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EnrollTeamModal } from "@/components/tournaments/EnrollTeamModal";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";

interface TournamentTeam {
  id: string;
  team: string;
  team_name: string;
  team_logo?: string | null;
  captain_name?: string;
  player_count?: string;
  group?: string;
}

interface TournamentTeamsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TournamentTeam[];
}

interface TournamentTeamsWidgetProps {
  tournamentId: string;
}

export function TournamentTeamsWidget({
  tournamentId,
}: TournamentTeamsWidgetProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrollModalVisible, setIsEnrollModalVisible] = useState(false);

  useEffect(() => {
    fetchTournamentTeams();
  }, [tournamentId]);

  const fetchTournamentTeams = async () => {
    setIsLoading(true);
    try {
      // Endpoint provided by user
      const response = await api.get<TournamentTeamsResponse>(
        `/v1/tournament-teams/?tournament=${tournamentId}`,
      );
      setTeams(response.results);
    } catch (error) {
      console.error("Error fetching tournament teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const FALLBACK_LOGOS = [
    "https://images.pexels.com/photos/209637/pexels-photo-209637.jpeg?auto=compress&cs=tinysrgb&w=150",
    "https://images.pexels.com/photos/159515/football-gridiron-soccer-pitch-159515.jpeg?auto=compress&cs=tinysrgb&w=150",
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.titleText}>{t("tournament.teams_label") || "Equipos"}</Text>
        <TouchableOpacity 
          style={styles.enrollButton}
          onPress={() => setIsEnrollModalVisible(true)}
        >
          <Text style={styles.enrollButtonText}>+ Inscribir Equipo</Text>
        </TouchableOpacity>
      </View>

      {teams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users size={40} color={theme.textSecondary} opacity={0.2} />
          <Text style={styles.emptyText}>
            {t("tournament.teams_coming_soon")}
          </Text>
        </View>
      ) : (
        teams.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.teamCard}
            onPress={() =>
              router.push({ pathname: "/tournament-team-detail", params: { id: item.id } })
            }
          >
          <View style={styles.cardContent}>
            <Image
              source={{
                uri:
                  item.team_logo ||
                  FALLBACK_LOGOS[index % FALLBACK_LOGOS.length],
              }}
              style={styles.teamLogo}
            />
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{item.team_name}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Users size={10} color={theme.primary} />
                  <Text style={styles.badgeText}>
                    {item.player_count || "0"}{" "}
                    {t("tournament.players_label") || "Players"}
                  </Text>
                </View>
                {item.group && (
                  <View style={[styles.badge, { backgroundColor: theme.primary + '10' }]}>
                    <Text style={styles.badgeText}>
                      {t("tournament.group") || "Group"} {item.group}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <ChevronRight size={18} color={theme.textSecondary} opacity={0.5} />
          </View>
        </TouchableOpacity>
        ))
      )}

      <EnrollTeamModal 
        visible={isEnrollModalVisible}
        onClose={() => setIsEnrollModalVisible(false)}
        onSuccess={fetchTournamentTeams}
        tournamentId={tournamentId}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingBottom: 20,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    titleText: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.text,
    },
    enrollButton: {
      backgroundColor: theme.primary + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    enrollButtonText: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: "800",
    },
    loadingContainer: {
      height: 200,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyContainer: {
      height: 200,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      borderStyle: "dashed",
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 13,
      marginTop: 12,
    },
    teamCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      overflow: "hidden",
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 16,
    },
    teamLogo: {
      width: 50,
      height: 50,
      borderRadius: 12,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    },
    teamInfo: {
      flex: 1,
    },
    teamName: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 4,
    },
    badgeRow: {
      flexDirection: "row",
      gap: 8,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary + "15",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      gap: 4,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: theme.primary,
      letterSpacing: 0.5,
    },
  });
