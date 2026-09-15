import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/components/ui/feedback/Skeleton';
import { useTheme } from '@/context/ThemeContext';

export function MarketListingSkeleton() {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        },
      ]}
    >
      <View style={styles.header}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.info}>
          <Skeleton width="60%" height={16} borderRadius={6} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={12} borderRadius={6} />
        </View>
        <Skeleton width={40} height={20} borderRadius={8} />
      </View>
      <Skeleton width="100%" height={36} borderRadius={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
});
