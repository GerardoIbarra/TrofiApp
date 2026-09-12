import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useTheme } from "@/context/ThemeContext";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CreateLeagueModal } from "@/components/leagues/CreateLeagueModal";
import { CreateTournamentModal } from "@/components/leagues/CreateTournamentModal";
import { LeagueHeader } from "@/components/leagues/LeagueHeader";
import { LeagueMembersWidget } from "@/components/leagues/LeagueMembersWidget";
import { LeagueTabsList } from "@/components/leagues/LeagueTabsList";
import { LeagueTournamentsWidget } from "@/components/leagues/LeagueTournamentsWidget";
import { EloRankingWidget } from "@/components/leagues/EloRankingWidget";
import { LeagueSponsorsWidget } from "@/components/leagues/LeagueSponsorsWidget";
import { NotFoundState } from "@/components/ui/feedback/NotFoundState";
import { AnnouncementsWidget } from "@/components/announcements/AnnouncementsWidget";
import { ChatBox } from "@/components/chat/ChatBox";
import api from "@/services/api";
import { useAuthStore } from "@/features/auth/store/authStore";
import { League } from "@/features/leagues/types/league";
import { useGetLeagueAchievements } from "@/features/achievements/services/achievementsApi";
import { useLocalSearchParams, router } from "expo-router";
import {
  Award,
  CreditCard,
  MessageSquare,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Zap,
  Clock,
  AlertTriangle,
} from "lucide-react-native";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";

