import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/components/ui/feedback/Skeleton';
import { useTheme } from '@/context/ThemeContext';

export function TeamCardSkeleton() {
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
      <View style={styles.header}>
        <Skeleton width={65} height={65} borderRadius={12} />
        <View style={styles.info}>
          <Skeleton width="70%" height={20} borderRadius={6} style={{ marginBottom: 8 }} />
          <Skeleton width="45%" height={14} borderRadius={6} />
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statColumn}>
          <Skeleton width={60} height={10} borderRadius={5} style={{ marginBottom: 8 }} />
          <Skeleton width={90} height={16} borderRadius={6} />
        </View>
        <View style={styles.statColumn}>
          <Skeleton width={60} height={10} borderRadius={5} style={{ marginBottom: 8 }} />
          <Skeleton width={90} height={16} borderRadius={6} />
        </View>
      </View>
      <Skeleton width="100%" height={44} borderRadius={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  info: {
    marginLeft: 18,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 20,
  },
  statColumn: {
    flex: 1,
  },
});
