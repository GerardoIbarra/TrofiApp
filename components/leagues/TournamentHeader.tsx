import { LayoutHeader } from "@/components/ui/layout/LayoutHeader";
import { Tournament } from "@/features/tournaments/types/tournament";
import { useTheme } from "@/context/ThemeContext";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Settings, Calendar, Trophy } from "lucide-react-native";

interface TournamentHeaderProps {
  tournament: Tournament;
  onEditPress?: () => void;
}

export function TournamentHeader({ tournament, onEditPress }: TournamentHeaderProps) {
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
        source="https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1600"
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

        {/* Info Tag */}
        <View style={styles.tagContainer}>
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

          <TouchableOpacity 
            style={styles.editButton} 
            onPress={onEditPress}
            activeOpacity={0.7}
          >
            <Settings size={16} color={theme.primary} />
          </TouchableOpacity>
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
                 {new Date(tournament.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
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
      marginBottom: 5,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      marginRight: 10,
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
      backgroundColor: theme.primary + "15",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      letterSpacing: 0.5,
      marginRight: 10,
    },
    countdownBadge: {
      backgroundColor: "#FF4444",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      flex: 1,
      alignSelf: 'flex-start',
    },
    countdownText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#FFF",
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    editButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 10,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.03)",
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
