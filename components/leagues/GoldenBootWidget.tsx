import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { TrofiTheme } from '@/constants/theme';

export function GoldenBootWidget() {
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: TrofiTheme.surface, 
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  overline: {
    fontSize: 9,
    fontWeight: '800',
    color: TrofiTheme.textSecondary,
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
    backgroundColor: TrofiTheme.surface,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '900',
    color: TrofiTheme.text,
  },
  teamName: {
    fontSize: 10,
    fontWeight: '800',
    color: TrofiTheme.primary,
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
    color: TrofiTheme.text,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: TrofiTheme.textSecondary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  watermark: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 1,
    opacity: 0.05,
  },
  watermarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 15,
    borderColor: '#FFF',
    borderStyle: 'dashed',
  },
});
