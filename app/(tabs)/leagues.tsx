import { BackgroundGradient } from "@/components/BackgroundGradient";
import { LayoutHeader } from "@/components/LayoutHeader";
import { CreateLeagueModal } from "@/components/leagues/CreateLeagueModal";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { League, LeaguesResponse } from "@/types/league";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ChevronRight,
  CircleDot,
  Layout,
  Medal,
  Plus,
  Search,
  Trophy,
  Venus,
  X
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Fallback images array for a premium look
const FALLBACK_IMAGES = [
  "https://images.pexels.com/photos/209637/pexels-photo-209637.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/159515/football-gridiron-soccer-pitch-159515.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const getLeagueImage = (index: number) =>
  FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

const GAME_FORMATS = [
  { id: "1", name: "FÚTBOL 7", icon: CircleDot },
  { id: "2", name: "FÚTBOL 11", icon: Layout },
  { id: "3", name: "WOMEN'S", icon: Venus },
  { id: "4", name: "VETERAN", icon: Medal },
];

export default function LeaguesExplorerScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const scrollRef = useRef<ScrollView>(null);
  const nearbySectionRef = useRef<View>(null);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<LeaguesResponse>("/v1/leagues/");
      setLeagues(response.results);
    } catch (error) {
      console.error("Error fetching leagues:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeagues = leagues.filter(
    (league) =>
      league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      league.city.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const scrollToNearby = () => {
    scrollRef.current?.scrollTo({ y: 600, animated: true });
  };

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={GlobalStyles.safeArea} edges={["top"]}>
        <LayoutHeader />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.webContainer}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Search size={20} color={theme.textSecondary} />
                <TextInput
                  placeholder="ENCUENTRA TU PRÓXIMA ARENA..."
                  placeholderTextColor={theme.textSecondary}
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <X size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Featured Leagues */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionOverline}>COMPETICIONES ELITE</Text>
                <Text style={styles.sectionTitle}>LIGAS DESTACADAS</Text>
              </View>
              <TouchableOpacity onPress={scrollToNearby}>
                <Text style={styles.viewAllText}>VER TODO</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              snapToInterval={width * 0.85 + 20}
              decelerationRate="fast"
            >
              {isLoading ? (
                <View
                  style={{
                    width: width - 40,
                    height: 220,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator color={theme.primary} size="large" />
                </View>
              ) : filteredLeagues.length > 0 ? (
                filteredLeagues.map((league, index) => (
                  <TouchableOpacity
                    key={league.id}
                    style={styles.featuredCard}
                    onPress={() =>
                      router.push({
                        pathname: "/league-detail",
                        params: { id: league.id },
                      })
                    }
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: getLeagueImage(index) }}
                      style={styles.featuredImage}
                    />
                    <LinearGradient
                      colors={[
                        "transparent",
                        isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)",
                        "rgba(0,0,0,0.9)",
                      ]}
                      style={styles.featuredGradient}
                    />
                    <View style={styles.featuredContent}>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>
                          INSCRIPCIONES ABIERTAS
                        </Text>
                      </View>
                      <Text style={styles.featuredName}>{league.name}</Text>
                      <View style={styles.featuredCategoryRow}>
                        <Trophy size={14} color={theme.primary} />
                        <Text style={styles.featuredCategory}>
                          {league.city}, {league.country}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View
                  style={{
                    width: width - 40,
                    height: 220,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: theme.textSecondary }}>
                    No se encontraron ligas destacadas
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Game Formats */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>FORMATOS DE JUEGO</Text>
            </View>

            <View style={styles.formatsGrid}>
              {GAME_FORMATS.map((format) => {
                const Icon = format.icon;
                return (
                  <TouchableOpacity key={format.id} style={styles.formatCard}>
                    <Icon
                      size={28}
                      color={theme.primary}
                      style={{ marginBottom: 8 }}
                    />
                    <Text style={styles.formatName}>{format.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Nearby Competitions */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>COMPETICIONES CERCANAS</Text>
              </View>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>Todas las distancias</Text>
              </TouchableOpacity>
            </View>

            {filteredLeagues.length > 0
              ? filteredLeagues.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.nearbyCard}
                    onPress={() =>
                      router.push({
                        pathname: "/league-detail",
                        params: { id: item.id },
                      })
                    }
                  >
                    <View style={styles.nearbyLogo}>
                      <View style={styles.logoCircle}>
                        <Trophy
                          size={20}
                          color={
                            isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)"
                          }
                        />
                      </View>
                    </View>
                    <View style={styles.nearbyInfo}>
                      <Text style={styles.nearbyName}>{item.name}</Text>
                      <View style={styles.nearbyMetaRow}>
                        <Text style={styles.nearbyMeta}>📍 {item.city}</Text>
                        <Text style={styles.nearbyMeta}>
                          {" "}
                          • 🗓️ {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.nearbyStatusColumn}>
                      <Text
                        style={[styles.nearbyStatus, { color: theme.primary }]}
                      >
                        ACTIVA
                      </Text>
                      <ChevronRight size={18} color={theme.textSecondary} />
                    </View>
                  </TouchableOpacity>
                ))
              : !isLoading && (
                  <View style={styles.emptyState}>
                    <Trophy
                      size={40}
                      color={theme.textSecondary}
                      opacity={0.3}
                      style={{ marginBottom: 15 }}
                    />
                    <Text style={styles.emptyStateTitle}>
                      Explora nuevas arenas
                    </Text>
                    <Text style={styles.emptyStateSub}>
                      No encontramos ligas con ese nombre. Intenta con otra
                      búsqueda.
                    </Text>
                  </View>
                )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => setIsModalVisible(true)}
        >
          <Plus size={28} color="#001A2C" />
        </TouchableOpacity>

        {/* Create League Modal */}
        <CreateLeagueModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSuccess={fetchLeagues}
        />
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: 120,
    },
    webContainer: {
      maxWidth: 800,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: 20,
    },
    searchContainer: {
      marginTop: 10,
      marginBottom: 20,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 14,
      paddingHorizontal: 15,
      height: 50,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    searchInput: {
      flex: 1,
      color: theme.text,
      marginLeft: 10,
      fontSize: 14,
      fontWeight: "600",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginTop: 25,
      marginBottom: 15,
    },
    sectionOverline: {
      fontSize: 9,
      fontWeight: "800",
      color: theme.primary,
      letterSpacing: 1,
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: "900",
      color: theme.text,
      fontStyle: "italic",
      letterSpacing: 0.5,
    },
    viewAllText: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.primary,
      letterSpacing: 0.5,
    },
    featuredList: {
      paddingRight: 20,
    },
    featuredCard: {
      width: width * 0.85,
      height: 220,
      borderRadius: 20,
      overflow: "hidden",
      marginRight: 20,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.08)",
      elevation: isDark ? 0 : 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.18,
      shadowRadius: 12,
    },
    featuredImage: {
      width: "100%",
      height: "100%",
    },
    featuredGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    featuredContent: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
    },
    statusBadge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: "flex-start",
      marginBottom: 10,
    },
    statusText: {
      fontSize: 9,
      fontWeight: "900",
      color: "#000",
    },
    featuredName: {
      fontSize: 22,
      fontWeight: "800",
      color: "#FFF",
      marginBottom: 4,
    },
    featuredCategoryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    featuredCategory: {
      fontSize: 11,
      fontWeight: "700",
      color: "rgba(255,255,255,0.7)",
      letterSpacing: 0.5,
    },
    formatsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 15,
    },
    formatCard: {
      width: (width - 55) / 2,
      backgroundColor: theme.surface,
      padding: 25,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      elevation: isDark ? 0 : 2,
    },
    formatName: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: 0.5,
    },
    filterButton: {
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    filterText: {
      fontSize: 11,
      color: theme.text,
      fontWeight: "600",
    },
    nearbyCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      elevation: isDark ? 0 : 2,
    },
    nearbyLogo: {
      marginRight: 15,
    },
    logoCircle: {
      width: 50,
      height: 50,
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      justifyContent: "center",
      alignItems: "center",
    },
    nearbyInfo: {
      flex: 1,
    },
    nearbyName: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 4,
    },
    nearbyMetaRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    nearbyMeta: {
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: "600",
    },
    nearbyStatusColumn: {
      alignItems: "flex-end",
      gap: 8,
    },
    nearbyStatus: {
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
    fab: {
      position: "absolute",
      bottom: 115,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 10,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.3 : 0.6,
      shadowRadius: 12,
    },
    emptyState: {
      padding: 60,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 8,
    },
    emptyStateSub: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });
