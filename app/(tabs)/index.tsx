import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, TrendingUp, ArrowUpRight } from 'lucide-react-native';
import { LayoutHeader } from '@/components/LayoutHeader';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { TrofiTheme } from '@/constants/theme';

const { width } = Dimensions.get('window');

const MOCK_PLAYERS = [
  { id: '1', name: 'R. Mendez' },
  { id: '2', name: 'J. Smith' },
  { id: '3', name: 'L. Garcia' },
  { id: '4', name: 'M. Brown' },
  { id: '5', name: 'T. Silva' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      
      <SafeAreaView style={GlobalStyles.safeArea}>
        <LayoutHeader />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.webContainer}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionOverline}>RESUMEN SEMANAL</Text>
                <Text style={GlobalStyles.sectionTitle}>MIS EQUIPOS</Text>
              </View>
              <TouchableOpacity style={styles.bellButton}>
                <Bell size={20} color={TrofiTheme.primary} />
              </TouchableOpacity>
            </View>

            {/* Featured Match Card (Consistente con Ligas) */}
            <View style={styles.featuredCard}>
              <LinearGradient
                colors={[TrofiTheme.surface, '#0A1525']}
                style={styles.cardGradient}
              >
                {/* Borde Izquierdo Cyan (Highlight) */}
                <View style={styles.userHighlight} />
                
                <View style={styles.cardHeader}>
                  <View style={styles.leagueTag}>
                    <Text style={styles.leagueTagText}>LIGA ZAPOPAN NORTE</Text>
                  </View>
                  <Text style={styles.matchTime}>TODAY, OCT 26</Text>
                </View>

                <Text style={styles.matchdayText}>Matchday 12</Text>
                <Text style={styles.matchPhase}>Final Stage</Text>

                <View style={styles.matchTeams}>
                  <View style={styles.team}>
                    <View style={styles.teamBadgePlaceholder} />
                    <Text style={styles.teamName}>Real Goliza</Text>
                  </View>
                  <Text style={styles.vsText}>VS</Text>
                  <View style={styles.team}>
                    <View style={styles.teamBadgePlaceholder} />
                    <Text style={styles.teamName}>Atlc. San Pancho</Text>
                  </View>
                </View>

                <View style={styles.matchFooter}>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationText}>📍 Today, Oct 26 • Field 4</Text>
                  </View>
                  <TouchableOpacity style={styles.viewDetailsButton}>
                    <Text style={styles.viewDetailsText}>VIEW FIXTURE</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* Stats Summary Area */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>WIN RATE</Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>94%</Text>
                  <TrendingUp size={16} color={TrofiTheme.primary} />
                </View>
                <View style={styles.statBarContainer}>
                  <View style={[styles.statBar, { width: '94%' }]} />
                </View>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>GOALS / GAME</Text>
                <View style={styles.statValueContainer}>
                  <Text style={styles.statValue}>2.2</Text>
                  <TrendingUp size={16} color={TrofiTheme.primary} />
                </View>
                <View style={styles.statBarContainer}>
                  <View style={[styles.statBar, { width: '70%' }]} />
                </View>
              </View>
            </View>

            {/* Promotional Banner */}
            <TouchableOpacity style={styles.bannerCard}>
              <LinearGradient
                colors={['#004E92', '#000428']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bannerGradient}
              >
                <View>
                  <Text style={styles.bannerOverline}>LIGA DE INVIERNO 2024</Text>
                  <Text style={styles.bannerTitle}>The Road to Glory</Text>
                  <Text style={styles.bannerSubtitle}>Registrations are now open.</Text>
                </View>
                <View style={styles.bannerArrow}>
                  <ArrowUpRight size={20} color={TrofiTheme.text} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Players List Section */}
            <View style={styles.sectionHeader}>
              <Text style={GlobalStyles.sectionTitle}>PLAYERS</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            <FlatList 
              data={MOCK_PLAYERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.playersScrollContent}
              renderItem={({ item }) => <PlayerAvatar name={item.name} />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function PlayerAvatar({ name }: { name: string }) {
  return (
    <View style={styles.playerContainer}>
      <View style={styles.avatarBorder}>
        <Image 
          source={{ uri: `https://i.pravatar.cc/150?u=${name}` }} 
          style={styles.avatarImage} 
        />
      </View>
      <Text style={styles.playerName}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 110, // Margin to avoid nav bar
  },
  webContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  userHighlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: TrofiTheme.primary,
    zIndex: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 15,
  },
  sectionOverline: {
    fontSize: 10,
    fontWeight: '700',
    color: TrofiTheme.textSecondary,
    letterSpacing: 1,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  leagueTag: {
    backgroundColor: 'rgba(0, 245, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leagueTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: TrofiTheme.primary,
    letterSpacing: 0.5,
  },
  matchTime: {
    fontSize: 10,
    color: TrofiTheme.textSecondary,
    fontWeight: '600',
  },
  matchdayText: {
    fontSize: 28,
    fontWeight: '800',
    color: TrofiTheme.text,
  },
  matchPhase: {
    fontSize: 18,
    fontWeight: '600',
    color: TrofiTheme.text,
    marginBottom: 20,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  team: {
    alignItems: 'center',
    width: '40%',
  },
  teamBadgePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    color: TrofiTheme.text,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 16,
    fontWeight: '900',
    color: TrofiTheme.textSecondary,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 11,
    color: TrofiTheme.textSecondary,
  },
  viewDetailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  viewDetailsText: {
    fontSize: 10,
    fontWeight: '700',
    color: TrofiTheme.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statBox: {
    width: (width - 55) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: TrofiTheme.textSecondary,
    marginBottom: 5,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: TrofiTheme.text,
  },
  statBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    backgroundColor: TrofiTheme.primary,
  },
  bannerCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 25,
  },
  bannerGradient: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerOverline: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TrofiTheme.text,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  bannerArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: TrofiTheme.primary,
  },
  playersScrollContent: {
    paddingRight: 20,
    marginBottom: 20,
  },
  playerContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  avatarBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(0, 245, 255, 0.3)',
    padding: 3,
    marginBottom: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  playerName: {
    fontSize: 11,
    color: TrofiTheme.text,
    fontWeight: '500',
  },
});
