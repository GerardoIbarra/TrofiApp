import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/components/ui/feedback/Skeleton';
import { useTheme } from '@/context/ThemeContext';

export function PlayerCardSkeleton() {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
        },
      ]}
    >
      <View style={styles.header}>
        <Skeleton width={48} height={16} borderRadius={8} />
        <Skeleton width={30} height={16} borderRadius={6} />
      </View>
      <Skeleton width={62} height={62} borderRadius={31} style={{ marginVertical: 4 }} />
      <View style={styles.footer}>
        <Skeleton width={90} height={12} borderRadius={6} style={{ marginBottom: 6 }} />
        <Skeleton width={60} height={10} borderRadius={6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 190,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
});
