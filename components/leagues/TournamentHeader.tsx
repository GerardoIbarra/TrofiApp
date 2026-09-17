import { LayoutHeader } from "@/components/ui/layout/LayoutHeader";
import { Tournament } from "@/features/tournaments/types/tournament";
import { useTheme } from "@/context/ThemeContext";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Settings, Calendar, Trophy, Plus } from "lucide-react-native";

interface TournamentHeaderProps {
  tournament: Tournament;
  onEditPress?: () => void;
  onAddPress?: () => void;
}

export function TournamentHeader({ tournament, onEditPress, onAddPress }: TournamentHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  // Split name for visual impact
  const nameParts = tournament.name.split(" ");
  const firstPart = nameParts[0];
  const secondPart = nameParts.slice(1).join(" ");

  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(dateString);
    startDate.setHours(0, 0, 0, 0);

    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysRemaining = getDaysRemaining(tournament.start_date);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.primary;
      case 'completed': return '#4ADE80';
      case 'draft': return theme.textSecondary;
      default: return theme.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Fallback for Tournaments */}
      <Image
        source={{ uri: "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1600" }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={600}
        cachePolicy="disk"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={[
          isDark ? "rgba(10, 25, 47, 0.4)" : "rgba(255, 255, 255, 0.2)",
          isDark ? "rgba(10, 25, 47, 0.7)" : "rgba(255, 255, 255, 0.6)",
          theme.background,
        ]}
        style={styles.gradientOverlay}
      >
        {/* Navigation */}
        <View style={styles.headerWrapper}>
          <LayoutHeader showBackButton={true} />
        </View>

        {/* Info Tag & Actions */}
        <View style={styles.tagContainer}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tournament.status) }]}>
              <Text style={styles.statusText}>{tournament.status.toUpperCase()}</Text>
            </View>
            <Text style={styles.seasonText}>
              {tournament.season_label.toUpperCase()}
            </Text>
            
            {daysRemaining > 0 && tournament.status === 'draft' && (
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownText}>
                  {t("tournament.starts_in", { count: daysRemaining })}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actionBtnGroup}>
            {onAddPress && (
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={onAddPress}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Agregar"
              >
                <Plus size={18} color={isDark ? "#00F0FF" : theme.primary} strokeWidth={2.6} />
              </TouchableOpacity>
            )}

            {onEditPress && (
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={onEditPress}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Configuración"
              >
                <Settings size={18} color={isDark ? "#00F0FF" : theme.primary} strokeWidth={2.2} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Monumental Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleGiant}>{firstPart.toUpperCase()}</Text>
          {secondPart ? (
            <Text style={[styles.titleGiant, { color: theme.primary }]}>
              {secondPart.toUpperCase()}
            </Text>
          ) : null}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>{t("tournament.label_teams")}</Text>
            <View style={styles.kpiBox}>
               <Trophy size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
               <Text style={styles.statKpi}>{tournament.team_count || "0"}</Text>
            </View>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>{t("tournament.label_duration")}</Text>
            <View style={styles.kpiBox}>
              <Calendar size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.statKpi}>
                {tournament.start_date && !isNaN(new Date(tournament.start_date).getTime()) 
                  ? new Date(tournament.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
                  : 'TBD'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
      height: 380,
      backgroundColor: isDark ? "#020610" : "#F8FAFC",
    },
    gradientOverlay: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: "flex-end",
      paddingBottom: 45,
    },
    headerWrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    },
    tagContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    badgeRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusText: {
      color: isDark ? "#000" : "#FFF",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    seasonText: {
      fontSize: 10,
      fontWeight: "900",
      color: theme.primary,
      backgroundColor: isDark ? theme.primary + "20" : "#FFFFFF",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      letterSpacing: 0.5,
      borderWidth: 1,
      borderColor: isDark ? theme.primary + "40" : "rgba(0,0,0,0.08)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
    countdownBadge: {
      backgroundColor: "#FF4444",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    countdownText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#FFF",
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    actionBtnGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginLeft: 10,
    },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? "rgba(8, 30, 61, 0.95)" : "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: isDark ? "rgba(0, 240, 255, 0.4)" : "rgba(0, 0, 0, 0.12)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.18,
      shadowRadius: 5,
      elevation: 4,
    },
    editButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? "rgba(8, 30, 61, 0.95)" : "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: isDark ? "rgba(0, 240, 255, 0.4)" : "rgba(0, 0, 0, 0.12)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.18,
      shadowRadius: 5,
      elevation: 4,
    },
    titleContainer: {
      marginBottom: 20,
    },
    titleGiant: {
      fontSize: 42,
      fontWeight: "900",
      color: theme.text,
      lineHeight: 45,
      letterSpacing: -1,
    },
    statsRow: {
      flexDirection: "row",
      gap: 40,
    },
    statLine: {
      alignItems: "flex-start",
    },
    kpiBox: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 9,
      fontWeight: "800",
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 4,
      opacity: 0.7,
    },
    statKpi: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
    },
  });
