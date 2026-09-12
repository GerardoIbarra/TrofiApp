import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Map as MapIcon,
  List,
  Navigation,
  RefreshCw,
  Trophy,
  MapPin,
  X,
  Compass,
  Flame,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { LocationService, UserLocation } from '@/services/locationService';
import { useGetNearby } from '@/features/nearby/services/nearbyApi';
import NearbyMapComponent from '@/components/nearby/NearbyMapComponent';
import { NearbyItemCard } from '@/components/nearby/NearbyItemCard';
import { SelectedNearbyEntity } from '@/components/nearby/types';
import { League } from '@/features/leagues/types/league';
import { Venue } from '@/features/venues/types/venue';
import { PickupSpot } from '@/features/pickup/types/pickup';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

// Calculate distance in kilometers using the Haversine formula
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function NearbyMapScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  const [location, setLocation] = useState<UserLocation | null>(
    LocationService.getLocation()
  );
  const [isLocating, setIsLocating] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState<number>(50);
  const [filterType, setFilterType] = useState<'all' | 'leagues' | 'venues' | 'spots'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedEntity, setSelectedEntity] = useState<SelectedNearbyEntity | null>(null);

  // Initialize or request location if not set
  useEffect(() => {
    if (!location) {
      handleRefreshLocation();
    }
  }, []);

  const handleRefreshLocation = async () => {
    setIsLocating(true);
    try {
      const pos = await LocationService.fetchCurrentPosition();
      if (pos) {
        setLocation(pos);
      }
    } finally {
      setIsLocating(false);
    }
  };

  const hasValidCoords =
    !!location &&
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    !isNaN(location.latitude) &&
    !isNaN(location.longitude) &&
    (location.latitude !== 0 || location.longitude !== 0);

  const { data, isLoading, refetch, isRefetching } = useGetNearby({
    latitude: location?.latitude,
    longitude: location?.longitude,
    radius: selectedRadius,
    enabled: hasValidCoords,
  });

  const leagues = data?.leagues || [];
  const venues = data?.venues || [];
  const pickupSpots = data?.pickup_spots || [];

  // Filter items strictly by selectedRadius (using distance_km or computing it via Haversine)
  const filteredLeagues = useMemo(() => {
    return leagues.filter((l) => {
      const dist =
        l.distance_km ??
        (location && l.latitude && l.longitude
          ? calculateDistanceKm(location.latitude, location.longitude, Number(l.latitude), Number(l.longitude))
          : null);
      return dist == null || dist <= selectedRadius;
    });
  }, [leagues, selectedRadius, location]);

  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const dist =
        v.distance_km ??
        (location && v.latitude && v.longitude
          ? calculateDistanceKm(location.latitude, location.longitude, Number(v.latitude), Number(v.longitude))
          : null);
      return dist == null || dist <= selectedRadius;
    });
  }, [venues, selectedRadius, location]);

  const filteredSpots = useMemo(() => {
    return pickupSpots.filter((s) => {
      const dist =
        s.distance_km ??
        (location && s.latitude && s.longitude
          ? calculateDistanceKm(location.latitude, location.longitude, Number(s.latitude), Number(s.longitude))
          : null);
      return dist == null || dist <= selectedRadius;
    });
  }, [pickupSpots, selectedRadius, location]);

  // Filter and sort items for list view
  const combinedItems = useMemo(() => {
    const items: Array<{
      type: 'league' | 'venue' | 'spot';
      item: League | Venue | PickupSpot;
    }> = [];

    if (filterType === 'all' || filterType === 'leagues') {
      filteredLeagues.forEach((l) => items.push({ type: 'league', item: l }));
    }
    if (filterType === 'all' || filterType === 'venues') {
      filteredVenues.forEach((v) => items.push({ type: 'venue', item: v }));
    }
    if (filterType === 'all' || filterType === 'spots') {
      filteredSpots.forEach((s) => items.push({ type: 'spot', item: s }));
    }

    return items.sort((a, b) => {
      const distA = a.item.distance_km ?? 9999;
      const distB = b.item.distance_km ?? 9999;
      return distA - distB;
    });
  }, [filteredLeagues, filteredVenues, filteredSpots, filterType]);

  const totalCount =
    (filterType === 'all' || filterType === 'leagues' ? filteredLeagues.length : 0) +
    (filterType === 'all' || filterType === 'venues' ? filteredVenues.length : 0) +
    (filterType === 'all' || filterType === 'spots' ? filteredSpots.length : 0);

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>{t('nearby.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {location
                ? t('nearby.results_count', { count: totalCount, radius: selectedRadius })
                : t('nearby.getting_gps')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={handleRefreshLocation}
            disabled={isLocating}
            activeOpacity={0.7}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <RefreshCw size={18} color={theme.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Toolbar: Category Filters, Radius, & View Toggle */}
        <View style={styles.toolbar}>
          {/* Category Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            <TouchableOpacity
              style={[
                styles.chip,
                filterType === 'all' && styles.chipActive,
              ]}
              onPress={() => setFilterType('all')}
            >
              <Text
                style={[
                  styles.chipText,
                  filterType === 'all' && styles.chipTextActive,
                ]}
              >
                {t('nearby.filter_all', { count: filteredLeagues.length + filteredVenues.length + filteredSpots.length })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chip,
                filterType === 'leagues' && styles.chipActive,
              ]}
              onPress={() => setFilterType('leagues')}
            >
              <Trophy
                size={13}
                color={filterType === 'leagues' ? '#000' : theme.primary}
              />
              <Text
                style={[
                  styles.chipText,
                  filterType === 'leagues' && styles.chipTextActive,
                ]}
              >
                {t('nearby.filter_leagues', { count: filteredLeagues.length })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chip,
                filterType === 'venues' && styles.chipActiveVenue,
              ]}
              onPress={() => setFilterType('venues')}
            >
              <MapPin
                size={13}
                color={filterType === 'venues' ? '#FFF' : '#10B981'}
              />
              <Text
                style={[
                  styles.chipText,
                  filterType === 'venues' && styles.chipTextActiveVenue,
                ]}
              >
                {t('nearby.filter_venues', { count: filteredVenues.length })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chip,
                filterType === 'spots' && styles.chipActiveSpot,
              ]}
              onPress={() => setFilterType('spots')}
            >
              <Flame
                size={13}
                color={filterType === 'spots' ? '#FFF' : '#F59E0B'}
              />
              <Text
                style={[
                  styles.chipText,
                  filterType === 'spots' && styles.chipTextActiveSpot,
                ]}
              >
                {t('nearby.filter_spots', { count: filteredSpots.length })}
              </Text>
            </TouchableOpacity>

            {/* Separator */}
            <View style={styles.chipDivider} />

            {/* Radius selector */}
            {RADIUS_OPTIONS.map((km) => (
              <TouchableOpacity
                key={`radius-${km}`}
                style={[
                  styles.radiusChip,
                  selectedRadius === km && styles.radiusChipActive,
                ]}
                onPress={() => {
                  setSelectedRadius(km);
                  LocationService.setRadius(km);
                }}
              >
                <Text
                  style={[
                    styles.radiusChipText,
                    selectedRadius === km && styles.radiusChipTextActive,
                  ]}
                >
                  {km} km
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* View Toggle */}
          <View style={styles.viewToggleBox}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                viewMode === 'map' && styles.toggleBtnActive,
              ]}
              onPress={() => setViewMode('map')}
              activeOpacity={0.8}
            >
              <MapIcon
                size={16}
                color={viewMode === 'map' ? '#000' : theme.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                viewMode === 'list' && styles.toggleBtnActive,
              ]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.8}
            >
              <List
                size={16}
                color={viewMode === 'list' ? '#000' : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          {!hasValidCoords ? (
            <View style={styles.centeredMessage}>
              <Compass size={48} color={theme.primary} />
              <Text style={styles.noLocationTitle}>
                {t('nearby.getting_gps')}
              </Text>
              <Text style={styles.noLocationSub}>
                {t('nearby.gps_needed')}
              </Text>
              <TouchableOpacity
                style={styles.retryLocationBtn}
                onPress={handleRefreshLocation}
              >
                <Text style={styles.retryLocationText}>{t('nearby.detect_location')}</Text>
              </TouchableOpacity>
            </View>
          ) : isLoading || isRefetching ? (
            <View style={styles.centeredLoading}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.loadingText}>
                {t('nearby.searching', { radius: selectedRadius })}
              </Text>
            </View>
          ) : viewMode === 'map' ? (
            /* Map View */
            <View style={styles.mapWrapper}>
              <NearbyMapComponent
                userLatitude={location.latitude}
                userLongitude={location.longitude}
                radiusKm={selectedRadius}
                leagues={filteredLeagues}
                venues={filteredVenues}
                pickupSpots={filteredSpots}
                selectedEntity={selectedEntity}
                onSelectEntity={setSelectedEntity}
                filterType={filterType}
              />

              {/* Legend overlay */}
              <View style={styles.legendBox}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#00F5FF' }]} />
                  <Text style={styles.legendText}>{t('nearby.legend_leagues')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>{t('nearby.legend_venues')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.legendText}>{t('nearby.legend_spots')}</Text>
                </View>
              </View>

              {/* Floating selected card preview */}
              {selectedEntity && (
                <View style={styles.floatingCardContainer}>
                  <View style={styles.floatingCardHeader}>
                    <TouchableOpacity
                      style={styles.closeCardBtn}
                      onPress={() => setSelectedEntity(null)}
                    >
                      <X size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <NearbyItemCard
                    type={selectedEntity.type}
                    item={selectedEntity.item}
                    isCardSelected
                  />
                </View>
              )}
            </View>
          ) : (
            /* List View */
            <ScrollView
              contentContainerStyle={styles.listScroll}
              showsVerticalScrollIndicator={false}
            >
              {combinedItems.length > 0 ? (
                combinedItems.map(({ type, item }) => (
                  <NearbyItemCard
                    key={`${type}-${item.id}`}
                    type={type}
                    item={item}
                    isCardSelected={selectedEntity?.item.id === item.id}
                    onPress={() => {
                      setSelectedEntity({ type, item });
                      setViewMode('map');
                    }}
                  />
                ))
              ) : (
                <View style={styles.emptyListContainer}>
                  <MapPin size={48} color={theme.textSecondary} opacity={0.3} />
                  <Text style={styles.emptyListTitle}>
                    {t('nearby.no_results')}
                  </Text>
                  <Text style={styles.emptyListSub}>
                    {t('nearby.no_results_sub', { radius: selectedRadius })}
                  </Text>
                  <TouchableOpacity
                    style={styles.expandRadiusBtn}
                    onPress={() => {
                      setSelectedRadius(100);
                      LocationService.setRadius(100);
                    }}
                  >
                    <Text style={styles.expandRadiusText}>
                      {t('nearby.expand_radius')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.04)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitleBox: {
      flex: 1,
      marginLeft: 12,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '900',
      color: theme.text,
      letterSpacing: 0.5,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    actionIconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark
        ? 'rgba(0, 245, 255, 0.08)'
        : 'rgba(0, 245, 255, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.03)',
      gap: 10,
    },
    chipsScroll: {
      alignItems: 'center',
      gap: 8,
      paddingRight: 10,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.04)',
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.04)',
    },
    chipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    chipActiveVenue: {
      backgroundColor: '#10B981',
      borderColor: '#10B981',
    },
    chipActiveSpot: {
      backgroundColor: '#F59E0B',
      borderColor: '#F59E0B',
    },
    chipText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    chipTextActive: {
      color: '#000',
      fontWeight: '800',
    },
    chipTextActiveVenue: {
      color: '#FFF',
      fontWeight: '800',
    },
    chipTextActiveSpot: {
      color: '#FFF',
      fontWeight: '800',
    },
    chipDivider: {
      width: 1,
      height: 20,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)',
      marginHorizontal: 4,
    },
    radiusChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.03)'
        : 'rgba(0, 0, 0, 0.03)',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    radiusChipActive: {
      borderColor: theme.primary,
      backgroundColor: isDark
        ? 'rgba(0, 245, 255, 0.08)'
        : 'rgba(0, 245, 255, 0.12)',
    },
    radiusChipText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    radiusChipTextActive: {
      color: theme.primary,
    },
    viewToggleBox: {
      flexDirection: 'row',
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 10,
      padding: 2,
    },
    toggleBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleBtnActive: {
      backgroundColor: theme.primary,
    },
    contentContainer: {
      flex: 1,
    },
    mapWrapper: {
      flex: 1,
      position: 'relative',
    },
    legendBox: {
      position: 'absolute',
      top: 15,
      left: 15,
      backgroundColor: isDark
        ? 'rgba(10, 25, 47, 0.9)'
        : 'rgba(255, 255, 255, 0.9)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      gap: 6,
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.08)',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text,
    },
    floatingCardContainer: {
      position: 'absolute',
      bottom: 20,
      left: 16,
      right: 16,
    },
    floatingCardHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: -8,
      zIndex: 10,
    },
    closeCardBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 4,
    },
    listScroll: {
      padding: 16,
      paddingBottom: 40,
    },
    centeredLoading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
    },
    loadingText: {
      marginTop: 15,
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
      textAlign: 'center',
    },
    centeredMessage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
    },
    noLocationTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginTop: 15,
      marginBottom: 8,
      textAlign: 'center',
    },
    noLocationSub: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    retryLocationBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
    },
    retryLocationText: {
      color: '#000',
      fontWeight: '800',
      fontSize: 13,
    },
    emptyListContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 30,
    },
    emptyListTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyListSub: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    expandRadiusBtn: {
      backgroundColor: isDark
        ? 'rgba(0, 245, 255, 0.12)'
        : 'rgba(0, 245, 255, 0.16)',
      borderWidth: 1,
      borderColor: theme.primary,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 12,
    },
    expandRadiusText: {
      color: theme.primary,
      fontWeight: '800',
      fontSize: 13,
    },
  });
