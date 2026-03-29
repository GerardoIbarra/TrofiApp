import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { LayoutHeader } from '@/components/LayoutHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Search as SearchIcon, SlidersHorizontal, X, Star, ChevronRight, User as UserIcon, CircleDot, Sun, Zap, Mountain } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const RECENT_SEARCHES = ['Elite Soccer League', 'City Tigers FC', 'Top Scorers'];

const POPULAR_TEAMS = [
  { id: '1', name: 'Strikers FC', division: 'DIVISION A', icon: CircleDot, highlight: true },
  { id: '2', name: 'Shadow Suns', division: 'PRO ELITE', icon: Sun, highlight: false },
  { id: '3', name: 'Volt Kings', division: 'DIVISION B', icon: Zap, highlight: true },
  { id: '4', name: 'Apex United', division: 'PREMIER', icon: Mountain, highlight: false },
];

export default function ExploreScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={GlobalStyles.safeArea} edges={['top']}>
        <LayoutHeader title="SEARCH" />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.webContainer}>
            
            {/* Search Bar & Filter */}
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <SearchIcon size={20} color={theme.textSecondary} />
                <TextInput 
                  placeholder="Leagues, teams, or players..." 
                  placeholderTextColor={theme.textSecondary}
                  style={styles.searchInput}
                />
              </View>
              <TouchableOpacity style={styles.filterButton}>
                <SlidersHorizontal size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Recent Searches */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>RECENT SEARCHES</Text>
              <TouchableOpacity>
                <Text style={styles.clearAllText}>CLEAR ALL</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentView}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {RECENT_SEARCHES.map((search, index) => (
                  <TouchableOpacity key={index} style={styles.searchChip}>
                    <Text style={styles.chipText}>{search}</Text>
                    <X size={14} color={theme.textSecondary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Recommended for You */}
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            
            <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=800' }} 
                style={styles.cardImage} 
              />
              <LinearGradient
                colors={['transparent', isDark ? 'rgba(10, 25, 47, 0.9)' : 'rgba(0, 0, 0, 0.8)']}
                style={styles.cardGradient}
              />
              <View style={styles.cardContent}>
                <View style={styles.trendingBadge}>
                  <Text style={styles.trendingText}>TRENDING LEAGUE</Text>
                </View>
                <Text style={styles.cardMainTitle}>METROPOLIS PREMIER</Text>
                <Text style={styles.cardSubtitle}>Join the 12th annual championship kickoff.</Text>
              </View>
            </TouchableOpacity>

            {/* Player of the Month */}
            <TouchableOpacity style={styles.playerCard}>
              <View style={styles.playerAvatarContainer}>
                <View style={styles.avatarIconBox}>
                  <UserIcon size={24} color={theme.primary} />
                </View>
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerCardTitle}>Player of the Month</Text>
                <Text style={styles.playerName}>Marcus "Viper" Chen</Text>
                <TouchableOpacity style={styles.viewProfileRow}>
                   <Text style={styles.viewProfileText}>VIEW PROFILE</Text>
                   <ChevronRight size={14} color={theme.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.starDecoration}>
                <Star size={80} color={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} style={styles.bigStar} />
              </View>
            </TouchableOpacity>

            {/* Popular Teams Grid */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Teams</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>SEE ALL</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.teamsGrid}>
              {POPULAR_TEAMS.map((team) => {
                const Icon = team.icon;
                return (
                  <TouchableOpacity key={team.id} style={styles.teamCard}>
                    {team.highlight && <View style={styles.cyanBorder} />}
                    <View style={styles.teamLogoBox}>
                      <Icon size={24} color={theme.primary} />
                    </View>
                    <Text style={styles.teamNameText}>{team.name}</Text>
                    <Text style={styles.divisionText}>{team.division}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Explore Sports */}
            <Text style={styles.sectionTitle}>Explore Sports</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportsScroll}>
              <SportCard 
                title="Soccer" 
                image="https://images.pexels.com/photos/46734/pexels-photo-46734.jpeg?auto=compress&cs=tinysrgb&w=800"
              />
              <SportCard 
                title="Basketball" 
                image="https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=800"
              />
            </ScrollView>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SportCard({ title, image }: { title: string, image: string }) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  return (
    <TouchableOpacity style={styles.sportCard}>
      <Image source={{ uri: image }} style={styles.sportImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.sportGradient}
      />
      <Text style={styles.sportTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  scrollContent: {
    paddingBottom: 110,
  },
  webContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: theme.text,
    fontSize: 14,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: theme.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.textSecondary,
    letterSpacing: 1,
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.primary,
    letterSpacing: 0.5,
  },
  recentView: {
    marginBottom: 30,
  },
  searchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    gap: 8,
  },
  chipText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.text,
    marginBottom: 20,
    marginTop: 10,
  },
  featuredCard: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  trendingBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
  cardMainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  playerCard: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  },
  playerAvatarContainer: {
    marginRight: 15,
  },
  avatarIconBox: {
    width: 60,
    height: 60,
    backgroundColor: isDark ? 'rgba(0, 245, 255, 0.05)' : 'rgba(0, 245, 255, 0.03)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(0, 245, 255, 0.05)',
  },
  playerInfo: {
    flex: 1,
    zIndex: 2,
  },
  playerCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
  },
  playerName: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  viewProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  viewProfileText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.primary,
  },
  starDecoration: {
    position: 'absolute',
    right: -10,
    top: -10,
  },
  bigStar: {
    opacity: 0.1,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 30,
  },
  teamCard: {
    width: (width - 55) / 2,
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    elevation: isDark ? 0 : 2,
  },
  cyanBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: theme.primary,
  },
  teamLogoBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 4,
  },
  divisionText: {
    fontSize: 10,
    color: theme.textSecondary,
    fontWeight: '700',
  },
  sportsScroll: {
    paddingRight: 20,
  },
  sportCard: {
    width: 160,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 15,
  },
  sportImage: {
    width: '100%',
    height: '100%',
  },
  sportGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  sportTitle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
});
