import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function GoldenBootWidget() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.card}>
      <Text style={styles.overline}>GOLDEN BOOT RACE</Text>
      
      <View style={styles.content}>
        <View style={styles.playerInfo}>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?img=11' }} 
            style={styles.avatar}
          />
          <View>
            <Text style={styles.playerName}>M. CARRILLO</Text>
            <Text style={styles.teamName}>TROFI LEGENDS</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statGiant}>14</Text>
            <Text style={styles.statLabel}>GOALS</Text>
          </View>
          <View style={styles.kpiContainer}>
            <Text style={styles.statGiant}>88'</Text>
            <Text style={styles.statLabel}>MINS/GOAL</Text>
          </View>
        </View>
      </View>

      {/* Watermark Football Icon (Faked with CSS) */}
      <View style={styles.watermark}>
        <View style={styles.watermarkCircle} />
      </View>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: theme.surface, 
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
    elevation: isDark ? 0 : 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.05,
    shadowRadius: 5,
  },
  overline: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.textSecondary,
    letterSpacing: 2,
    marginBottom: 20,
  },
  content: {
    zIndex: 2,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 25,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
  },
  playerName: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.text,
  },
  teamName: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.primary,
    letterSpacing: 1,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  kpiContainer: {
    alignItems: 'flex-end',
  },
  statGiant: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.textSecondary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  watermark: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 1,
    opacity: isDark ? 0.05 : 0.03,
  },
  watermarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 15,
    borderColor: isDark ? '#FFF' : '#000',
    borderStyle: 'dashed',
  },
});
