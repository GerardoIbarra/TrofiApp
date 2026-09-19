import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Skeleton } from '@/components/ui/feedback/Skeleton';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';

export function TeamDetailSkeleton() {
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const tileWidth = (width - 64) / 4;

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.webContainer}>
          {/* Header Banner Skeleton */}
          <View style={[styles.headerBanner, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
            <View style={styles.headerContent}>
              <View style={styles.tagRow}>
                <Skeleton width={80} height={18} borderRadius={4} />
                <Skeleton width={100} height={14} borderRadius={4} />
              </View>
              <Skeleton width="75%" height={38} borderRadius={8} style={{ marginVertical: 12 }} />
              <View style={styles.headerStatsRow}>
                <Skeleton width={90} height={16} borderRadius={4} />
                <Skeleton width={70} height={16} borderRadius={4} />
              </View>
            </View>
          </View>

          {/* Highlights & Stat Tiles */}
          <View style={styles.body}>
            <View style={styles.statsGrid}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.statTile,
                    {
                      width: tileWidth,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                >
                  <Skeleton width={32} height={20} borderRadius={6} style={{ marginBottom: 6 }} />
                  <Skeleton width={44} height={10} borderRadius={4} />
                </View>
              ))}
            </View>

            {/* Tabs Row Skeleton */}
            <View style={styles.tabsRow}>
              {[100, 110, 90, 80].map((w, idx) => (
                <Skeleton key={idx} width={w} height={38} borderRadius={20} />
              ))}
            </View>

            {/* Content List Items Skeleton */}
            <View style={styles.listContainer}>
              {[1, 2, 3, 4, 5].map((item) => (
                <View
                  key={item}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                >
                  <Skeleton width={34} height={34} borderRadius={17} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <Skeleton width="60%" height={16} borderRadius={6} />
                    <Skeleton width="35%" height={12} borderRadius={4} />
                  </View>
                  <Skeleton width={48} height={28} borderRadius={8} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  webContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  headerBanner: {
    width: '100%',
    height: 340,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 35,
  },
  headerContent: {
    width: '100%',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerStatsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statTile: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  listContainer: {
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
});
