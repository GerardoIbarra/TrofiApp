import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import {
  MapPin,
  Users,
  Flame,
  CheckCircle2,
  Star,
  ChevronRight,
  Compass,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { PickupSpot } from '@/features/pickup/types/pickup';

interface PickupSpotCardProps {
  spot: PickupSpot;
  onPress?: () => void;
}

export const PickupSpotCard = React.memo(function PickupSpotCard({
  spot,
  onPress,
}: PickupSpotCardProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: '/pickup-spot-detail' as any,
        params: { id: spot.id },
      });
    }
  };

  const typeLabels: Record<string, string> = {
    park: 'Parque',
    street: 'Calle',
    court: 'Cancha',
    field: 'Campo',
    other: 'Reta',
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.content}>
        {/* Top Badges */}
        <View style={styles.topBadgesRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {typeLabels[spot.spot_type] || spot.spot_type}
            </Text>
          </View>

          <View style={styles.rightBadges}>
            {spot.is_trending && (
              <View style={styles.trendingBadge}>
                <Flame size={12} color="#EF4444" />
                <Text style={styles.trendingText}>Trending</Text>
              </View>
            )}

            {spot.is_verified && (
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={12} color="#4ADE80" />
                <Text style={styles.verifiedText}>Verificada</Text>
              </View>
            )}
          </View>
        </View>

        {/* Spot Name & Location */}
        <Text style={styles.spotName} numberOfLines={1}>
          {spot.name}
        </Text>

        <View style={styles.locationRow}>
          <MapPin size={13} color={theme.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {spot.address || spot.city || 'Ubicación registrada'}
          </Text>
          {spot.distance_km != null && (
            <Text style={styles.distanceText}>• a {spot.distance_km.toFixed(1)} km</Text>
          )}
        </View>

        {/* Stats Row: Checkins / Headcount / Rating */}
        <View style={styles.statsRow}>
          <View style={styles.liveStat}>
            <Users
              size={14}
              color={spot.active_checkin_count > 0 ? '#4ADE80' : theme.textSecondary}
            />
            <Text
              style={[
                styles.liveStatText,
                spot.active_checkin_count > 0 && styles.liveStatActive,
              ]}
            >
              {spot.active_checkin_count > 0
                ? `${spot.active_checkin_count} jugando`
                : 'Sin jugadores ahora'}
              {spot.estimated_headcount > spot.active_checkin_count &&
                ` (~${spot.estimated_headcount} en cancha)`}
            </Text>
          </View>

          {spot.average_rating > 0 && (
            <View style={styles.ratingBadge}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{spot.average_rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>

      <ChevronRight size={18} color={theme.textSecondary} style={{ marginRight: 10 }} />
    </TouchableOpacity>
  );
});

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      padding: 14,
      marginBottom: 10,
    },
    content: {
      flex: 1,
      gap: 6,
    },
    topBadgesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    typeBadge: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    typeBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.textSecondary,
      textTransform: 'uppercase',
    },
    rightBadges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    trendingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
    },
    trendingText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#EF4444',
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(74, 222, 128, 0.15)',
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
    },
    verifiedText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#4ADE80',
    },
    spotName: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    locationText: {
      fontSize: 12,
      color: theme.textSecondary,
      flexShrink: 1,
    },
    distanceText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.primary,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
    },
    liveStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    liveStatText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    liveStatActive: {
      color: '#4ADE80',
      fontWeight: '700',
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    ratingText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#F59E0B',
    },
  });