export default function LeagueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("STANDINGS");
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isTournamentModalVisible, setIsTournamentModalVisible] =
    useState(false);

  const user = useAuthStore((state) => state.user);
  const isOwner = user?.id === league?.created_by;
  const isLeagueAdmin = league?.memberships?.some(
    (m: any) => (m.user === user?.id || m.user_id === user?.id) && (m.role === 'admin' || m.role === 'owner')
  );
  const canManage = isOwner || isLeagueAdmin || Boolean(user?.is_staff || user?.is_superuser);
  const [refreshTournamentsKey, setRefreshTournamentsKey] = useState(0);

  const { data: leagueAchievements = [] } = useGetLeagueAchievements(id);

  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  useEffect(() => {
    if (id) {
      fetchLeagueDetails();
    }
  }, [id]);

  const fetchLeagueDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<League>(`/v1/leagues/${id}/`);
      setLeague(response);
    } catch (error) {
      console.error("Error fetching league details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const FEATURE_CONFIG = [
    { key: "payments_enabled", label: t("league_detail.feature_payments"), icon: CreditCard },
    { key: "qr_checkin_enabled", label: t("league_detail.feature_qr"), icon: QrCode },
    { key: "comms_enabled", label: t("league_detail.feature_chat"), icon: MessageSquare },
    { key: "discipline_enabled", label: t("league_detail.feature_discipline"), icon: ShieldCheck },
    { key: "player_market_enabled", label: t("league_detail.feature_market"), icon: ShoppingBag },
    { key: "sponsors_enabled", label: t("league_detail.feature_sponsors"), icon: Award },
    { key: "white_label_enabled", label: t("league_detail.feature_premium"), icon: Zap },
  ];

  const activeFeatures = FEATURE_CONFIG.filter(
    (f) => league?.features?.[f.key as keyof typeof league.features],
  );

  const dynamicTabs = ["STANDINGS", "RANKING ELO", "MATCHES"];
  if (league?.features?.comms_enabled) {
    dynamicTabs.push("NEWS");
    dynamicTabs.push("CHAT");
  }
  dynamicTabs.push("PLAYERS");
  if (league?.features?.payments_enabled) dynamicTabs.push("PAYMENTS");
  if (league?.features?.sponsors_enabled) dynamicTabs.push("SPONSORS");

  // Fallback to first tab if activeTab is not in dynamicTabs
  useEffect(() => {
    if (league && dynamicTabs.length > 0 && !dynamicTabs.includes(activeTab)) {
      setActiveTab(dynamicTabs[0]);
    }
  }, [id, activeTab, league === null]); // Only care if league just loaded or id changed

  if (isLoading) {
    return (
      <View
        style={[
          GlobalStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <BackgroundGradient />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!league) {
    return (
      <NotFoundState
        title={t("league_detail.not_found_title")}
        message={t("league_detail.not_found_text")}
        actionLabel={t("league_detail.go_back")}
        onAction={() => router.back()}
      />
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "PLAYERS":
        return <LeagueMembersWidget leagueId={league.id} />;
      case "PAYMENTS":
        return (
          <View style={styles.comingSoonBox}>
            <Text style={styles.comingSoonText}>
              {t("league_detail.payments_coming_soon")}
            </Text>
          </View>
        );
      case "RANKING ELO":
        return <EloRankingWidget leagueId={league.id} />;
      case "STANDINGS":
        return (
          <LeagueTournamentsWidget
            leagueId={league.id}
            canManage={canManage}
            onAddTournament={() => setIsTournamentModalVisible(true)}
            refreshKey={refreshTournamentsKey}
          />
        );
      case "SPONSORS":
        return <LeagueSponsorsWidget leagueId={league.id} />;
      case "NEWS":
        return <AnnouncementsWidget leagueId={league.id} canManage={canManage} />;
      case "CHAT":
        return <ChatBox leagueId={league.id} title={`Chat de ${league.name}`} />;
      default:
        return (
          <View style={styles.comingSoonBox}>
            <Text style={styles.comingSoonText}>
              {t("league_detail.stats_available_soon", { tab: activeTab.toLowerCase() })}
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.webContainer}>
          {/* ENCABEZADO MONUMENTAL */}
          <LeagueHeader
            league={league}
            onEditPress={() => setIsEditModalVisible(true)}
          />

          {league.approval_status === 'pending' && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              padding: 10,
              borderRadius: 12,
              marginHorizontal: 20,
              marginTop: 10,
              borderWidth: 1,
              borderColor: 'rgba(245, 158, 11, 0.3)'
            }}>
              <Clock size={16} color="#F59E0B" />
              <Text style={{ fontSize: 12, color: '#F59E0B', fontWeight: '700', flex: 1 }}>
                Liga Pendiente de Aprobación por Staff de Trofi
              </Text>
            </View>
          )}

          {league.payment_status === 'overdue' && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              padding: 10,
              borderRadius: 12,
              marginHorizontal: 20,
              marginTop: 10,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.3)'
            }}>
              <AlertTriangle size={16} color="#EF4444" />
              <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '700', flex: 1 }}>
                Pago Vencido: Creación de nuevos torneos y calendarios bloqueada
              </Text>
            </View>
          )}

          {/* LEAGUE ACHIEVEMENTS / SPOTLIGHT BADGES */}
          {leagueAchievements.length > 0 && (
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              marginHorizontal: 20,
              marginTop: 10,
            }}>
              {leagueAchievements.map((ach) => {
                const isSpotlight = ach.achievement_type === 'league_spotlight';
                const isFastest = ach.achievement_type === 'fastest_growing_league';
                const title = ach.title || (isSpotlight ? 'Liga Destacada de la Semana' : isFastest ? 'Liga de Mayor Crecimiento' : 'Insignia Oficial');
                const badgeColor = isSpotlight ? '#F59E0B' : isFastest ? '#10B981' : '#3B82F6';

                return (
                  <View
                    key={ach.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      borderColor: badgeColor + '66',
                      borderWidth: 1,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 12,
                    }}
                  >
                    <Award size={14} color={badgeColor} />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text }}>
                      {title}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* FEATURES CHIPS */}
          {activeFeatures.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuresScroll}
            >
              {activeFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <View key={index} style={styles.featureChip}>
                    <Icon size={14} color={theme.primary} />
                    <Text style={styles.featureText}>{feature.label}</Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* CONTENIDO DESLIZABLE */}
          <View style={styles.contentWrapper}>
            <LeagueTabsList
              tabs={dynamicTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {renderTabContent()}
          </View>
        </View>
      </ScrollView>

      {/* FAB PARA NUEVO TORNEO (Dueño o admin en pestaña de torneos) */}
      {canManage && (activeTab === "STANDINGS" || activeTab === "POSICIONES") && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsTournamentModalVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={28} color="#001A2C" />
        </TouchableOpacity>
      )}

      {/* MODAL DE EDICIÓN (REUTILIZADO) */}
      <CreateLeagueModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={fetchLeagueDetails}
        initialData={league}
      />

      {/* MODAL DE NUEVO TORNEO */}
      <CreateTournamentModal
        visible={isTournamentModalVisible}
        onClose={() => setIsTournamentModalVisible(false)}
        onSuccess={(newTourney?: any) => {
          fetchLeagueDetails();
          setRefreshTournamentsKey((prev) => prev + 1);
          if (newTourney?.id) {
            router.push({
              pathname: "/tournament-detail",
              params: { id: newTourney.id },
            });
          }
        }}
        leagueId={league.id}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: 100, // Extra space for nav
    },
    webContainer: {
      maxWidth: 800,
      width: "100%",
      alignSelf: "center",
    },
    contentWrapper: {
      paddingHorizontal: 20,
      marginTop: 10,
    },
    featuresScroll: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
      gap: 12,
    },
    featureChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 8,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    featureText: {
      fontSize: 10,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: 0.5,
    },
    comingSoonBox: {
      padding: 30,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      marginTop: 20,
    },
    comingSoonText: {
      textAlign: "center",
      color: theme.textSecondary,
      fontSize: 14,
      lineHeight: 22,
    },
    fab: {
      position: "absolute",
      bottom: 30,
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
  });
