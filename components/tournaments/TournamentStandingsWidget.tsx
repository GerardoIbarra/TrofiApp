import { useTheme } from "@/context/ThemeContext";
import { StandingItem } from "@/features/leagues/types/standings";
import api from "@/services/api";
import { AlertCircle, Trophy, Settings2, Share2, Flame, Info } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Tournament } from "@/features/tournaments/types/tournament";
import { TiebreakerConfigModal } from "./modals/TiebreakerConfigModal";
import { SponsorBanner } from "@/components/sponsors/SponsorBanner";
import { shareStandings } from "@/features/share/services/shareService";

interface TopScorerItem {
  id: string;
  player_name: string;
  team_name: string;
  goals: number;
}

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

  const [subTab, setSubTab] = useState<'STANDINGS' | 'SCORERS'>('STANDINGS');
  const [isConfigVisible, setIsConfigVisible] = useState(false);

  const {
    data: standings = [],
    isLoading: isLoadingStandings,
  } = useQuery({
    queryKey: ["standings", tournamentId],
    queryFn: async () => {
      const response = await api.get<StandingItem[]>(
        `/v1/standings/by_tournament/?tournament_id=${tournamentId}`,
      );
      return [...response].sort((a, b) => a.position - b.position);
    },
    enabled: Boolean(tournamentId),
  });

  const {
    data: scorers = [],
    isLoading: isLoadingScorers,
  } = useQuery({
    queryKey: ["top-scorers", tournamentId],
    queryFn: async () => {
      try {
        const response = await api.get<TopScorerItem[] | { results: TopScorerItem[] }>(
          `/v1/tournaments/${tournamentId}/top-scorers/`,
          { silent: true },
        );
        return Array.isArray(response) ? response : (response as any)?.results || [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(tournamentId),
  });

  const getPositionStyle = (pos: number) => {
    if (pos === 1) return styles.posFirst;
    if (pos === 2) return styles.posSecond;
    if (pos === 3) return styles.posThird;
    return null;
  };

  const hasPlayedMatches = standings.some((item) => (item.played || 0) > 0);

  if (isLoadingStandings && isLoadingScorers) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color={theme.primary} />
        <Text style={styles.loadingText}>{t("standings.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SponsorBanner
        placementType="standings_banner"
        tournamentId={tournamentId}
        leagueId={tournament?.league}
        style={{ marginHorizontal: 12, marginTop: 10, marginBottom: 4 }}
      />

      {/* Sub-tab Switch: Posiciones vs Goleo */}
      <View style={styles.subTabRow}>
        <TouchableOpacity
          style={[styles.subTabBtn, subTab === 'STANDINGS' && styles.subTabBtnActive]}
          onPress={() => setSubTab('STANDINGS')}
          activeOpacity={0.8}
        >
          <Trophy size={14} color={subTab === 'STANDINGS' ? '#001A2C' : theme.textSecondary} />
          <Text style={[styles.subTabText, subTab === 'STANDINGS' && styles.subTabTextActive]}>
            TABLA GENERAL
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, subTab === 'SCORERS' && styles.subTabBtnActive]}
          onPress={() => setSubTab('SCORERS')}
          activeOpacity={0.8}
        >
          <Flame size={14} color={subTab === 'SCORERS' ? '#001A2C' : theme.textSecondary} />
          <Text style={[styles.subTabText, subTab === 'SCORERS' && styles.subTabTextActive]}>
            TABLA DE GOLEO
          </Text>
        </TouchableOpacity>
      </View>

      {subTab === 'STANDINGS' ? (
        standings.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <Trophy size={36} color={theme.primary} />
            </View>
            <Text style={styles.emptyTitle}>Tabla de Posiciones</Text>
            <Text style={styles.emptyText}>
              La tabla se actualizará automáticamente tras disputarse la Jornada 1.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.shareBtn} 
                onPress={() => shareStandings(tournamentId)}
                activeOpacity={0.8}
              >
                <Share2 size={14} color="#001A2C" />
                <Text style={styles.shareBtnText}>{t('tournament.share_standings')}</Text>
              </TouchableOpacity>

              {isAdmin && tournament && (
                <TouchableOpacity 
                  style={styles.adminBtn} 
                  onPress={() => setIsConfigVisible(true)}
                  activeOpacity={0.8}
                >
                  <Settings2 size={14} color={theme.primary} />
                  <Text style={styles.adminBtnText}>{t('tournament.config_tiebreaker')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {!hasPlayedMatches && (
              <View style={styles.infoBanner}>
                <Info size={15} color={theme.primary} />
                <Text style={styles.infoBannerText}>
                  La tabla se actualizará automáticamente tras disputarse la Jornada 1.
                </Text>
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
                {item.played ?? "-"}
              </Text>
              <Text style={[styles.statCell, styles.cellStat]}>
                {item.wins ?? "-"}
              </Text>
              <Text style={[styles.statCell, styles.cellStat]}>
                {item.draws ?? "-"}
              </Text>
              <Text style={[styles.statCell, styles.cellStat]}>
                {item.losses ?? "-"}
              </Text>
              <Text style={[styles.statCell, styles.cellStat]}>
                {item.goals_for ?? "-"}
              </Text>
              <Text style={[styles.statCell, styles.cellStat]}>
                {item.goals_against ?? "-"}
              </Text>

              <Text
                style={[
                  styles.statCell,
                  styles.cellStat,
                  styles.dgText,
                  item.goal_difference != null && item.goal_difference > 0 && { color: "#4ADE80" },
                  item.goal_difference != null && item.goal_difference < 0 && { color: "#FF4444" },
                ]}
              >
                {item.goal_difference != null
                  ? (item.goal_difference > 0
                      ? `+${item.goal_difference}`
                      : item.goal_difference)
                  : "-"}
              </Text>

              <Text style={[styles.pointsCell, styles.cellPoints]}>
                {item.points ?? "-"}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footerInfo}>
        <AlertCircle size={12} color={theme.textSecondary} />
        <Text style={styles.footerText}>{t("standings.footer_scroll")}</Text>
      </View>
          </>
        )
      ) : (
        scorers.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={[styles.emptyIconCircle, { backgroundColor: "#FF572218" }]}>
              <Flame size={36} color="#FF5722" />
            </View>
            <Text style={styles.emptyTitle}>Tabla de Goleo</Text>
            <Text style={styles.emptyMotivationalText}>
              ¡Anota el primer gol de la temporada para aparecer aquí!
            </Text>
            <Text style={styles.emptySubtext}>
              Los líderes de goleo se registrarán automáticamente al capturar los resultados de cada partido.
            </Text>
          </View>
        ) : (
          <View style={styles.scorersContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.cellPos]}>#</Text>
              <Text style={[styles.headerCell, styles.cellScorerPlayer]}>JUGADOR</Text>
              <Text style={[styles.headerCell, styles.cellScorerTeam]}>EQUIPO</Text>
              <Text style={[styles.headerCell, styles.cellScorerGoals]}>GOLES</Text>
            </View>

            {scorers.map((item: TopScorerItem, index: number) => (
              <View
                key={item.id || `${item.player_name}-${index}`}
                style={[
                  styles.tableRow,
                  index % 2 !== 0 && styles.rowAlternate,
                  index < 3 && styles.rowElite,
                ]}
              >
                <View style={[styles.posBadge, getPositionStyle(index + 1)]}>
                  <Text style={styles.posText}>{index + 1}</Text>
                </View>
                <Text style={styles.scorerPlayerName} numberOfLines={1}>
                  {item.player_name}
                </Text>
                <Text style={styles.scorerTeamName} numberOfLines={1}>
                  {item.team_name}
                </Text>
                <View style={styles.scorerGoalsBox}>
                  <Flame size={12} color="#FF5722" />
                  <Text style={styles.scorerGoalsText}>{item.goals}</Text>
                </View>
              </View>
            ))}
          </View>
        )
      )}

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
    subTabRow: {
      flexDirection: "row",
      padding: 8,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      backgroundColor: isDark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.02)",
    },
    subTabBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    },
    subTabBtnActive: {
      backgroundColor: theme.primary,
    },
    subTabText: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
    subTabTextActive: {
      color: "#001A2C",
      fontWeight: "900",
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      gap: 10,
    },
    shareBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    shareBtnText: {
      fontSize: 11,
      fontWeight: "900",
      color: "#001A2C",
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
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
      borderRadius: 20,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      margin: 16,
    },
    emptyIconCircle: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: theme.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 14,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.text,
      textAlign: "center",
      marginBottom: 6,
    },
    emptyMotivationalText: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.text,
      textAlign: "center",
      marginTop: 4,
      marginBottom: 6,
      paddingHorizontal: 16,
      lineHeight: 20,
    },
    emptySubtext: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "center",
      paddingHorizontal: 20,
      lineHeight: 18,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 13,
      textAlign: "center",
      marginTop: 4,
      lineHeight: 20,
      paddingHorizontal: 16,
    },
    infoBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.primary + "12",
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginHorizontal: 12,
      marginTop: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.primary + "30",
    },
    infoBannerText: {
      flex: 1,
      fontSize: 12,
      color: theme.text,
      fontWeight: "600",
      lineHeight: 16,
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

    cellScorerPlayer: {
      flex: 1.2,
      textAlign: "left",
      paddingLeft: 10,
    },
    cellScorerTeam: {
      flex: 1,
      textAlign: "left",
      paddingLeft: 6,
    },
    cellScorerGoals: {
      width: 60,
      textAlign: "center",
    },
    scorerPlayerName: {
      flex: 1.2,
      fontSize: 13,
      fontWeight: "800",
      color: theme.text,
      paddingLeft: 10,
    },
    scorerTeamName: {
      flex: 1,
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "600",
      paddingLeft: 6,
    },
    scorerGoalsBox: {
      width: 60,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    scorerGoalsText: {
      fontSize: 14,
      fontWeight: "900",
      color: "#FF5722",
    },
    scorersContainer: {
      width: "100%",
    },

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
