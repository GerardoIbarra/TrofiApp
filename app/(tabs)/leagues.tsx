import { CreateLeagueModal } from "@/components/leagues/CreateLeagueModal";
import { useBottomTabBarHeight } from "@/components/ui/layout/BottomTabBar";
import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { LayoutHeader } from "@/components/ui/layout/LayoutHeader";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/features/auth/store/authStore";
import { isTrofiStaff } from "@/features/auth/utils/profileRoles";
import { League, LeaguesResponse } from "@/features/leagues/types/league";
import api from "@/services/api";
import { LocationService } from "@/services/locationService";
import { useToast } from "@/context/ToastContext";
import { openInExternalMaps } from "@/services/mapLinking";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ChevronRight,
  CircleDot,
  Clock,
  Layout,
  Map as MapIcon,
  MapPin,
  Medal,
  Navigation,
  Plus,
  Search,
  Trophy,
  Venus,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

// Fallback images array for a premium look
const FALLBACK_IMAGES = [
  "https://images.pexels.com/photos/209637/pexels-photo-209637.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/159515/football-gridiron-soccer-pitch-159515.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const getLeagueImage = (index: number) =>
  FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

// Mismos radios que el mapa de cercanía (app/nearby-map.tsx).
const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

const GAME_FORMATS = [
  {
    id: "7v7",
    filterKey: "tournament_format",
    filterVal: "7v7",
    nameKey: "leagues.format_7",
    icon: CircleDot,
  },
  {
    id: "11v11",
    filterKey: "tournament_format",
    filterVal: "11v11",
    nameKey: "leagues.format_11",
    icon: Layout,
  },
  {
    id: "womens",
    filterKey: "gender",
    filterVal: "womens",
    nameKey: "leagues.format_women",
    icon: Venus,
  },
  {
    id: "veterans",
    filterKey: "is_veterans",
    filterVal: "true",
    nameKey: "leagues.format_veteran",
    icon: Medal,
  },
];

export default function LeaguesExplorerScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, isDark, width);
  const tabBarHeight = useBottomTabBarHeight();

  const user = useAuthStore((state) => state.user);
  const isStaff = isTrofiStaff(user);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  // Debounce backend search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const {
    data: leaguesData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "leagues-explorer",
      debouncedSearch,
      selectedFormatId,
      showPendingOnly,
      selectedRadius,
    ],
    queryFn: async (): Promise<LeaguesResponse> => {
      const params = new URLSearchParams();
      if (debouncedSearch && debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }
      if (selectedFormatId) {
        const fmt = GAME_FORMATS.find((f) => f.id === selectedFormatId);
        if (fmt) {
          params.append(fmt.filterKey, fmt.filterVal);
        }
      }
      if (showPendingOnly && isStaff) {
        params.append("approval_status", "pending");
      }
      // La ubicación viaja en los headers X-Latitude/X-Longitude (services/api.ts).
      if (selectedRadius) {
        params.append("distance_km", String(selectedRadius));
      }
      const queryStr = params.toString();
      const endpoint = queryStr ? `/v1/leagues/?${queryStr}` : "/v1/leagues/";
      const response = await api.get<any>(endpoint);
      if (Array.isArray(response)) {
        return { count: response.length, next: null, previous: null, results: response };
      }
      return {
        count: response?.count ?? 0,
        next: response?.next ?? null,
        previous: response?.previous ?? null,
        results: response?.results || [],
        detail: response?.detail,
        nearby_leagues: response?.nearby_leagues || [],
      };
    },
  });

  const leagues: League[] = leaguesData?.results || [];
  const nearestLeagues: League[] = leaguesData?.nearby_leagues || [];
  const nextRadius = selectedRadius
    ? RADIUS_OPTIONS.find((km) => km > selectedRadius)
    : undefined;

  // Sin ubicación no hay contra qué medir la distancia: pedirla al elegir un radio.
  const handleSelectRadius = async (km: number | null) => {
    if (km === null || km === selectedRadius) {
      setSelectedRadius(null);
      return;
    }
    if (!LocationService.getLocation()) {
      setIsLocating(true);
      const location = await LocationService.fetchCurrentPosition();
      setIsLocating(false);
      if (!location) {
        showToast({
          type: "info",
          title: t("leagues.location_required_title"),
          message: t("leagues.location_required_sub"),
        });
        return;
      }
    }
    setSelectedRadius(km);
  };
  const isSearching = Boolean(debouncedSearch.trim() && isFetching);
  const isFilterActive = Boolean(
    selectedFormatId || (showPendingOnly && isStaff) || selectedRadius,
  );
  const isSearchActive = debouncedSearch.trim().length > 0 || isFilterActive;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const scrollToNearby = () => {
    scrollRef.current?.scrollTo({ y: 600, animated: true });
  };

  // Tarjeta de resultado de búsqueda/filtros (también usada para las ligas
  // más cercanas que devuelve el filtro por distancia).
  const renderSearchResultCard = (item: League) => (
    <TouchableOpacity
      key={item.id}
      style={styles.nearbyCard}
      onPress={() =>
        router.push({
          pathname: "/league-detail",
          params: { id: item.id },
        })
      }
      activeOpacity={0.8}
    >
      <View style={styles.nearbyLogo}>
        <View style={styles.logoCircle}>
          {item.logo ? (
            <Image
              source={{ uri: item.logo }}
              style={styles.logoImage}
              contentFit="contain"
            />
          ) : (
            <Trophy
              size={20}
              color={
                isDark
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(0,0,0,0.4)"
              }
            />
          )}
        </View>
      </View>
      <View style={styles.nearbyInfo}>
        <View style={styles.nameStatusRow}>
          <Text style={styles.nearbyName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.approval_status === "pending" ? (
            <View style={styles.pendingBadge}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingText}>Pendiente</Text>
            </View>
          ) : item.approval_status === "rejected" ? (
            <View style={styles.rejectedBadge}>
              <View style={styles.rejectedDot} />
              <Text style={styles.rejectedText}>Rechazada</Text>
            </View>
          ) : (
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>
                {t("leagues.active_badge")}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.nearbyMetaRow}>
          <View style={[styles.metaItem, styles.metaItemShrink]}>
            <MapPin size={12} color={theme.textSecondary} />
            <Text style={[styles.nearbyMeta, styles.metaTextShrink]} numberOfLines={1}>
              {item.city || t("leagues.no_city")}
            </Text>
          </View>
          {item.country && (
            <>
              <Text style={styles.metaDivider}>•</Text>
              <Text
                style={[styles.nearbyMeta, styles.metaTextShrink]}
                numberOfLines={1}
              >
                {item.country}
              </Text>
            </>
          )}
          {item.distance_km != null && (
            <>
              <Text style={styles.metaDivider}>•</Text>
              <View style={styles.metaItem}>
                <Navigation size={11} color={theme.primary} />
                <Text
                  style={[
                    styles.nearbyMeta,
                    { color: theme.primary, fontWeight: "700" },
                  ]}
                >
                  {typeof item.distance_km === "number"
                    ? `${item.distance_km.toFixed(2)} km`
                    : `${item.distance_km} km`}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
      <View style={styles.nearbyStatusColumn}>
        <ChevronRight size={18} color={theme.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <LayoutHeader />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.webContainer}>
          {/* Search Bar & Map Button */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={theme.textSecondary} />
              <TextInput
                placeholder={t("leagues.search_placeholder")}
                placeholderTextColor={theme.textSecondary}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                autoCapitalize="none"
              />
              {isSearching ? (
                <ActivityIndicator
                  size="small"
                  color={theme.primary}
                  style={{ marginRight: 6 }}
                />
              ) : searchQuery.length > 0 ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={{ padding: 4, marginRight: 4 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => router.push("/nearby-map")}
              activeOpacity={0.8}
            >
              <MapIcon size={16} color="#000" />
              <Text style={styles.mapButtonText}>{t("leagues.view_map")}</Text>
            </TouchableOpacity>
          </View>

          {/* Filtro por distancia (?distance_km=) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.radiusBar}
          >
            <View style={styles.radiusLabel}>
              {isLocating ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Navigation size={13} color={theme.textSecondary} />
              )}
            </View>
            {[null, ...RADIUS_OPTIONS].map((km) => {
              const isActive = selectedRadius === km;
              return (
                <TouchableOpacity
                  key={`radius-${km ?? "all"}`}
                  style={[styles.radiusChip, isActive && styles.radiusChipActive]}
                  onPress={() => handleSelectRadius(km)}
                  disabled={isLocating}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    style={[
                      styles.radiusChipText,
                      isActive && styles.radiusChipTextActive,
                    ]}
                  >
                    {km === null ? t("leagues.distance_any") : `${km} km`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Staff filter chip for Pending Approval */}
          {isStaff && (
            <View style={styles.staffFilterBar}>
              <TouchableOpacity
                style={[
                  styles.staffChip,
                  showPendingOnly && styles.staffChipActive,
                ]}
                onPress={() => setShowPendingOnly((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Clock size={15} color={showPendingOnly ? "#000" : "#F59E0B"} />
                <Text
                  style={[
                    styles.staffChipText,
                    showPendingOnly && styles.staffChipTextActive,
                  ]}
                >
                  {showPendingOnly
                    ? "Mostrando: Pendientes de aprobación"
                    : "Filtrar: Pendientes de aprobación"}
                </Text>
                {showPendingOnly && (
                  <X size={14} color="#000" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* If searching or filtering from backend, display dedicated search results */}
          {isSearchActive ? (
            <View style={styles.searchResultsContainer}>
              <View style={styles.sectionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionOverline}>
                    {showPendingOnly
                      ? "PANEL DE STAFF"
                      : selectedFormatId
                        ? "FORMATO DE JUEGO"
                        : selectedRadius
                          ? t("leagues.distance_overline")
                          : t("leagues.search_overline")}
                  </Text>
                  <Text style={styles.sectionTitle}>
                    {isSearching
                      ? t("leagues.searching")
                      : showPendingOnly
                        ? `Pendientes (${leagues.length})`
                        : selectedFormatId
                          ? `${t(GAME_FORMATS.find((f) => f.id === selectedFormatId)?.nameKey || "")} (${leagues.length})`
                          : selectedRadius
                            ? t("leagues.distance_results", {
                                km: selectedRadius,
                                count: leagues.length,
                              })
                            : t("leagues.search_results", {
                              count: leagues.length,
                            })}
                  </Text>
                </View>
                {(selectedFormatId || showPendingOnly || searchQuery || selectedRadius) && (
                  <TouchableOpacity
                    style={styles.clearFilterBtn}
                    onPress={() => {
                      setSelectedFormatId(null);
                      setShowPendingOnly(false);
                      setSelectedRadius(null);
                      setSearchQuery("");
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.clearFilterText}>Limpiar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={styles.loadingText}>
                    {t("leagues.searching_server")}
                  </Text>
                </View>
              ) : leagues.length > 0 ? (
                leagues.map(renderSearchResultCard)
              ) : selectedRadius ? (
                /* Nada dentro del radio: mensaje del backend + ligas más cercanas */
                <View>
                  <View style={styles.emptyState}>
                    <Navigation
                      size={36}
                      color={theme.textSecondary}
                      opacity={0.3}
                      style={{ marginBottom: 15 }}
                    />
                    <Text style={styles.emptyStateTitle}>
                      {t("leagues.distance_empty_title")}
                    </Text>
                    <Text style={styles.emptyStateSub}>
                      {leaguesData?.detail ||
                        t("leagues.distance_empty_sub", { km: selectedRadius })}
                    </Text>
                    {nextRadius && (
                      <TouchableOpacity
                        style={styles.expandRadiusBtn}
                        onPress={() => setSelectedRadius(nextRadius)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.expandRadiusText}>
                          {t("leagues.expand_radius", { km: nextRadius })}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {nearestLeagues.length > 0 && (
                    <>
                      <Text style={styles.nearestHeader}>
                        {t("leagues.nearest_leagues")}
                      </Text>
                      {nearestLeagues.map(renderSearchResultCard)}
                    </>
                  )}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Trophy
                    size={40}
                    color={theme.textSecondary}
                    opacity={0.3}
                    style={{ marginBottom: 15 }}
                  />
                  <Text style={styles.emptyStateTitle}>
                    {t("leagues.no_search_results")}
                  </Text>
                  <Text style={styles.emptyStateSub}>
                    {t("leagues.no_search_results_sub", {
                      query: debouncedSearch,
                    })}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            /* Normal Home/Explore Content when not searching */
            <>
              {/* Featured Leagues */}
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionOverline}>
                    {t("leagues.elite_competitions")}
                  </Text>
                  <Text style={styles.sectionTitle}>
                    {t("leagues.featured_leagues")}
                  </Text>
                </View>
                <TouchableOpacity onPress={scrollToNearby}>
                  <Text style={styles.viewAllText}>
                    {t("leagues.view_all")}
                  </Text>
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
                ) : leagues.length > 0 ? (
                  leagues.map((league, index) => (
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
                        source={{
                          uri: league.background_image || getLeagueImage(index),
                        }}
                        style={styles.featuredImage}
                        contentFit="cover"
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
                            {t("leagues.active_badge")}
                          </Text>
                        </View>
                        <Text style={styles.featuredName}>{league.name}</Text>
                        <View style={styles.featuredCategoryRow}>
                          <Trophy size={14} color={theme.primary} />
                          <Text style={styles.statText}>
                            {(league as any).players_count || 0}{" "}
                            {t("leagues.players_count")}
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
                      {t("leagues.no_leagues")}
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Game Formats */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {t("leagues.game_formats")}
                </Text>
              </View>

              <View style={styles.formatsGrid}>
                {GAME_FORMATS.map((format) => {
                  const Icon = format.icon;
                  const isSelected = selectedFormatId === format.id;
                  return (
                    <TouchableOpacity
                      key={format.id}
                      style={[
                        styles.formatCard,
                        isSelected && styles.formatCardSelected,
                      ]}
                      onPress={() => {
                        setSelectedFormatId((prev) =>
                          prev === format.id ? null : format.id,
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <Icon
                        size={28}
                        color={isSelected ? theme.primary : theme.textSecondary}
                        style={{ marginBottom: 8 }}
                      />
                      <Text
                        style={[
                          styles.formatName,
                          isSelected && styles.formatNameSelected,
                        ]}
                      >
                        {t(format.nameKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Nearby Competitions */}
              <View style={styles.nearbySectionHeader}>
                <Text
                  style={styles.nearbySectionTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {t("leagues.nearby_competitions")}
                </Text>
                <TouchableOpacity
                  style={styles.mapLink}
                  onPress={() => router.push("/nearby-map")}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MapIcon size={14} color="#001A2C" />
                  <Text style={styles.mapLinkText}>
                    {t("leagues.view_map")}
                  </Text>
                </TouchableOpacity>
              </View>

              {leagues.length > 0
                ? leagues.map((item) => (
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
                          {item.logo ? (
                            <Image
                              source={{ uri: item.logo }}
                              style={styles.logoImage}
                              contentFit="contain"
                            />
                          ) : (
                            <Trophy
                              size={20}
                              color={
                                isDark
                                  ? "rgba(255,255,255,0.6)"
                                  : "rgba(0,0,0,0.4)"
                              }
                            />
                          )}
                        </View>
                      </View>
                      <View style={styles.nearbyInfo}>
                        <View style={styles.nameStatusRow}>
                          <Text style={styles.nearbyName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          {item.approval_status === "pending" ? (
                            <View style={styles.pendingBadge}>
                              <View style={styles.pendingDot} />
                              <Text style={styles.pendingText}>Pendiente</Text>
                            </View>
                          ) : item.approval_status === "rejected" ? (
                            <View style={styles.rejectedBadge}>
                              <View style={styles.rejectedDot} />
                              <Text style={styles.rejectedText}>Rechazada</Text>
                            </View>
                          ) : (
                            <View style={styles.activeBadge}>
                              <View style={styles.activeDot} />
                              <Text style={styles.activeText}>
                                {t("leagues.active_badge")}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.nearbyMetaRow}>
                          <View style={[styles.metaItem, styles.metaItemShrink]}>
                            <MapPin size={12} color={theme.textSecondary} />
                            <Text style={[styles.nearbyMeta, styles.metaTextShrink]} numberOfLines={1}>
                              {item.city || t("leagues.no_city")}
                            </Text>
                          </View>
                          {item.distance_km != null && (
                            <>
                              <Text style={styles.metaDivider}>•</Text>
                              <View style={styles.metaItem}>
                                <Navigation size={11} color={theme.primary} />
                                <Text
                                  style={[
                                    styles.nearbyMeta,
                                    { color: theme.primary, fontWeight: "700" },
                                  ]}
                                >
                                  {typeof item.distance_km === "number"
                                    ? `${item.distance_km.toFixed(2)} km`
                                    : `${item.distance_km} km`}
                                </Text>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                      <View style={styles.nearbyStatusColumn}>
                        <TouchableOpacity
                          style={styles.nearbyMapBtn}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            openInExternalMaps({
                              latitude: item.latitude,
                              longitude: item.longitude,
                              title: item.name,
                              query: [item.city, item.country]
                                .filter(Boolean)
                                .join(", "),
                            });
                          }}
                          activeOpacity={0.7}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Navigation size={15} color={theme.primary} />
                        </TouchableOpacity>
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
                        {t("leagues.empty_explore_title")}
                      </Text>
                      <Text style={styles.emptyStateSub}>
                        {t("leagues.empty_explore_sub")}
                      </Text>
                    </View>
                  )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: tabBarHeight + 16 }]}
        activeOpacity={0.8}
        onPress={() => setIsModalVisible(true)}
      >
        <Plus size={26} color="#001A2C" />
      </TouchableOpacity>

      {/* Create League Modal */}
      <CreateLeagueModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean, width: number) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: 150,
    },
    webContainer: {
      width: "100%",
      maxWidth: 800,
      alignSelf: "center",
    },
    searchContainer: {
      paddingHorizontal: 20,
      marginTop: 10,
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 20,
      paddingHorizontal: 15,
      height: 50,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      elevation: isDark ? 0 : 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 5,
    },
    mapButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.primary,
      height: 50,
      paddingHorizontal: 14,
      borderRadius: 20,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    mapButtonText: {
      color: "#000",
      fontWeight: "800",
      fontSize: 12,
    },
    addLeagueButton: {
      width: 50,
      height: 50,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    nearbySectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 15,
      marginTop: 10,
      gap: 12,
    },
    nearbySectionTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: "900",
      fontStyle: "italic",
      color: theme.text,
      letterSpacing: 0.5,
    },
    mapLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 14,
      flexShrink: 0,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 2,
    },
    mapLinkText: {
      fontSize: 12,
      fontWeight: "900",
      color: "#001A2C",
      letterSpacing: 0.2,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      color: theme.text,
      fontSize: 14,
      fontWeight: "500",
    },
    filterBtn: {
      padding: 6,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      borderRadius: 10,
    },
    searchResultsContainer: {
      paddingHorizontal: 20,
      marginTop: 4,
    },
    loadingContainer: {
      paddingVertical: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginTop: 14,
      color: theme.textSecondary,
      fontSize: 13,
      fontWeight: "500",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingHorizontal: 20,
      marginBottom: 15,
      marginTop: 10,
    },
    sectionOverline: {
      fontSize: 11,
      fontWeight: "900",
      color: theme.primary,
      letterSpacing: 1,
      marginBottom: 2,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "900",
      fontStyle: "italic",
      color: theme.text,
      letterSpacing: 0.5,
    },
    viewAllText: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.primary,
      letterSpacing: 0.5,
    },
    featuredList: {
      paddingHorizontal: 20,
      gap: 15,
      paddingBottom: 10,
    },
    featuredCard: {
      width: width * 0.85,
      maxWidth: 380,
      height: 220,
      borderRadius: 24,
      overflow: "hidden",
      position: "relative",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      elevation: isDark ? 0 : 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.1,
      shadowRadius: 10,
    },
    featuredImage: {
      width: "100%",
      height: "100%",
      position: "absolute",
    },
    featuredGradient: {
      width: "100%",
      height: "100%",
      position: "absolute",
    },
    featuredContent: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
    },
    statusBadge: {
      alignSelf: "flex-start",
      backgroundColor: theme.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginBottom: 8,
    },
    statusText: {
      color: "#001A2C",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    featuredName: {
      fontSize: 24,
      fontWeight: "900",
      color: "#FFFFFF",
      marginBottom: 6,
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    featuredCategoryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    formatsGrid: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginBottom: 25,
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
    formatCardSelected: {
      borderColor: theme.primary,
      backgroundColor: isDark
        ? "rgba(0, 245, 255, 0.1)"
        : "rgba(0, 245, 255, 0.12)",
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    },
    formatName: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: 0.5,
    },
    formatNameSelected: {
      color: theme.primary,
    },
    radiusBar: {
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 20,
      marginTop: 10,
    },
    radiusLabel: {
      width: 20,
      alignItems: "center",
    },
    radiusChip: {
      minHeight: 36,
      justifyContent: "center",
      paddingHorizontal: 14,
      borderRadius: 18,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
      borderWidth: 1,
      borderColor: "transparent",
    },
    radiusChipActive: {
      borderColor: theme.primary,
      backgroundColor: isDark ? "rgba(0, 245, 255, 0.08)" : "rgba(0, 245, 255, 0.12)",
    },
    radiusChipText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.textSecondary,
    },
    radiusChipTextActive: {
      color: theme.primary,
    },
    expandRadiusBtn: {
      marginTop: 16,
      minHeight: 44,
      justifyContent: "center",
      paddingHorizontal: 20,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    expandRadiusText: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.primary,
    },
    nearestHeader: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: theme.textSecondary,
      marginHorizontal: 20,
      marginBottom: 12,
    },
    staffFilterBar: {
      paddingHorizontal: 20,
      marginTop: 10,
      marginBottom: 4,
    },
    staffChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(245, 158, 11, 0.12)"
        : "rgba(245, 158, 11, 0.15)",
      borderWidth: 1,
      borderColor: "rgba(245, 158, 11, 0.35)",
      alignSelf: "flex-start",
    },
    staffChipActive: {
      backgroundColor: "#F59E0B",
      borderColor: "#F59E0B",
    },
    staffChipText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#F59E0B",
    },
    staffChipTextActive: {
      color: "#000",
      fontWeight: "800",
    },
    clearFilterBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.05)",
    },
    clearFilterText: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.primary,
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
      marginHorizontal: 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      elevation: isDark ? 0 : 2,
    },
    nearbyLogo: {
      marginRight: 15,
    },
    logoCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    logoImage: {
      width: "100%",
      height: "100%",
    },
    nearbyInfo: {
      flex: 1,
      minWidth: 0,
      justifyContent: "center",
      paddingRight: 6,
    },
    nameStatusRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 4,
    },
    nearbyName: {
      flex: 1,
      fontSize: 16,
      fontWeight: "800",
      color: theme.text,
    },
    activeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: theme.primary + "15",
      borderWidth: 0.5,
      borderColor: theme.primary + "30",
    },
    activeDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: theme.primary,
    },
    activeText: {
      fontSize: 9,
      fontWeight: "900",
      color: theme.primary,
      letterSpacing: 0.5,
    },
    pendingBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: "rgba(245, 158, 11, 0.15)",
      borderWidth: 0.5,
      borderColor: "rgba(245, 158, 11, 0.3)",
    },
    pendingDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: "#F59E0B",
    },
    pendingText: {
      fontSize: 9,
      fontWeight: "900",
      color: "#F59E0B",
      letterSpacing: 0.5,
    },
    rejectedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: "rgba(239, 68, 68, 0.15)",
      borderWidth: 0.5,
      borderColor: "rgba(239, 68, 68, 0.3)",
    },
    rejectedDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: "#EF4444",
    },
    rejectedText: {
      fontSize: 9,
      fontWeight: "900",
      color: "#EF4444",
      letterSpacing: 0.5,
    },
    nearbyMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minWidth: 0,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    // iOS no recorta hijos desbordados (Android sí): ciudad/país ceden espacio
    // y se truncan para que la distancia nunca se salga de la tarjeta.
    metaItemShrink: {
      flexShrink: 1,
      minWidth: 0,
    },
    metaTextShrink: {
      flexShrink: 1,
    },
    metaDivider: {
      color: theme.textSecondary,
      opacity: 0.3,
      fontSize: 12,
    },
    nearbyMeta: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "600",
    },
    statText: {
      fontSize: 12,
      color: "#FFFFFF",
      fontWeight: "700",
    },
    nearbyStatusColumn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingLeft: 8,
    },
    nearbyMapBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: isDark
        ? "rgba(0, 245, 255, 0.1)"
        : "rgba(0, 245, 255, 0.12)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(0, 245, 255, 0.25)"
        : "rgba(0, 245, 255, 0.35)",
    },
    emptyState: {
      paddingVertical: 40,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 6,
    },
    emptyStateSub: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: "center",
      maxWidth: 280,
    },
    fab: {
      position: "absolute",
      bottom: 90,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
  });
