import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import {
  ChevronLeft,
  Share2,
  Flame,
  Shield,
  TrendingUp,
  Trophy,
  MessageSquare,
  Award,
} from 'lucide-react-native';
import { useGetPlayerProfile } from '@/features/players/services/playerProfileApi';
import { PlayerCardView } from '@/components/players/profile/PlayerCardView';
import { PlayerStatsWidget } from '@/components/players/profile/PlayerStatsWidget';
import { PlayerAchievementsList } from '@/components/players/profile/PlayerAchievementsList';
import * as Linking from 'expo-linking';

export default function PlayerDetailScreen() {
  const { playerId, tournamentId, playerName } = useLocalSearchParams<{
    playerId: string;
    tournamentId?: string;
    playerName?: string;
  }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [activeTab, setActiveTab] = useState<'CARD' | 'STATS'>('CARD');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | undefined>(
    tournamentId
  );

  const { data: profile, isLoading } = useGetPlayerProfile(
    playerId,
    selectedTournamentId
  );

  const currentCard = profile?.card || null;
  const displayName =
    playerName ||
    (profile?.player
      ? `${profile.player.first_name || ''} ${profile.player.last_name || ''}`.trim()
      : 'JUGADOR');

  const currentStats =
    profile?.stats_by_tournament?.find(
      (s) => s.tournament === (selectedTournamentId || profile?.active_tournament_id)
    ) ||
    profile?.stats_by_tournament?.[0] ||
    null;

  const handleShare = () => {
    if (currentCard) {
      const url = `https://api.trofiapp.com/api/v1/player-cards/${currentCard.id}/image/`;
      Linking.openURL(url).catch((err) => {
        console.error("Couldn't load page", err);
        Alert.alert('Error', 'No se pudo abrir la imagen de la carta para compartir.');
      });
    }
  };

  if (isLoading) {
    return (
      <View style={[GlobalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <BackgroundGradient />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Perfil del Jugador</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {profile?.player?.id && (
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() =>
                router.push({
                  pathname: '/direct-messages' as any,
                  params: { with: profile.player.id, name: displayName },
                })
              }
            >
              <MessageSquare size={21} color={theme.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare} disabled={!currentCard}>
            <Share2 size={22} color={currentCard ? theme.primary : theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tournament Selector Chips */}
      {profile?.cards && profile.cards.length > 1 && (
        <View style={styles.tournamentSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tournamentChips}>
            {profile.cards.map((c) => {
              const isSelected =
                c.tournament === (selectedTournamentId || profile.active_tournament_id);
              return (
                <TouchableOpacity
                  key={c.tournament}
                  style={[styles.tourneyChip, isSelected && styles.tourneyChipActive]}
                  onPress={() => setSelectedTournamentId(c.tournament)}
                  activeOpacity={0.8}
                >
                  <Trophy size={12} color={isSelected ? '#000' : theme.primary} />
                  <Text style={[styles.tourneyChipText, isSelected && styles.tourneyChipTextActive]}>
                    {c.tournament_name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Streaks Badges (Offensive & Defensive) */}
      {((profile?.offensive_streak && profile.offensive_streak.count > 0) ||
        (profile?.defensive_streak && profile.defensive_streak.count > 0)) && (
        <View style={styles.streaksContainer}>
          {profile?.offensive_streak && profile.offensive_streak.count > 0 && (
            <View style={styles.offensiveStreakBadge}>
              <Flame size={15} color="#FF5722" />
              <Text style={styles.offensiveStreakText}>
                {profile.offensive_streak.count} partidos seguidos con gol
              </Text>
            </View>
          )}

          {profile?.defensive_streak && profile.defensive_streak.count > 0 && (
            <View style={styles.defensiveStreakBadge}>
              <Shield size={15} color="#10B981" />
              <Text style={styles.defensiveStreakText}>
                {profile.defensive_streak.count} vallas invictas seguidas
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'CARD' && { borderBottomWidth: 2, borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('CARD')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'CARD' ? theme.primary : theme.textSecondary }]}>
            CARD & ELO
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'STATS' && { borderBottomWidth: 2, borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('STATS')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'STATS' ? theme.primary : theme.textSecondary }]}>
            ESTADÍSTICAS
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'CARD' && (
          <View style={styles.tabContent}>
            {currentCard ? (
              <PlayerCardView
                card={currentCard}
                playerName={displayName}
                isProvisional={currentStats?.provisional}
              />
            ) : (
              <View style={[styles.emptyBox, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  Este jugador aún no tiene una Player Card generada en este torneo. Juega un partido para obtenerla.
                </Text>
              </View>
            )}

            {/* Card History (Rating Evolution) */}
            {profile?.card_history && profile.card_history.length > 0 && (
              <View style={styles.historyCardBox}>
                <View style={styles.historyHeader}>
                  <TrendingUp size={16} color={theme.primary} />
                  <Text style={[styles.historyTitle, { color: theme.text }]}>Evolución de Rating</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyScroll}>
                  {profile.card_history.map((hist, idx) => (
                    <View key={idx} style={styles.histItem}>
                      <Text style={[styles.histOverall, { color: theme.primary }]}>{hist.overall}</Text>
                      <Text style={[styles.histRarity, { color: theme.textSecondary }]}>
                        {hist.rarity.toUpperCase()}
                      </Text>
                      <Text style={[styles.histDate, { color: theme.textSecondary }]}>
                        {new Date(hist.captured_at).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {profile?.achievements && profile.achievements.length > 0 && (
              <PlayerAchievementsList achievements={profile.achievements as any} />
            )}

            {/* Retas / Fútbol Informal Stats */}
            {profile?.pickup_stats && (
              <View style={styles.pickupStatsBox}>
                <View style={styles.pickupStatsHeader}>
                  <View style={styles.pickupIconBadge}>
                    <Flame size={16} color="#F59E0B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pickupTitle, { color: theme.text }]}>
                      Fútbol Informal & Retas
                    </Text>
                    <Text style={[styles.pickupSubtitle, { color: theme.textSecondary }]}>
                      Nivel {profile.pickup_stats.tier?.level || 1} • {profile.pickup_stats.tier?.name || 'Novato'}
                    </Text>
                  </View>
                </View>

                <View style={styles.pickupMetricsRow}>
                  <View style={styles.pickupMetric}>
                    <Text style={[styles.pickupMetricVal, { color: theme.text }]}>
                      {profile.pickup_stats.check_in_count || 0}
                    </Text>
                    <Text style={[styles.pickupMetricLbl, { color: theme.textSecondary }]}>
                      Check-ins
                    </Text>
                  </View>
                  <View style={styles.pickupMetric}>
                    <Text style={[styles.pickupMetricVal, { color: theme.text }]}>
                      {profile.pickup_stats.distinct_spot_count || 0}
                    </Text>
                    <Text style={[styles.pickupMetricLbl, { color: theme.textSecondary }]}>
                      Canchas distintas
                    </Text>
                  </View>
                  <View style={styles.pickupMetric}>
                    <Text style={[styles.pickupMetricVal, { color: '#F59E0B' }]}>
                      {profile.pickup_stats.tier?.check_ins_needed != null
                        ? `${profile.pickup_stats.tier.check_ins_needed}`
                        : 'Max'}
                    </Text>
                    <Text style={[styles.pickupMetricLbl, { color: theme.textSecondary }]}>
                      {profile.pickup_stats.tier?.next_tier ? `Faltan para nivel` : 'Nivel Max'}
                    </Text>
                  </View>
                </View>

                {profile.pickup_stats.achievements && profile.pickup_stats.achievements.length > 0 && (
                  <View style={styles.pickupBadgesWrap}>
                    {profile.pickup_stats.achievements.map((ach, idx) => (
                      <View key={idx} style={styles.pickupBadgeChip}>
                        <Award size={12} color="#F59E0B" />
                        <Text style={styles.pickupBadgeText}>{ach.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === 'STATS' && (
          <View style={styles.tabContent}>
            {currentStats ? (
              <PlayerStatsWidget stats={currentStats as any} />
            ) : (
              <View style={[styles.emptyBox, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  No hay estadísticas registradas para este torneo.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 55,
      paddingBottom: 15,
    },
    backButton: {
      padding: 4,
    },
    shareButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
    },
    tournamentSelectorContainer: {
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    tournamentChips: {
      gap: 8,
    },
    tourneyChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    tourneyChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    tourneyChipText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    tourneyChipTextActive: {
      color: '#000',
      fontWeight: '800',
    },
    streaksContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    offensiveStreakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(255, 87, 34, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255, 87, 34, 0.3)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    offensiveStreakText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#FF5722',
    },
    defensiveStreakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    defensiveStreakText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#10B981',
    },
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      borderBottomWidth: 1,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    tabText: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    tabContent: {
      padding: 20,
    },
    emptyBox: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    historyCardBox: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginTop: 20,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    historyTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    historyScroll: {
      gap: 12,
    },
    histItem: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    histOverall: {
      fontSize: 20,
      fontWeight: '900',
    },
    histRarity: {
      fontSize: 9,
      fontWeight: '700',
      marginTop: 2,
    },
    histDate: {
      fontSize: 9,
      marginTop: 2,
    },
    pickupStatsBox: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginTop: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.25)',
    },
    pickupStatsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
    },
    pickupIconBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickupTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    pickupSubtitle: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 1,
    },
    pickupMetricsRow: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: 12,
      padding: 12,
      justifyContent: 'space-around',
    },
    pickupMetric: {
      alignItems: 'center',
    },
    pickupMetricVal: {
      fontSize: 16,
      fontWeight: '900',
    },
    pickupMetricLbl: {
      fontSize: 10,
      fontWeight: '600',
      marginTop: 2,
    },
    pickupBadgesWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    pickupBadgeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.15)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.25)',
    },
    pickupBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#F59E0B',
    },
  });
