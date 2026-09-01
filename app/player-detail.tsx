import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import { ChevronLeft, Share2 } from 'lucide-react-native';
import { useGetPlayerStats, useGetPlayerCards, useGetPlayerAchievements } from '@/features/players/services/playerProfileApi';
import { PlayerCardView } from '@/components/players/profile/PlayerCardView';
import { PlayerStatsWidget } from '@/components/players/profile/PlayerStatsWidget';
import { PlayerAchievementsList } from '@/components/players/profile/PlayerAchievementsList';
import * as Linking from 'expo-linking';

export default function PlayerDetailScreen() {
  const { playerId, tournamentId, playerName } = useLocalSearchParams<{ playerId: string; tournamentId: string; playerName: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'CARD' | 'STATS'>('CARD');

  const { data: stats, isLoading: loadingStats } = useGetPlayerStats(tournamentId, playerId);
  const { data: cards, isLoading: loadingCards } = useGetPlayerCards(playerId);
  const { data: achievements, isLoading: loadingAchievements } = useGetPlayerAchievements(playerId);

  const isLoading = loadingStats || loadingCards || loadingAchievements;
  const currentCard = cards && cards.length > 0 ? cards[0] : null;

  const handleShare = () => {
    if (currentCard) {
      const url = `https://api.trofiapp.com/api/v1/player-cards/${currentCard.id}/image/`;
      Linking.openURL(url).catch(err => {
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
        <TouchableOpacity style={styles.shareButton} onPress={handleShare} disabled={!currentCard}>
          <Share2 size={22} color={currentCard ? theme.primary : theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'CARD' && { borderBottomWidth: 2, borderBottomColor: theme.primary }]} 
          onPress={() => setActiveTab('CARD')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'CARD' ? theme.primary : theme.textSecondary }]}>CARD & ELO</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'STATS' && { borderBottomWidth: 2, borderBottomColor: theme.primary }]} 
          onPress={() => setActiveTab('STATS')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'STATS' ? theme.primary : theme.textSecondary }]}>ESTADÍSTICAS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'CARD' && (
          <View style={styles.tabContent}>
            {currentCard ? (
              <PlayerCardView 
                card={currentCard} 
                playerName={playerName || 'JUGADOR'} 
                isProvisional={stats?.provisional} 
              />
            ) : (
              <View style={[styles.emptyBox, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  Este jugador aún no tiene una Player Card generada. Juega un partido para obtenerla.
                </Text>
              </View>
            )}

            {achievements && achievements.length > 0 && (
              <PlayerAchievementsList achievements={achievements} />
            )}
          </View>
        )}

        {activeTab === 'STATS' && (
          <View style={styles.tabContent}>
            {stats ? (
              <PlayerStatsWidget stats={stats} />
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
    letterSpacing: 1,
  },
  tabContent: {
    paddingBottom: 40,
  },
  emptyBox: {
    margin: 20,
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  }
});
