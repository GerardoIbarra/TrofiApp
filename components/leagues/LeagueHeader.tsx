import { useTheme } from "@/context/ThemeContext";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function LeagueHeader() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.container}>
      {/* Imagen del Estadio Pexels (Directo) con expo-image */}
      <Image
        source="https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1600"
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={600}
        cachePolicy="disk"
      />

      {/* Capa de Gradiente para fusionar con el fondo */}
      <LinearGradient
        colors={[
          isDark ? "rgba(10, 25, 47, 0.2)" : "rgba(255, 255, 255, 0.2)",
          isDark ? "rgba(10, 25, 47, 0.6)" : "rgba(255, 255, 255, 0.6)",
          theme.background,
        ]}
        style={styles.gradientOverlay}
      >
        {/* Navegación Superior */}
        <View style={[styles.topNav, { marginTop: insets.top }]}>
          <Text style={styles.logoText}>TROFI</Text>
          <TouchableOpacity>
            <Image
              source="https://i.pravatar.cc/150?u=luis"
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Tag de Temporada */}
        <View style={styles.seasonTagContainer}>
          <View style={styles.liveTag}>
            <Text style={styles.liveText}>LIVE SEASON</Text>
          </View>
          <Text style={styles.leagueRegion}>ZAPOPAN REGIONAL LEAGUE</Text>
        </View>

        {/* Título Monumental */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleGiant}>ZAPOPAN</Text>
          <Text style={[styles.titleGiant, { color: theme.primary }]}>
            NORTE
          </Text>
        </View>

        {/* Puntuación General / Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>TOTAL TEAMS</Text>
            <Text style={styles.statKpi}>16</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>ROUNDS LEFT</Text>
            <Text style={styles.statKpi}>04</Text>
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
    topNav: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      position: "absolute",
      top: 15,
      left: 20,
      right: 20,
    },
    logoText: {
      fontSize: 22,
      fontWeight: "900",
      color: isDark ? "#F8FAFC" : theme.text,
      letterSpacing: 2,
      fontStyle: "italic",
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
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
