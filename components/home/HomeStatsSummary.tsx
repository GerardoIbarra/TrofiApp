import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, ArrowUpRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

interface HomeStatsSummaryProps {
  onPressBanner?: () => void;
}

export const HomeStatsSummary = React.memo(function HomeStatsSummary({
  onPressBanner,
}: HomeStatsSummaryProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  return (
    <>
      {/* Stats Summary Area */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('home.victories')}</Text>
          <View style={styles.statValueContainer}>
            <Text style={styles.statValue}>94%</Text>
            <TrendingUp size={16} color={theme.primary} />
          </View>
          <View style={styles.statBarContainer}>
            <View style={[styles.statBar, { width: '94%' }]} />
          </View>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>
            {t('home.goals')} / {t('profile.matches')}
          </Text>
          <View style={styles.statValueContainer}>
            <Text style={styles.statValue}>2.2</Text>
            <TrendingUp size={16} color={theme.primary} />
          </View>
          <View style={styles.statBarContainer}>
            <View style={[styles.statBar, { width: '70%' }]} />
          </View>
        </View>
      </View>

      {/* Promotional Banner */}
      <TouchableOpacity
        style={styles.bannerCard}
        activeOpacity={0.85}
        onPress={onPressBanner}
      >
        <LinearGradient
          colors={['#004E92', '#000428']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <View>
            <Text style={styles.bannerOverline}>LIGA DE INVIERNO 2024</Text>
            <Text style={styles.bannerTitle}>El Camino a la Gloria</Text>
            <Text style={styles.bannerSubtitle}>
              Inscripciones abiertas ahora.
            </Text>
          </View>
          <View style={styles.bannerArrow}>
            <ArrowUpRight size={20} color="#FFF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </>
  );
});

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 25,
    },
    statBox: {
      width: (width - 55) / 2,
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 15,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)',
      elevation: isDark ? 0 : 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.12,
      shadowRadius: 8,
    },
    statLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: theme.textSecondary,
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
      color: theme.text,
    },
    statBarContainer: {
      height: 4,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    statBar: {
      height: '100%',
      backgroundColor: theme.primary,
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
      color: '#FFF',
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
  });
