import { LayoutHeader } from "@/components/ui/layout/LayoutHeader";
import { Team } from "@/features/teams/types/team";
import { useTheme } from "@/context/ThemeContext";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Settings } from "lucide-react-native";
import { useAuthStore } from "@/features/auth/store/authStore";

interface TeamHeaderProps {
  team: Team;
  onEditPress?: () => void;
}

export function TeamHeader({ team, onEditPress }: TeamHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);

  const isOwner = user?.id === team.owner;

  // Split name for visual impact
  const nameParts = team.name.split(" ");
  const firstPart = nameParts[0];
  const secondPart = nameParts.slice(1).join(" ");

  return (
    <View style={styles.container}>
      {/* Dynamic Background or Fallback */}
      <Image
        source={
          team.logo ||
          "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1600"
        }
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
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{team.league_name?.toUpperCase() || "SIN LIGA"}</Text>
          </View>
          <Text style={styles.regionText}>
            {team.city.toUpperCase()}
          </Text>
          {isOwner && (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={onEditPress}
              activeOpacity={0.7}
            >
              <Settings size={16} color={theme.primary} />
            </TouchableOpacity>
          )}
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
            <Text style={styles.statLabel}>TORNEOS ACTIVOS</Text>
            <Text style={styles.statKpi}>{team.tournament_registrations?.length || "0"}</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>GESTOR</Text>
            <Text style={styles.statKpi} numberOfLines={1}>
              {team.owner_name?.split(" ")[0] || "---"}
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
    categoryBadge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      marginRight: 10,
    },
    categoryText: {
      color: isDark ? "#000" : "#FFF",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    regionText: {
      color: theme.textSecondary,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
      flex: 1,
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
      gap: 30,
    },
    statLine: {
      alignItems: "flex-start",
      maxWidth: 150,
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
