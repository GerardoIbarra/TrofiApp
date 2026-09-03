import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, ExternalLink } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import {
  PlacementType,
  SponsorPlacement,
} from '@/features/sponsors/types/sponsor';
import {
  useGetSponsorPlacements,
  useRecordClick,
  useRecordImpression,
} from '@/features/sponsors/services/sponsorApi';

interface SponsorBannerProps {
  placementType: PlacementType;
  leagueId?: string;
  tournamentId?: string;
  teamId?: string;
  placement?: SponsorPlacement;
  style?: ViewStyle;
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({
  placementType,
  leagueId,
  tournamentId,
  teamId,
  placement: propPlacement,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const { data: fetchedPlacements } = useGetSponsorPlacements(
    propPlacement
      ? undefined
      : {
          placement_type: placementType,
          league: leagueId,
          tournament: tournamentId,
          team: teamId,
          is_active: true,
        }
  );

  const activePlacement = propPlacement || (fetchedPlacements && fetchedPlacements[0]);

  const recordImpressionMutation = useRecordImpression();
  const recordClickMutation = useRecordClick();
  const recordedImpressionRef = useRef<string | null>(null);

  useEffect(() => {
    if (activePlacement && activePlacement.id && recordedImpressionRef.current !== activePlacement.id) {
      recordedImpressionRef.current = activePlacement.id;
      recordImpressionMutation.mutate(activePlacement.id);
    }
  }, [activePlacement?.id]);

  if (!activePlacement) {
    return null;
  }

  const handlePress = async () => {
    if (activePlacement.id) {
      recordClickMutation.mutate(activePlacement.id);
    }

    const url = activePlacement.redirect_url || activePlacement.sponsor_website;
    if (url) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          await Linking.openURL(`https://${url}`);
        }
      } catch (err) {
        console.warn('Cannot open sponsor URL:', url, err);
      }
    }
  };

  const isCard = placementType === 'share_card';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[
        styles.container,
        isCard && styles.cardContainer,
        style,
      ]}
    >
      <LinearGradient
        colors={
          isDark
            ? ['rgba(25, 42, 60, 0.95)', 'rgba(15, 23, 42, 0.95)']
            : ['rgba(241, 245, 249, 0.98)', 'rgba(226, 232, 240, 0.95)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <Award size={12} color="#F59E0B" />
            <Text style={styles.badgeText}>
              {activePlacement.sponsor_name
                ? `Patrocinado por ${activePlacement.sponsor_name}`
                : 'Patrocinador Oficial'}
            </Text>
          </View>
          {(activePlacement.redirect_url || activePlacement.sponsor_website) && (
            <ExternalLink size={12} color={theme.textSecondary} />
          )}
        </View>

        <View style={styles.contentRow}>
          {activePlacement.image_url ? (
            <Image
              source={{ uri: activePlacement.image_url }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : activePlacement.sponsor_logo ? (
            <Image
              source={{ uri: activePlacement.sponsor_logo }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : null}

          <View style={styles.infoContainer}>
            {activePlacement.title && (
              <Text style={[styles.titleText, { color: theme.text }]} numberOfLines={1}>
                {activePlacement.title}
              </Text>
            )}
            <Text style={[styles.subText, { color: theme.textSecondary }]} numberOfLines={1}>
              {activePlacement.placement_type === 'standings_banner'
                ? 'Patrocinador exclusivo de la tabla de posiciones'
                : activePlacement.placement_type === 'match_banner'
                ? 'Espacio publicitario oficial del encuentro'
                : 'Patrocinador del evento'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      borderRadius: 14,
      overflow: 'hidden',
      marginVertical: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    cardContainer: {
      marginVertical: 6,
      borderRadius: 10,
    },
    gradient: {
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      paddingHorizontal: 8,
      paddingVertical: 2.5,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#F59E0B',
      letterSpacing: 0.3,
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    bannerImage: {
      width: 70,
      height: 42,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    logoImage: {
      width: 44,
      height: 44,
      borderRadius: 8,
    },
    infoContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    titleText: {
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 2,
    },
    subText: {
      fontSize: 11,
      fontWeight: '500',
    },
  });
