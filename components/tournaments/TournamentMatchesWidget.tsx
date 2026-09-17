import { useTheme } from "@/context/ThemeContext";
import { Match, PaginatedMatches } from "@/features/tournaments/types/match";
import api from "@/services/api";
import { useRouter } from "expo-router";
import { Calendar, MapPin, Trophy, Settings, CalendarPlus, Plus, Sparkles } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MatchResultModal } from "./MatchResultModal";
import { ScheduleConfigModal } from "./ScheduleConfigModal";
import { GenerateScheduleModal } from "./GenerateScheduleModal";
import { CreateMatchModal } from "./CreateMatchModal";
import { MatchCardSkeleton } from "@/components/matches/MatchCardSkeleton";
import { useQuery } from "@tanstack/react-query";

interface TournamentMatchesWidgetProps {
  tournamentId: string;
  isAdmin?: boolean;
}

export function TournamentMatchesWidget({
  tournamentId,
  isAdmin,
}: TournamentMatchesWidgetProps) {
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en-US' : 'es-ES';
  const styles = createStyles(theme, isDark);
  const router = useRouter();

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [isGenerateModalVisible, setIsGenerateModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const {
    data: matches = [],
    isLoading,
    refetch: fetchMatches,
  } = useQuery({
    queryKey: ['tournament-matches', tournamentId],
    queryFn: async () => {
      const response = await api.get<PaginatedMatches>(
        `/v1/matches/?tournament=${tournamentId}`,
      );
      return response.results.sort(
        (a, b) =>
          new Date(a.start_datetime).getTime() -
          new Date(b.start_datetime).getTime(),
      );
    },
    enabled: !!tournamentId,
  });

  const handleEditResult = (match: Match) => {
    setSelectedMatch(match);
    setIsResultModalVisible(true);
  };

  const renderMatchCard = ({ item }: { item: Match }) => {
    const isFinished = item.status === "played";
    const matchDate = new Date(item.start_datetime);
    const isToday = matchDate.toDateString() === new Date().toDateString();

    // Extraemos resultados del objeto anidado
    const homeScore = item.result?.home_score ?? 0;
    const awayScore = item.result?.away_score ?? 0;
    const hasResult = !!item.result;

    return (
      <TouchableOpacity
        style={styles.matchCard}
        activeOpacity={0.7}
        delayPressIn={80}
        onPress={() =>
          router.push({
            pathname: "/match-detail",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.tagRow}>
            {isToday && (
              <View style={styles.liveTag}>
                <Text style={styles.liveTagText}>{t("match_detail.today")}</Text>
              </View>
            )}
            <Text style={styles.matchDate}>
              {matchDate
                .toLocaleDateString(locale, { day: "numeric", month: "short" })
                .toUpperCase()}{" "}
              •{" "}
              {matchDate.toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          {isAdmin && (
            <View style={styles.headerBtnGroup}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => {
                  setEditingMatch(item);
                  setIsCreateModalVisible(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Settings size={12} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleEditResult(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trophy size={13} color={theme.primary} />
                <Text style={styles.editBtnText}>{t("match_list.scoreboard")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.matchMain}>
          <View style={styles.teamInfo}>
            <View
              style={[
                styles.teamBadgePlaceholder,
                { backgroundColor: theme.primary + "10" },
              ]}
            />
            <Text style={styles.teamName} numberOfLines={1}>
              {item.home_team_name.toUpperCase()}
            </Text>
          </View>

          <View style={styles.scoreContainer}>
            {isFinished || hasResult ? (
              <View style={styles.scoreBox}>
                <Text
                  style={[
                    styles.scoreText,
                    isFinished && { color: theme.text },
                  ]}
                >
                  {homeScore}
                </Text>
                <Text style={styles.scoreDivider}>-</Text>
                <Text
                  style={[
                    styles.scoreText,
                    isFinished && { color: theme.text },
                  ]}
                >
                  {awayScore}
                </Text>
              </View>
            ) : (
              <View style={styles.vsBox}>
                <Text style={styles.vsText}>{t("match_list.vs")}</Text>
              </View>
            )}
          </View>

          <View style={styles.teamInfo}>
            <View
              style={[
                styles.teamBadgePlaceholder,
                { backgroundColor: theme.primary + "10" },
              ]}
            />
            <Text style={styles.teamName} numberOfLines={1}>
              {item.away_team_name.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <MapPin size={12} color={theme.textSecondary} />
            <Text style={styles.footerText}>
              {item.venue_name || t("match_list.venue_placeholder")}
            </Text>
          </View>
          {item.status !== "scheduled" && (
            <Text style={styles.roundText}>{item.status.toUpperCase()}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <MatchCardSkeleton />
        <MatchCardSkeleton />
        <MatchCardSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isAdmin && (
        <View style={styles.adminActionRow}>
          <TouchableOpacity 
            style={[styles.adminBtn, { backgroundColor: theme.primary }]} 
            onPress={() => {
              setEditingMatch(null);
              setIsCreateModalVisible(true);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Plus size={14} color="#001A2C" />
            <Text style={[styles.adminBtnText, { color: "#001A2C" }]}>Crear Partido</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.adminBtn} 
            onPress={() => setIsConfigModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Settings size={14} color={theme.primary} />
            <Text style={styles.adminBtnText}>{t('tournament.config_schedule')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.adminBtn} 
            onPress={() => setIsGenerateModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CalendarPlus size={14} color={theme.primary} />
            <Text style={styles.adminBtnText}>{t('tournament.generate_fixture')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={matches}
        renderItem={renderMatchCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={42} color={theme.textSecondary} opacity={0.35} />
            <Text style={styles.emptyTitle}>Sin partidos registrados</Text>
            <Text style={styles.emptyText}>
              {isAdmin 
                ? "Programa un partido individual manualmente o genera el rol completo de jornadas."
                : t("match_list.empty")}
            </Text>

            {isAdmin && (
              <View style={styles.emptyActions}>
                <TouchableOpacity
                  style={[styles.emptyActionBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setEditingMatch(null);
                    setIsCreateModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Plus size={15} color="#001A2C" />
                  <Text style={[styles.emptyActionBtnText, { color: '#001A2C' }]}>Crear Partido Manual</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.emptyActionBtn, styles.emptyActionBtnSecondary]}
                  onPress={() => setIsGenerateModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <CalendarPlus size={15} color={theme.primary} />
                  <Text style={[styles.emptyActionBtnText, { color: theme.primary }]}>Generar Rol Automático</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.demoMatchLink}
              onPress={() => router.push({ pathname: '/match-detail', params: { id: 'demo' } })}
              activeOpacity={0.7}
            >
              <Sparkles size={14} color="#00F0FF" />
              <Text style={styles.demoMatchText}>Probar con Partido Demo (WhatsApp / Historias)</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <MatchResultModal
        visible={isResultModalVisible}
        match={selectedMatch}
        onClose={() => setIsResultModalVisible(false)}
        onSuccess={fetchMatches}
      />
      
      <ScheduleConfigModal
        visible={isConfigModalVisible}
        onClose={() => setIsConfigModalVisible(false)}
        tournamentId={tournamentId}
      />
      
      <GenerateScheduleModal
        visible={isGenerateModalVisible}
        onClose={() => setIsGenerateModalVisible(false)}
        tournamentId={tournamentId}
      />

      <CreateMatchModal
        visible={isCreateModalVisible}
        onClose={() => {
          setIsCreateModalVisible(false);
          setEditingMatch(null);
        }}
        onSuccess={fetchMatches}
        tournamentId={tournamentId}
        initialData={editingMatch}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginTop: 10,
    },
    adminActionRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
      marginBottom: 15,
      paddingHorizontal: 5,
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
    listContent: {
      paddingBottom: 40,
    },
    loadingContainer: {
      padding: 60,
      alignItems: "center",
      gap: 15,
    },
    loadingText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "600",
    },
    matchCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    tagRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    liveTag: {
      backgroundColor: "#FF4444",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    liveTagText: {
      color: "#FFF",
      fontSize: 8,
      fontWeight: "900",
    },
    matchDate: {
      fontSize: 10,
      fontWeight: "800",
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
    headerBtnGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    iconBtn: {
      padding: 6,
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      borderRadius: 6,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
      alignItems: "center",
      justifyContent: "center",
    },
    editBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: theme.primary + "15",
      borderRadius: 6,
    },
    editBtnText: {
      fontSize: 9,
      fontWeight: "900",
      color: theme.primary,
    },
    matchMain: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    teamInfo: {
      alignItems: "center",
      width: "35%",
    },
    teamBadgePlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginBottom: 8,
    },
    teamName: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.text,
      textAlign: "center",
    },
    scoreContainer: {
      width: "30%",
      alignItems: "center",
    },
    scoreBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    scoreText: {
      fontSize: 24,
      fontWeight: "900",
      color: theme.textSecondary,
    },
    scoreDivider: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.textSecondary,
      opacity: 0.3,
    },
    scoreDash: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.textSecondary,
      opacity: 0.3,
    },
    vsBox: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    },
    vsText: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.textSecondary,
      opacity: 0.6,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    },
    footerItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    footerText: {
      fontSize: 10,
      color: theme.textSecondary,
      fontWeight: "600",
    },
    roundText: {
      fontSize: 10,
      fontWeight: "900",
      color: theme.primary,
    },
    emptyContainer: {
      padding: 36,
      alignItems: "center",
      gap: 12,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.text,
    },
    emptyText: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 18,
      maxWidth: 280,
    },
    emptyActions: {
      flexDirection: "column",
      gap: 10,
      width: "100%",
      marginTop: 8,
    },
    emptyActionBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      width: "100%",
    },
    emptyActionBtnSecondary: {
      backgroundColor: theme.primary + "15",
      borderWidth: 1,
      borderColor: theme.primary + "30",
    },
    emptyActionBtnText: {
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    demoMatchLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 14,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: "rgba(0, 240, 255, 0.08)",
      borderWidth: 1,
      borderColor: "rgba(0, 240, 255, 0.2)",
    },
    demoMatchText: {
      fontSize: 11,
      fontWeight: "800",
      color: "#00F0FF",
    },
  });
