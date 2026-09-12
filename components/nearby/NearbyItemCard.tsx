import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Trophy, MapPin, ChevronRight, Navigation, Flame, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { League } from '@/features/leagues/types/league';
import { Venue } from '@/features/venues/types/venue';
import { PickupSpot } from '@/features/pickup/types/pickup';
import { NearbyItemType } from './types';

interface NearbyItemCardProps {
  type: NearbyItemType;
  item: League | Venue | PickupSpot;
  onPress?: () => void;
  isCardSelected?: boolean;
}

export function NearbyItemCard({
  type,
  item,
  onPress,
  isCardSelected = false,
}: NearbyItemCardProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark, isCardSelected, type);

  const isLeague = type === 'league';
  const isSpot = type === 'spot';
  const league = isLeague ? (item as League) : null;
  const venue = type === 'venue' ? (item as Venue) : null;
  const spot = isSpot ? (item as PickupSpot) : null;

  const title = item.name;
  const city = isLeague ? league?.city : (venue?.city || spot?.city);
  const country = isLeague ? league?.country : undefined;
  const distanceKm = item.distance_km;

  const handleAction = () => {
    if (isLeague) {
      router.push({
        pathname: '/league-detail',
        params: { id: item.id },
      });
    } else if (isSpot) {
      router.push({
        pathname: '/pickup-spot-detail',
        params: { id: item.id },
      });
    } else if (onPress) {
      onPress();
    }
  };

  const getBadgeText = () => {
    if (isSpot) return '⚽ RETA INFORMAL';
    if (isLeague) return '🏆 LIGA';
    return '🏟️ CANCHA / SEDE';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress || handleAction}
      activeOpacity={0.85}
    >
      <View style={styles.leftColumn}>
        <View style={styles.avatarBox}>
          {isLeague && league?.logo ? (
            <Image
              source={{ uri: league.logo }}
              style={styles.avatarImage}
              contentFit="contain"
            />
          ) : isLeague ? (
            <Trophy size={20} color={theme.primary} />
          ) : isSpot ? (
            <Flame size={20} color="#F59E0B" />
          ) : (
            <MapPin size={20} color="#10B981" />
          )}
        </View>
      </View>

      <View style={styles.contentColumn}>
        <View style={styles.topRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{getBadgeText()}</Text>
          </View>

          {isSpot && spot?.estimated_headcount != null && spot.estimated_headcount > 0 && (
            <View style={styles.activePlayersBadge}>
              <Users size={11} color="#F59E0B" />
              <Text style={styles.activePlayersText}>{spot.estimated_headcount} jugando</Text>
            </View>
          )}

          {distanceKm != null && (
            <View style={styles.distanceBadge}>
              <Navigation size={11} color={theme.primary} />
              <Text style={styles.distanceText}>
                {typeof distanceKm === 'number'
                  ? `${distanceKm.toFixed(2)} km`
                  : `${distanceKm} km`}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          <MapPin size={12} color={theme.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {city || (isSpot ? (spot?.spot_type || 'Cancha libre') : 'Ubicación disponible')}
            {country ? ` • ${country}` : ''}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={handleAction}
        activeOpacity={0.7}
      >
        <ChevronRight size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const createStyles = (
  theme: any,
  isDark: boolean,
  isSelected: boolean,
  type: NearbyItemType
) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1.5,
      borderColor: isSelected
        ? type === 'league'
          ? theme.primary
          : type === 'spot'
          ? '#F59E0B'
          : '#10B981'
        : isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.05)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    leftColumn: {
      marginRight: 12,
    },
    avatarBox: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        type === 'league'
          ? isDark
            ? 'rgba(0, 245, 255, 0.08)'
            : 'rgba(0, 245, 255, 0.12)'
          : type === 'spot'
          ? isDark
            ? 'rgba(245, 158, 11, 0.12)'
            : 'rgba(245, 158, 11, 0.16)'
          : isDark
          ? 'rgba(16, 185, 129, 0.12)'
          : 'rgba(16, 185, 129, 0.16)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor:
        type === 'league'
          ? 'rgba(0, 245, 255, 0.2)'
          : type === 'spot'
          ? 'rgba(245, 158, 11, 0.25)'
          : 'rgba(16, 185, 129, 0.25)',
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    contentColumn: {
      flex: 1,
      justifyContent: 'center',
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    typeBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor:
        type === 'league'
          ? isDark
            ? 'rgba(0, 245, 255, 0.12)'
            : 'rgba(0, 245, 255, 0.16)'
          : type === 'spot'
          ? isDark
            ? 'rgba(245, 158, 11, 0.15)'
            : 'rgba(245, 158, 11, 0.18)'
          : isDark
          ? 'rgba(16, 185, 129, 0.15)'
          : 'rgba(16, 185, 129, 0.18)',
    },
    typeBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: type === 'league' ? theme.primary : type === 'spot' ? '#F59E0B' : '#10B981',
      letterSpacing: 0.5,
    },
    activePlayersBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.16)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
    },
    activePlayersText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#F59E0B',
    },
    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.04)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
    },
    distanceText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.primary,
    },
    titleText: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 3,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    actionBtn: {
      paddingLeft: 10,
      paddingVertical: 8,
    },
  });
