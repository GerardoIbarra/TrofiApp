import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { HomeFeedMatchCard } from '@/components/matches/HomeFeedMatchCard';

const { width } = Dimensions.get('window');

interface HomeFeaturedCarouselProps {
  homeFeed: any[];
  isLoading: boolean;
  activeCardIndex: number;
  onCardIndexChange: (index: number) => void;
  onExploreLeagues: () => void;
}

export const HomeFeaturedCarousel = React.memo(function HomeFeaturedCarousel({
  homeFeed,
  isLoading,
  activeCardIndex,
  onCardIndexChange,
  onExploreLeagues,
}: HomeFeaturedCarouselProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const cardWidth = width - 40;

  return (
    <View style={styles.carouselContainer}>
      {isLoading ? (
        <View
          style={[
            styles.featuredCard,
            {
              width: cardWidth,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: isDark ? '#16082A' : '#FFFFFF',
            },
          ]}
        >
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      ) : homeFeed && homeFeed.length > 0 ? (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth}
            decelerationRate="fast"
            scrollEventThrottle={16}
            onScroll={(e) => {
              const offset = e.nativeEvent.contentOffset.x;
              const index = Math.round(offset / cardWidth);
              if (index !== activeCardIndex) {
                onCardIndexChange(index);
              }
            }}
            contentContainerStyle={styles.carouselContent}
          >
            {homeFeed.map((item) => (
              <HomeFeedMatchCard
                key={item.match.id}
                feedItem={item}
                width={cardWidth}
              />
            ))}
          </ScrollView>
          {homeFeed.length > 1 && (
            <View style={styles.paginationDots}>
              {homeFeed.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activeCardIndex
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}
        </>
      ) : (
        <View
          style={[
            styles.featuredCard,
            {
              width: cardWidth,
              backgroundColor: isDark ? '#16082A' : '#FFFFFF',
            },
          ]}
        >
          <LinearGradient
            colors={
              isDark ? ['#2D1B4E', '#16082A'] : ['#FFFFFF', '#F9FAFB']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.cardGradient,
              { justifyContent: 'center', alignItems: 'center' },
            ]}
          >
            <View style={styles.emptyFeaturedCard}>
              <View
                style={[
                  styles.emptyIconContainer,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.03)',
                  },
                ]}
              >
                <Calendar size={40} color={theme.primary} />
              </View>
              <Text
                style={[
                  styles.emptyFeaturedTitle,
                  { color: isDark ? '#FFF' : '#000' },
                ]}
              >
                {t('home.no_matches') || 'NO MATCHES'}
              </Text>
              <Text
                style={[
                  styles.emptyFeaturedSubtitle,
                  {
                    color: isDark
                      ? 'rgba(255,255,255,0.6)'
                      : theme.textSecondary,
                  },
                ]}
              >
                {t('home.join_team_subtitle') ||
                  'Join a team to see your feed.'}
              </Text>

              <TouchableOpacity
                style={[
                  styles.emptyStateButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={onExploreLeagues}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyStateButtonText}>
                  {t('home.explore_leagues') || 'EXPLORE LEAGUES'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
    </View>
  );
});

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    carouselContainer: {
      width: '100%',
      minHeight: 280,
      marginBottom: 30,
    },
    carouselContent: {
      gap: 0,
    },
    featuredCard: {
      minHeight: 280,
      borderRadius: 30,
      overflow: 'hidden',
      elevation: isDark ? 0 : 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 12,
      marginBottom: 20,
    },
    cardGradient: {
      flex: 1,
      padding: 20,
    },
    emptyFeaturedCard: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 30,
      zIndex: 1,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.primary + '20',
    },
    emptyFeaturedTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.text,
      textAlign: 'center',
      letterSpacing: 1,
      marginBottom: 8,
    },
    emptyFeaturedSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 40,
      lineHeight: 20,
      marginBottom: 25,
    },
    paginationDots: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
      gap: 6,
    },
    dot: {
      height: 6,
      borderRadius: 3,
    },
    activeDot: {
      width: 16,
      backgroundColor: theme.primary,
    },
    inactiveDot: {
      width: 6,
      backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    },
    emptyStateButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      elevation: 4,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    emptyStateButtonText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#001A2C',
      letterSpacing: 0.5,
    },
  });
