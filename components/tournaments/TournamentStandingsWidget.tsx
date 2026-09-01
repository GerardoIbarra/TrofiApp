import { useTheme } from "@/context/ThemeContext";
import { StandingItem } from "@/features/leagues/types/standings";
import api from "@/services/api";
import { AlertCircle, Trophy } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Tournament } from "@/features/tournaments/types/tournament";
import { TiebreakerConfigModal } from "./modals/TiebreakerConfigModal";
import { Settings2 } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

interface TournamentStandingsWidgetProps {
  tournamentId: string;
  isAdmin?: boolean;
  tournament?: Tournament;
}

export function TournamentStandingsWidget({
  tournamentId,
  isAdmin,
  tournament,
}: TournamentStandingsWidgetProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  const [standings, setStandings] = useState<StandingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigVisible, setIsConfigVisible] = useState(false);

  useEffect(() => {
    fetchStandings();
  }, [tournamentId]);

  const fetchStandings = async () => {
    setIsLoading(true);
    try {
      // Endpoint basado en tu información: /api/v1/standings/by_tournament/
      const response = await api.get<StandingItem[]>(
        `/v1/standings/by_tournament/?tournament_id=${tournamentId}`,
      );
      // Ordenamos por posición por si acaso el backend no lo entrega ordenado
      const sortedResult = [...response].sort(
        (a, b) => a.position - b.position,
      );
      setStandings(sortedResult);
    } catch (error) {
      console.error("Error fetching standings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionStyle = (pos: number) => {
    if (pos === 1) return styles.posFirst;
    if (pos === 2) return styles.posSecond;
    if (pos === 3) return styles.posThird;
    return null;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color={theme.primary} />
        <Text style={styles.loadingText}>{t("standings.loading")}</Text>
      </View>
    );
  }

  if (standings.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Trophy size={40} color={theme.textSecondary} opacity={0.2} />
        <Text style={styles.emptyText}>{t("standings.empty")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isAdmin && tournament && (
        <View style={styles.adminActionRow}>
          <TouchableOpacity 
            style={styles.adminBtn} 
            onPress={() => setIsConfigVisible(true)}
          >
            <Settings2 size={14} color={theme.primary} />
            <Text style={styles.adminBtnText}>Configurar Desempate</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
      >
        <View>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.cellPos]}>#</Text>
            <Text style={[styles.headerCell, styles.cellTeam]}>
              {t("standings.header_team")}
            </Text>
            <Text style={[styles.headerCell, styles.cellGroup]}>
              {t("standings.header_group")}
            </Text>
            <Text style={[styles.headerCell, styles.cellStat]}>
              {t("standings.header_played")}
            </Text>
            <Text style={[styles.headerCell, styles.cellStat]}>
              {t("standings.header_wins")}
            </Text>
            <Text style={[styles.headerCell, styles.cellStat]}>
              {t("standings.header_draws")}
            </Text>
            <Text style={[styles.headerCell, styles.cellStat]}>
              {t("standings.header_losses")}
            </Text>
            <Text style={[styles.headerCell, styles.cellStat]}>
              {t("standings.header_goals_for")}
            </Text>
            <Text style={[styles.headerCell, styles.cellStat]}>
              {t("standings.header_goals_against")}
            </Text>
            <Text style={[styles.headerCell, styles.cellStat]}>
              {t("standings.header_goal_diff")}
            </Text>
            <Text style={[styles.headerCell, styles.cellPoints]}>
              {t("standings.header_points")}
            </Text>
          </View>

          {/* Table Body */}
          {standings.map((item, index) => (
            <View
              key={item.tournament_team}
              style={[
                styles.tableRow,
                index % 2 !== 0 && styles.rowAlternate,
                item.position <= 3 && styles.rowElite,
              ]}
            >
              <View style={[styles.posBadge, getPositionStyle(item.position)]}>
                <Text style={styles.posText}>{item.position}</Text>
              </View>

              <Text style={styles.teamName} numberOfLines={1}>
                {item.team_name.toUpperCase()}
              </Text>

              <Text style={[styles.statCell, styles.cellGroup]}>
                {item.group || "-"}
              </Text>

              <Text style={[styles.statCell, styles.cellStat]}>
                {item.played}
              </Text>
              <Text style={[styles.statCell, styles.cellStat]}>
                {item.wins}
              </Text>
              <Text style={[styles.statCell, styles.cellStat]}>
                {item.draws}
              </Text>
              <Text style={[styles.statCell, styles.cellStat]}>
                {item.losses}
              </Text>
              <Text style={[styles.statCell, styles.cellStat]}>
                {item.goals_for}
              </Text>
              <Text style={[styles.statCell, styles.cellStat]}>
                {item.goals_against}
              </Text>

              <Text
                style={[
                  styles.statCell,
                  styles.cellStat,
                  styles.dgText,
                  item.goal_difference > 0 && { color: "#4ADE80" },
                  item.goal_difference < 0 && { color: "#FF4444" },
                ]}
              >
                {item.goal_difference > 0
                  ? `+${item.goal_difference}`
                  : item.goal_difference}
              </Text>

              <Text style={[styles.pointsCell, styles.cellPoints]}>
                {item.points}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footerInfo}>
        <AlertCircle size={12} color={theme.textSecondary} />
        <Text style={styles.footerText}>{t("standings.footer_scroll")}</Text>
      </View>

      {tournament && (
        <TiebreakerConfigModal 
          visible={isConfigVisible} 
          onClose={() => setIsConfigVisible(false)} 
          tournament={tournament} 
        />
      )}
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      overflow: "hidden",
      marginTop: 15,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    adminActionRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    adminBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.primary + "15",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    adminBtnText: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.primary,
    },
    loadingBox: {
      padding: 60,
      alignItems: "center",
      gap: 15,
    },
    loadingText: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    emptyBox: {
      padding: 60,
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
      borderRadius: 20,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      marginTop: 20,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 13,
      textAlign: "center",
      marginTop: 15,
      lineHeight: 20,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    headerCell: {
      fontSize: 10,
      fontWeight: "900",
      color: theme.textSecondary,
      letterSpacing: 1,
      textAlign: "center",
    },
    tableRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
    },
    rowAlternate: {
      backgroundColor: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
    },
    rowElite: {
      // Sutil indicación para el top 3
    },
    cellPos: { width: 40 },
    cellTeam: { width: 140, textAlign: "left", paddingLeft: 10 },
    cellGroup: { width: 35 },
    cellStat: { width: 40 },
    cellPoints: { width: 50 },

    posBadge: {
      width: 24,
      height: 24,
      borderRadius: 6,
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
    },
    posFirst: { backgroundColor: "#FFD700" }, // Gold
    posSecond: { backgroundColor: "#C0C0C0" }, // Silver
    posThird: { backgroundColor: "#CD7F32" }, // Bronze
    posText: {
      fontSize: 11,
      fontWeight: "900",
      color: isDark ? "#FFF" : "#000",
    },
    teamName: {
      width: 140,
      fontSize: 12,
      fontWeight: "800",
      color: theme.text,
      paddingLeft: 10,
    },
    statCell: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.textSecondary,
      textAlign: "center",
    },
    dgText: {
      fontWeight: "800",
    },
    pointsCell: {
      fontSize: 14,
      fontWeight: "900",
      color: theme.primary,
      textAlign: "center",
    },
    footerInfo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(255,255,255,0.02)"
        : "rgba(255,255,255,0.1)",
      paddingVertical: 10,
      gap: 6,
    },
    footerText: {
      fontSize: 10,
      color: theme.textSecondary,
      fontWeight: "600",
    },
  });
