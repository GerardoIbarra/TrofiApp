import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { LayoutHeader } from "@/components/ui/layout/LayoutHeader";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import api from "@/services/api";
import { Player, PaginatedPlayers } from "@/features/players/types/player";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { ChevronRight, Search, Filter } from "lucide-react-native";
import { useState } from "react";

export default function PlayersListScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  const { data: response, isLoading } = useQuery({
    queryKey: ["players", debouncedSearch],
    queryFn: () => api.get<PaginatedPlayers>(`/v1/players/${debouncedSearch ? `?search=${debouncedSearch}` : ''}`),
  });

  const players = response?.results || [];

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
            {(item.position || t('players.player'))} • {t('players.rating')} {item.overall_rating || "S/N"}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={theme.textSecondary} opacity={0.5} />
    </TouchableOpacity>
  );

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <LayoutHeader title={t('players.title')} showBackButton={true} />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={theme.textSecondary} />
            <TextInput 
              style={styles.searchText} 
              placeholder={t('players.search_placeholder')}
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => Alert.alert("Próximamente", "Los filtros avanzados estarán disponibles muy pronto.")}
          >
            <Filter size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : players.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>{t('players.no_players')}</Text>
          </View>
        ) : (
          <FlatList
            data={players}
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
      flex: 1,
      color: theme.text,
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
