import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/components/ui/feedback/Skeleton';
import { useTheme } from '@/context/ThemeContext';

export function MatchCardSkeleton() {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
      ]}
    >
      {/* Header: Date & Tag */}
      <View style={styles.cardHeader}>
        <Skeleton width={120} height={14} borderRadius={4} />
        <Skeleton width={50} height={18} borderRadius={6} />
      </View>

      {/* Main: Team 1 VS Team 2 */}
      <View style={styles.matchMain}>
        <View style={styles.teamInfo}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} />
          <Skeleton width={70} height={12} borderRadius={4} />
        </View>

        <View style={styles.scoreContainer}>
          <Skeleton width={48} height={26} borderRadius={6} />
        </View>

        <View style={styles.teamInfo}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} />
          <Skeleton width={70} height={12} borderRadius={4} />
        </View>
      </View>

      {/* Footer: Venue and Status */}
      <View
        style={[
          styles.cardFooter,
          { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
        ]}
      >
        <Skeleton width={130} height={12} borderRadius={4} />
        <Skeleton width={55} height={12} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  matchMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  teamInfo: {
    alignItems: 'center',
    width: '35%',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
