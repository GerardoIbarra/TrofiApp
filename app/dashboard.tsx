import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, Bell, TrendingUp, Trophy, Search, Users, User, ArrowUpRight } from 'lucide-react-native';
import { TrofiTheme } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[TrofiTheme.background, '#0D1B2A']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton}>
            <Menu size={24} color={TrofiTheme.text} />
          </TouchableOpacity>
          <Text style={styles.logoHeader}>TROFI</Text>
          <TouchableOpacity style={styles.profileButton}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }} 
              style={styles.profileImage} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Section: My Teams */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionOverline}>RESUMEN SEMANAL</Text>
              <Text style={styles.sectionTitle}>MIS EQUIPOS</Text>
            </View>
            <TouchableOpacity style={styles.bellButton}>
              <Bell size={20} color={TrofiTheme.primary} />
            </TouchableOpacity>
          </View>

          {/* Featured Match Card */}
          <View style={styles.featuredCard}>
            <LinearGradient
              colors={['#112240', '#0A192F']}
              style={styles.cardGradient}
            >
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

          {/* Performance Summary */}
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

          {/* Road to Glory Section */}
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

          {/* Recent Players */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PLAYERS</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playersScroll}>
            <PlayerAvatar name="R. Mendez" />
            <PlayerAvatar name="J. Smith" />
            <PlayerAvatar name="L. Garcia" />
            <PlayerAvatar name="M. Brown" />
          </ScrollView>

        </ScrollView>

        {/* Custom Bottom Tab Bar */}
        <View style={styles.tabBar}>
          <TabItem icon={<Trophy size={24} color={TrofiTheme.primary} />} label="Leagues" active />
          <TabItem icon={<ArrowUpRight size={24} color={TrofiTheme.textSecondary} />} label="Explore" />
          <View style={styles.centerTabContainer}>
            <TouchableOpacity style={styles.centerTab}>
              <Search size={28} color="#001A2C" />
            </TouchableOpacity>
          </View>
          <TabItem icon={<Users size={24} color={TrofiTheme.textSecondary} />} label="Teams" />
          <TabItem icon={<User size={24} color={TrofiTheme.textSecondary} />} label="Profile" />
        </View>
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

function TabItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <TouchableOpacity style={styles.tabItem}>
      {icon}
      <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 70,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoHeader: {
    fontSize: 20,
    fontWeight: '900',
    color: TrofiTheme.text,
    letterSpacing: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: TrofiTheme.primary,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TrofiTheme.text,
    letterSpacing: 0.5,
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
  playersScroll: {
    flexDirection: 'row',
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
  tabBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#050A15',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingTop: 10,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    width: 60,
  },
  tabLabel: {
    fontSize: 9,
    color: TrofiTheme.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: TrofiTheme.primary,
  },
  centerTabContainer: {
    marginTop: -35,
    width: 70,
    alignItems: 'center',
  },
  centerTab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: TrofiTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#050A15',
  },
});
