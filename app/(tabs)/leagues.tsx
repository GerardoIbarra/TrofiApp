import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Trophy, Users, Heart, User, ChevronRight, CircleDot, Layout, Venus, Medal } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { TrofiTheme } from '@/constants/theme';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { LayoutHeader } from '@/components/LayoutHeader';

const { width } = Dimensions.get('window');

const FEATURED_LEAGUES = [
  { 
    id: '1', 
    name: 'Zapopan Regional League', 
    category: 'PRO DIVISION', 
    image: 'https://images.pexels.com/photos/209637/pexels-photo-209637.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'REGISTRATION OPEN'
  },
  { 
    id: '2', 
    name: 'Elite Soccer Cup', 
    category: 'VETERAN LEAGUE', 
    image: 'https://images.pexels.com/photos/159515/football-gridiron-soccer-pitch-159515.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'ENROLLING'
  },
];

const GAME_FORMATS = [
  { id: '1', name: 'FÚTBOL 7', icon: CircleDot },
  { id: '2', name: 'FÚTBOL 11', icon: Layout },
  { id: '3', name: "WOMEN'S", icon: Venus },
  { id: '4', name: 'VETERAN', icon: Medal },
];

const NEARBY = [
  { id: '1', name: 'NORTHSIDE AMATEUR CUP', distance: '1.2 KM AWAY', teams: '24 TEAMS', status: 'REGISTRATION OPEN', statusColor: TrofiTheme.primary },
  { id: '2', name: 'URBAN FUTBOL SERIES', distance: '3.5 KM AWAY', teams: '12 TEAMS', status: 'FINALS WEEK', statusColor: '#FFD700' },
  { id: '3', name: 'THE SUNSET LEAGUE', distance: '5.0 KM AWAY', teams: '16 TEAMS', status: 'SEASON ENDED', statusColor: '#FF6B6B' },
];

export default function LeaguesExplorerScreen() {
  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={GlobalStyles.safeArea} edges={['top']}>
        <LayoutHeader title="EXPLORE" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.webContainer}>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Search size={20} color="rgba(255,255,255,0.4)" />
                <TextInput 
                  placeholder="FIND YOUR NEXT ARENA..." 
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.searchInput}
                />
              </View>
            </View>

            {/* Featured Leagues */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionOverline}>ELITE COMPETITIONS</Text>
                <Text style={styles.sectionTitle}>FEATURED LEAGUES</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.featuredList}
              snapToInterval={width * 0.85 + 20}
              decelerationRate="fast"
            >
              {FEATURED_LEAGUES.map((league) => (
                <TouchableOpacity 
                  key={league.id} 
                  style={styles.featuredCard}
                  onPress={() => router.push('/league-detail')}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: league.image }} style={styles.featuredImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,1)']}
                    style={styles.featuredGradient}
                  />
                  <View style={styles.featuredContent}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{league.status}</Text>
                    </View>
                    <Text style={styles.featuredName}>{league.name}</Text>
                    <View style={styles.featuredCategoryRow}>
                      <Trophy size={14} color={TrofiTheme.primary} />
                      <Text style={styles.featuredCategory}>{league.category}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Game Formats */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>GAME FORMATS</Text>
            </View>

            <View style={styles.formatsGrid}>
              {GAME_FORMATS.map((format) => {
                const Icon = format.icon;
                return (
                  <TouchableOpacity key={format.id} style={styles.formatCard}>
                    <Icon size={28} color={TrofiTheme.primary} style={{ marginBottom: 8 }} />
                    <Text style={styles.formatName}>{format.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Nearby Competitions */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>NEARBY COMPETITIONS</Text>
              </View>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterText}>All Distances</Text>
              </TouchableOpacity>
            </View>

            {NEARBY.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.nearbyCard}
                onPress={() => router.push('/league-detail')}
              >
                <View style={styles.nearbyLogo}>
                   <View style={styles.logoCircle}>
                      <Trophy size={20} color="rgba(255,255,255,0.6)" />
                   </View>
                </View>
                <View style={styles.nearbyInfo}>
                  <Text style={styles.nearbyName}>{item.name}</Text>
                  <View style={styles.nearbyMetaRow}>
                    <Text style={styles.nearbyMeta}>📍 {item.distance}</Text>
                    <Text style={styles.nearbyMeta}> • 👥 {item.teams}</Text>
                  </View>
                </View>
                <View style={styles.nearbyStatusColumn}>
                  <Text style={[styles.nearbyStatus, { color: item.statusColor }]}>{item.status}</Text>
                  <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
                </View>
              </TouchableOpacity>
            ))}

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
  webContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 25,
    marginBottom: 15,
  },
  sectionOverline: {
    fontSize: 9,
    fontWeight: '800',
    color: TrofiTheme.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: TrofiTheme.primary,
    letterSpacing: 0.5,
  },
  featuredList: {
    paddingRight: 20,
  },
  featuredCard: {
    width: width * 0.85,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 20,
    backgroundColor: TrofiTheme.surface,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  statusBadge: {
    backgroundColor: TrofiTheme.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
  },
  featuredName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  featuredCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  formatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  formatCard: {
    width: (width - 55) / 2,
    backgroundColor: TrofiTheme.surface,
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  formatName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  nearbyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TrofiTheme.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  nearbyLogo: {
    marginRight: 15,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nearbyInfo: {
    flex: 1,
  },
  nearbyName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  nearbyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearbyMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  nearbyStatusColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  nearbyStatus: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
