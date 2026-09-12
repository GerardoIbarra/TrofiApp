import { CreatePlayerModal } from "@/components/players/CreatePlayerModal";
import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { LayoutHeader } from "@/components/ui/layout/LayoutHeader";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { moderateScale, verticalScale } from "@/constants/layout";
import { useTheme } from "@/context/ThemeContext";
import { PaginatedPlayers, Player } from "@/features/players/types/player";
import api from "@/services/api";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useGetHomeFeed } from "@/features/matches/services/homeFeedApi";
import { HomeFeaturedCarousel } from "@/components/home/HomeFeaturedCarousel";
import { HomeStatsSummary } from "@/components/home/HomeStatsSummary";
import { HomePlayersList } from "@/components/home/HomePlayersList";

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [isPlayersLoading, setIsPlayersLoading] = useState(true);
  const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: homeFeed = [],
    isLoading: isHomeFeedLoading,
    refetch: refetchHomeFeed,
  } = useGetHomeFeed();

  const loadPlayers = useCallback(async () => {
    try {
      const res = await api.get<PaginatedPlayers>("/v1/players/");
      setPlayers(res.results);
    } catch (err) {
      console.error("Error loading players:", err);
    } finally {
      setIsPlayersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchHomeFeed(), loadPlayers()]);
    setRefreshing(false);
  }, [refetchHomeFeed, loadPlayers]);

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <LayoutHeader />

        <ScrollView
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
            {/* Header / Title */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionOverline}>
                  {t("home.weekly_summary") || "RESUMEN"}
                </Text>
                <Text
                  style={[GlobalStyles.sectionTitle, { color: theme.text }]}
                >
                  {t("home.my_matches", "Tus Partidos")}
                </Text>
              </View>
            </View>

            {/* Featured Matches Carousel */}
            <HomeFeaturedCarousel
              homeFeed={homeFeed}
              isLoading={isHomeFeedLoading}
              activeCardIndex={activeCardIndex}
              onCardIndexChange={setActiveCardIndex}
              onExploreLeagues={() => router.push("/leagues")}
            />

            {/* Stats Summary & Tournament Banner */}
            <HomeStatsSummary
              onPressBanner={() => router.push("/leagues")}
            />

            {/* Players Horizontal List */}
            <HomePlayersList
              players={players}
              isLoading={isPlayersLoading}
              onAddPlayer={() => setIsPlayerModalVisible(true)}
              onSeeAll={() => router.push("/players-list" as any)}
              onSelectPlayer={(id) =>
                router.push({
                  pathname: "/profile",
                  params: { id },
                })
              }
            />
          </View>
        </ScrollView>

      {/* Modal de Creación de Jugador */}
      <CreatePlayerModal
        visible={isPlayerModalVisible}
        onClose={() => setIsPlayerModalVisible(false)}
        onSuccess={loadPlayers}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: 110,
    },
    webContainer: {
      maxWidth: 800,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: verticalScale(20),
      marginBottom: verticalScale(15),
    },
    sectionOverline: {
      fontSize: moderateScale(10),
      fontWeight: "700",
      color: theme.textSecondary,
      letterSpacing: 1,
    },
  });
