import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { LayoutHeader } from "@/components/ui/layout/LayoutHeader";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { CreatePlayerModal } from "@/components/players/CreatePlayerModal";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { AuthStorage } from "@/features/auth/services/authStorage";
import { Match, PaginatedMatches, TeamFeedResponse } from "@/features/tournaments/types/match";
import { PaginatedPlayers, Player } from "@/features/players/types/player";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Plus,
  Search,
  TrendingUp,
  Trophy,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useMatchLiveUpdate } from "@/hooks/useMatchLiveUpdate";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

const MatchRow = React.memo(({ match, teamName, theme, styles, t, i18n }: any) => {
  if (!match) return null;
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  
  // Determinamos el oponente
  const isHome = match.home_team_name.includes(teamName);
  
  return (
    <TouchableOpacity 
      style={styles.miniMatchRow}
      activeOpacity={0.7}
      delayPressIn={80}
      onPress={() => router.push({
        pathname: '/match-detail',
        params: { id: match.id }
      })}
    >
      <View style={styles.miniMatchTeams}>
        <View style={styles.miniTeamCol}>
           <View style={[styles.miniBadge, { backgroundColor: theme.primary + '10' }]} />
           <Text style={styles.miniTeamName} numberOfLines={1}>
             {isHome ? match.home_team_name.substring(0, 3).toUpperCase() : match.away_team_name.substring(0, 3).toUpperCase()}
           </Text>
        </View>
        
        <View style={styles.miniScoreCol}>
          {isLive || isFinished ? (
            <>
              <Text style={styles.miniScoreText}>
                {match.result?.home_score ?? 0} - {match.result?.away_score ?? 0}
              </Text>
              <Text style={[styles.miniStatusText, isLive && { color: '#FF4B4B' }]}>
                {isLive ? t('home.status_live') : t('home.status_finished')}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.miniDateText}>
                {new Date(match.start_datetime).toLocaleDateString(i18n.language, { weekday: 'short' }).toUpperCase()}
              </Text>
              <Text style={styles.miniTimeText}>
                {new Date(match.start_datetime).toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </>
          )}
        </View>

        <View style={styles.miniTeamCol}>
           <View style={[styles.miniBadge, { backgroundColor: theme.primary + '10' }]} />
           <Text style={styles.miniTeamName} numberOfLines={1}>
             {isHome ? match.away_team_name.substring(0, 3).toUpperCase() : match.home_team_name.substring(0, 3).toUpperCase()}
           </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const FeaturedMatchCard = React.memo(({ team, isDark, theme, width, styles, t, i18n }: any) => {
  const matches = team.matches || [];
  
  // Encontramos el partido en curso o el último jugado
  const activeMatch = matches.find((m: any) => m.status === 'live' || m.status === 'finished') || matches[0];
  // Encontramos el próximo partido
  const upMatch = matches.find((m: any) => m.status === 'scheduled' && m.id !== activeMatch?.id);

  if (matches.length === 0) {
    return (
      <View style={[styles.featuredCard, { width: width - 40 }]}>
        <LinearGradient
          colors={isDark ? [theme.surface, "#0A1525"] : ["#FFFFFF", "#F3F4F6"]}
          style={styles.cardGradient}
        >
          <View style={styles.emptyFeaturedCard}>
            <Trophy size={32} color={theme.textSecondary} opacity={0.3} />
            <Text style={styles.emptyFeaturedTitle}>{team.name.toUpperCase()}</Text>
            <Text style={styles.emptyFeaturedSubtitle}>{t('home.no_matches')}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.featuredCard, { width: width - 40 }]}>
      <LinearGradient
        colors={isDark ? ["#2D1B4E", "#1A1030"] : ["#FFFFFF", "#F3F4F6"]}
        style={styles.cardGradient}
      >
        <View style={styles.groupedHeader}>
          <View style={styles.groupedTeamInfo}>
            {team.logo ? (
              <Image source={{ uri: team.logo }} style={styles.headerTeamLogo} />
            ) : (
              <View style={[styles.headerTeamLogo, { backgroundColor: theme.primary + '20' }]} />
            )}
            <Text style={styles.headerTeamName}>{team.name}</Text>
          </View>
        </View>

        <View style={styles.groupedBody}>
          <View style={styles.matchesSectionFull}>
            <MatchRow 
              match={activeMatch} 
              teamName={team.name} 
              theme={theme} 
              styles={styles} 
              t={t} 
              i18n={i18n} 
            />
            <View style={styles.matchDivider} />
            <MatchRow 
              match={upMatch} 
              teamName={team.name} 
              theme={theme} 
              styles={styles} 
              t={t} 
              i18n={i18n} 
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
});

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [isPlayersLoading, setIsPlayersLoading] = useState(true);
  const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);
  const [teamFeed, setTeamFeed] = useState<TeamFeedResponse | null>(null);

  useEffect(() => {
    loadPlayers();
    loadNextMatch();
  }, []);

  const loadPlayers = async () => {
    try {
      const res = await api.get<PaginatedPlayers>("/v1/players/");
      setPlayers(res.results);
    } catch (err) {
      console.error("Error loading players:", err);
    } finally {
      setIsPlayersLoading(false);
    }
  };

  const loadNextMatch = async () => {
    try {
      const token = await AuthStorage.getAccessToken();
      const res = await api.get<TeamFeedResponse>(
        `/v1/matches/my_team_feed/?token=${token}`,
      );
      setTeamFeed(res);
    } catch (err) {
      console.error("Error loading team feed:", err);
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <SafeAreaView style={GlobalStyles.safeArea}>
        <LayoutHeader />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.webContainer}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionOverline}>{t('home.weekly_summary')}</Text>
                <Text
                  style={[GlobalStyles.sectionTitle, { color: theme.text }]}
                >
                  {t('home.my_teams')}
                </Text>
              </View>
            </View>

            {/* Featured Match Carousel */}
            <View style={styles.carouselContainer}>
              {teamFeed && teamFeed.teams.length > 0 ? (
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={width - 40}
                  decelerationRate="fast"
                  contentContainerStyle={styles.carouselContent}
                >
                  {teamFeed.teams.map((team) => (
                    <FeaturedMatchCard 
                      key={team.id} 
                      team={team} 
                      isDark={isDark} 
                      theme={theme} 
                      width={width}
                      styles={styles}
                      t={t}
                      i18n={i18n}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={[styles.featuredCard, { marginHorizontal: 20 }]}>
                  <LinearGradient
                    colors={isDark ? ["#1A1A1A", "#0D0D0D"] : ["#FFFFFF", "#F9FAFB"]}
                    style={[styles.cardGradient, { justifyContent: 'center', alignItems: 'center' }]}
                  >
                    <View style={styles.emptyStateDecoration}>
                      <View style={[styles.decoCircle, { top: -20, left: -20, width: 100, height: 100 }]} />
                      <View style={[styles.decoCircle, { bottom: -30, right: -40, width: 140, height: 140 }]} />
                    </View>
                    
                    <View style={styles.emptyFeaturedCard}>
                      <View style={styles.emptyIconContainer}>
                        <Calendar size={40} color={theme.primary} opacity={0.6} />
                      </View>
                      <Text style={styles.emptyFeaturedTitle}>{t('home.no_matches') || "NO MATCHES"}</Text>
                      <Text style={styles.emptyFeaturedSubtitle}>
                        {t('home.join_team_subtitle') || "Join a team to see your feed."}
                      </Text>
                      
                      <TouchableOpacity 
                        style={styles.emptyStateButton}
                        onPress={() => router.push('/leagues')}
                      >
                        <Text style={styles.emptyStateButtonText}>{t('home.explore_leagues') || "EXPLORE LEAGUES"}</Text>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </View>
              )}
            </View>

            {/* Stats Summary Area */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('home.victories')}</Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>94%</Text>
                  <TrendingUp size={16} color={theme.primary} />
                </View>
                <View style={styles.statBarContainer}>
                  <View style={[styles.statBar, { width: "94%" }]} />
                </View>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('home.goals')} / {t('profile.matches')}</Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>2.2</Text>
                  <TrendingUp size={16} color={theme.primary} />
                </View>
                <View style={styles.statBarContainer}>
                  <View style={[styles.statBar, { width: "70%" }]} />
                </View>
              </View>
            </View>

            {/* Promotional Banner */}
            <TouchableOpacity style={styles.bannerCard}>
              <LinearGradient
                colors={["#004E92", "#000428"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bannerGradient}
              >
                <View>
                  <Text style={styles.bannerOverline}>
                    LIGA DE INVIERNO 2024
                  </Text>
                  <Text style={styles.bannerTitle}>El Camino a la Gloria</Text>
                  <Text style={styles.bannerSubtitle}>
                    Inscripciones abiertas ahora.
                  </Text>
                </View>
                <View style={styles.bannerArrow}>
                  <ArrowUpRight size={20} color="#FFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Players List Section */}
            <View style={styles.sectionHeader}>
              <Text style={[GlobalStyles.sectionTitle, { color: theme.text }]}>
                {t('home.players')}
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => setIsPlayerModalVisible(true)}
                  style={styles.actionIcon}
                >
                  <Plus size={20} color={theme.primary} />
                </TouchableOpacity>
                {players.length > 0 && (
                  <TouchableOpacity onPress={() => router.push("/players-list" as any)}>
                    <Text style={styles.seeAllText}>{t('common.see_all')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {isPlayersLoading ? (
              <ActivityIndicator
                color={theme.primary}
                style={{ marginLeft: 20, marginTop: 20 }}
              />
            ) : players.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No se encontraron jugadores
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.playersScrollContent}
              >
                {players.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() =>
                      router.push({
                        pathname: "/profile",
                        params: { id: item.id },
                      })
                    }
                  >
                    <PlayerAvatar player={item} theme={theme} isDark={isDark} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* MODAL DE CREACIÓN DE JUGADOR */}
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
    emptyText: {
      fontSize: 12,
      marginLeft: 20,
      fontStyle: "italic",
    },
    webContainer: {
      maxWidth: 800,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: 20,
    },
    userHighlight: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: theme.primary,
      zIndex: 10,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 20,
      marginBottom: 15,
    },
    sectionOverline: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    bellButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(0, 245, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      justifyContent: "center",
      alignItems: "center",
    },
    carouselContainer: {
      width: "100%",
      height: 280,
      marginBottom: 30,
    },
    carouselContent: {
      gap: 0,
    },
    featuredCard: {
      height: 280,
      borderRadius: 30,
      overflow: "hidden",
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    },
    teamLogo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginBottom: 8,
    },
    cardGradient: {
      padding: 20,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    groupedHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    groupedTeamInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerTeamLogo: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    headerTeamName: {
      fontSize: 14,
      fontWeight: '800',
      color: '#FFF',
    },
    headerRefresh: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    headerTimeText: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '600',
    },
    groupedBody: {
      flex: 1,
      flexDirection: 'row',
      gap: 12,
    },
    matchesSectionFull: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.15)',
      borderRadius: 20,
      padding: 15,
      justifyContent: 'center',
    },
    miniMatchRow: {
      paddingVertical: 10,
    },
    miniMatchTeams: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    miniTeamCol: {
      alignItems: 'center',
      width: 70,
    },
    miniBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginBottom: 6,
    },
    miniTeamName: {
      fontSize: 10,
      fontWeight: '800',
      color: 'rgba(255,255,255,0.8)',
    },
    miniScoreCol: {
      alignItems: 'center',
      flex: 1,
    },
    miniScoreText: {
      fontSize: 24,
      fontWeight: '900',
      color: '#FFF',
    },
    miniStatusText: {
      fontSize: 9,
      fontWeight: '900',
      color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1,
    },
    miniDateText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#FFF',
    },
    miniTimeText: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.5)',
      marginTop: 2,
    },
    matchDivider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.1)',
      marginVertical: 15,
    },
    newsImage: {
      width: '100%',
      height: '100%',
    },
    newsOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 10,
    },
    newsTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFF',
      lineHeight: 14,
      marginBottom: 4,
    },
    newsTime: {
      fontSize: 8,
      color: 'rgba(255,255,255,0.5)',
    },
    leagueTag: {
      backgroundColor: isDark ? "rgba(0, 245, 255, 0.2)" : theme.primary + "26", // opacity 0.15
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    leagueTagText: {
      fontSize: 9,
      fontWeight: "800",
      color: theme.primary,
      letterSpacing: 0.5,
    },
    matchTime: {
      fontSize: 10,
      color: theme.textSecondary,
      fontWeight: "600",
    },
    matchdayText: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.text,
    },
    matchPhase: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 20,
    },
    matchTeams: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 25,
    },
    team: {
      alignItems: "center",
      width: "40%",
    },
    teamBadgePlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      marginBottom: 8,
    },
    teamName: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
      textAlign: "center",
    },
    vsText: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.textSecondary,
    },
    scoreText: {
      fontSize: 32,
      fontWeight: "900",
      color: theme.primary,
      marginTop: 5,
    },
    matchFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.05)",
      paddingTop: 15,
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    locationText: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    viewDetailsButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.03)",
    },
    viewDetailsText: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.text,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 25,
    },
    statBox: {
      width: (width - 55) / 2,
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 15,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.08)",
      elevation: isDark ? 0 : 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.12,
      shadowRadius: 8,
    },
    statLabel: {
      fontSize: 9,
      fontWeight: "700",
      color: theme.textSecondary,
      marginBottom: 5,
    },
    statValueContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.text,
    },
    statBarContainer: {
      height: 4,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      borderRadius: 2,
      overflow: "hidden",
    },
    statBar: {
      height: "100%",
      backgroundColor: theme.primary,
    },
    bannerCard: {
      width: "100%",
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 25,
    },
    bannerGradient: {
      padding: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    bannerOverline: {
      fontSize: 9,
      fontWeight: "800",
      color: "rgba(255, 255, 255, 0.7)",
      marginBottom: 4,
    },
    bannerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#FFF",
    },
    bannerSubtitle: {
      fontSize: 12,
      color: "rgba(255, 255, 255, 0.6)",
    },
    bannerArrow: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    seeAllText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.primary,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
    },
    playersScrollContent: {
      paddingRight: 20,
      marginBottom: 20,
    },
    playerContainer: {
      alignItems: "center",
      marginRight: 20,
    },
    avatarBorder: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: isDark ? "rgba(0, 245, 255, 0.3)" : theme.primary + "4D", // opacity 0.3
      padding: 3,
      marginBottom: 8,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: 29,
    },
    playerName: {
      fontSize: 11,
      fontWeight: "500",
    },
    emptyFeaturedCard: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 30,
      zIndex: 1,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.primary + '20',
    },
    emptyFeaturedTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: theme.text,
      letterSpacing: 1,
      marginBottom: 8,
    },
    emptyFeaturedSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: "center",
      paddingHorizontal: 40,
      lineHeight: 20,
      marginBottom: 25,
    },
    emptyStateDecoration: {
      ...StyleSheet.absoluteFillObject,
      overflow: 'hidden',
    },
    decoCircle: {
      position: 'absolute',
      borderRadius: 100,
      backgroundColor: theme.primary + '05',
    },
    emptyStateButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      elevation: 4,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    emptyStateButtonText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#001A2C',
      letterSpacing: 0.5,
    },
    playerSection: {
        marginTop: 10,
    }
  });
