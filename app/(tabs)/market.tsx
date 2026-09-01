import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, User, Users, Plus, Shield } from 'lucide-react-native';
import { useGetMarketListings } from '@/features/market/services/marketApi';
import { CreateListingModal } from '@/components/market/CreateListingModal';
import { useAuthStore } from '@/features/auth/store/authStore';


export default function MarketScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);

  const [activeTab, setActiveTab] = useState<'team_seeking_player' | 'player_seeking_team'>('team_seeking_player');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // We debounce this in a real scenario, but for now we just use it directly or require hitting enter
  const { data, isLoading } = useGetMarketListings({
    listing_type: activeTab,
    search: searchQuery || undefined,
  });

  const listings = data?.results || [];

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: theme.text }]}>{t('market.title')}</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setIsModalVisible(true)}
          >
            <Plus size={20} color="#001A2C" />
            <Text style={styles.addButtonText}>{t('market.btn_publish')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
          <Search size={20} color={theme.textSecondary} />
          <TextInput 
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t('market.search_placeholder')}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </SafeAreaView>

      <View style={styles.tabsWrapper}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'team_seeking_player' && styles.tabItemActive]}
          onPress={() => setActiveTab('team_seeking_player')}
        >
          <Users size={18} color={activeTab === 'team_seeking_player' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.tabLabel, activeTab === 'team_seeking_player' && styles.tabLabelActive]}>
            {t('market.tab_teams')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'player_seeking_team' && styles.tabItemActive]}
          onPress={() => setActiveTab('player_seeking_team')}
        >
          <User size={18} color={activeTab === 'player_seeking_team' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.tabLabel, activeTab === 'player_seeking_team' && styles.tabLabelActive]}>
            {t('market.tab_players')}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={listings}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Search size={48} color={theme.textSecondary} opacity={0.3} />
                <Text style={styles.emptyText}>{t('market.empty_state')}</Text>
              </View>
            )}
            renderItem={({ item: listing }) => (
              <View style={[styles.listingCard, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarBox}>
                    {listing.listing_type === 'team_seeking_player' ? (
                      <Shield size={24} color={theme.primary} />
                    ) : (
                      <User size={24} color={theme.primary} />
                    )}
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={[styles.listingName, { color: theme.text }]}>
                      {listing.listing_type === 'team_seeking_player' 
                        ? (listing.team_name || t('market.unknown_team')) 
                        : (listing.player_name || t('market.unknown_player'))}
                    </Text>
                    <View style={styles.leagueRow}>
                      <MapPin size={12} color={theme.textSecondary} />
                      <Text style={[styles.leagueName, { color: theme.textSecondary }]}>
                        {listing.league_name || t('market.unknown_league')}
                      </Text>
                    </View>
                  </View>
                  {listing.position && (
                    <View style={[styles.positionBadge, { backgroundColor: theme.primary + '20' }]}>
                      <Text style={[styles.positionText, { color: theme.primary }]}>{listing.position}</Text>
                    </View>
                  )}
                </View>

                {listing.availability_note && (
                  <View style={styles.noteRow}>
                    <Text style={[styles.noteLabel, { color: theme.textSecondary }]}>{t('market.availability_note')}</Text>
                    <Text style={[styles.noteValue, { color: theme.text }]}>{listing.availability_note}</Text>
                  </View>
                )}

                {listing.notes && (
                  <View style={styles.noteRow}>
                    <Text style={[styles.noteLabel, { color: theme.textSecondary }]}>{t('market.notes')}</Text>
                    <Text style={[styles.noteValue, { color: theme.text }]}>{listing.notes}</Text>
                  </View>
                )}
                
                {listing.distance_km != null && (
                  <Text style={[styles.distanceText, { color: theme.textSecondary }]}>
                    {t('market.distance', { km: Math.round(listing.distance_km) })}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      )}

      {isModalVisible && (
        <CreateListingModal 
          onClose={() => setIsModalVisible(false)} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#001A2C',
    fontWeight: '800',
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  tabsWrapper: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#888',
  },
  tabLabelActive: {
    color: '#FFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    opacity: 0.7,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  listingCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listingName: {
    fontSize: 16,
    fontWeight: '800',
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  leagueName: {
    fontSize: 12,
    fontWeight: '600',
  },
  positionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  positionText: {
    fontSize: 12,
    fontWeight: '900',
  },
  noteRow: {
    marginTop: 8,
  },
  noteLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  noteValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 12,
    alignSelf: 'flex-end',
  }
});
