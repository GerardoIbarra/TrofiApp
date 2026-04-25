import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { LayoutHeader } from "@/components/ui/layout/LayoutHeader";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import api from "@/services/api";
import { Player, PaginatedPlayers } from "@/features/players/types/player";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { ChevronRight, Search, Filter } from "lucide-react-native";
import { useState } from "react";

export default function PlayersListScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: response, isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: () => api.get<PaginatedPlayers>("/v1/players/"),
  });

  const players = response?.results || [];

  const filteredPlayers = players.filter((p) =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <TouchableOpacity 
      style={styles.playerCard} 
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: "/profile", params: { id: item.id } })}
    >
      <View style={styles.playerInfo}>
        <PlayerAvatar 
            player={item}
            theme={theme}
            isDark={isDark}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.playerName}>
            {item.full_name}
          </Text>
          <Text style={styles.playerDetails}>
            {item.position || "Jugador"} • Media {item.overall_rating || "S/N"}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={theme.textSecondary} opacity={0.5} />
    </TouchableOpacity>
  );

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <LayoutHeader title="JUGADORES" showBackButton={true} />

      <View style={styles.content}>
        {/* Search Bar - Placeholder for future functionality */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={theme.textSecondary} />
            <Text style={styles.searchText}>Buscar jugador...</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : filteredPlayers.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No se encontraron jugadores</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPlayers}
            renderItem={renderPlayerItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    searchContainer: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
      marginTop: 10,
    },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      paddingHorizontal: 15,
      height: 50,
      borderRadius: 12,
      gap: 10,
    },
    searchText: {
      color: theme.textSecondary,
      fontSize: 14,
    },
    filterButton: {
      width: 50,
      height: 50,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    listContent: {
      paddingBottom: 40,
    },
    playerCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)",
      padding: 12,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    playerInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },
    nameContainer: {
      gap: 2,
    },
    playerName: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    playerDetails: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 14,
    },
  });
