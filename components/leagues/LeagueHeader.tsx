import { LayoutHeader } from "@/components/LayoutHeader";
import { League } from "@/types/league";
import { useTheme } from "@/context/ThemeContext";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LeagueHeaderProps {
  league: League;
}

export function LeagueHeader({ league }: LeagueHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  // Split name for visual impact if it has more than one word
  const nameParts = league.name.split(" ");
  const firstPart = nameParts[0];
  const secondPart = nameParts.slice(1).join(" ");

  return (
    <View style={styles.container}>
      {/* Dynamic Background or Fallback */}
      <Image
        source={
          league.logo ||
          "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1600"
        }
        style={StyleSheet.absoluteFillObject}
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
        {/* Navigation - Unificada con el estándar de la app */}
        <View style={styles.headerWrapper}>
          <LayoutHeader />
        </View>

        {/* Region / Status Tag */}
        <View style={styles.seasonTagContainer}>
          <View style={styles.liveTag}>
            <Text style={styles.liveText}>LIGA ACTIVA</Text>
          </View>
          <Text style={styles.leagueRegion}>
            {league.city.toUpperCase()}, {league.country.toUpperCase()}
          </Text>
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

        {/* Stats / KPI Row */}
        <View style={styles.statsRow}>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>TORNEOS TOTALES</Text>
            <Text style={styles.statKpi}>{league.tournament_count || "0"}</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>MIEMBROS</Text>
            <Text style={styles.statKpi}>
              {league.memberships?.length || "0"}
            </Text>
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
      backgroundColor: isDark ? "#020610" : "#F8FAFC", // Fondo de seguridad
    },
    gradientOverlay: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: "flex-end",
      paddingBottom: 45, // Ajustado para que no choque con los widgets
    },
    headerWrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    },
    seasonTagContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },
    liveTag: {
      backgroundColor: theme.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      marginRight: 10,
    },
    liveText: {
      color: isDark ? "#000" : "#FFF",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    leagueRegion: {
      color: theme.textSecondary,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
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
      gap: 30,
    },
    statLine: {
      alignItems: "flex-start",
    },
    statLabel: {
      fontSize: 9,
      fontWeight: "800",
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 2,
      opacity: 0.7,
    },
    statKpi: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.text,
    },
  });
