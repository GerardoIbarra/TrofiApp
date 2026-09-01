import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlayerCard } from '@/features/players/schemas/playerProfileSchema';

interface PlayerCardViewProps {
  card: PlayerCard;
  playerName: string;
  isProvisional?: boolean;
}

const RARITY_COLORS: Record<string, readonly [string, string, ...string[]]> = {
  bronze: ['#CD7F32', '#8B5A2B'],
  silver: ['#E0E0E0', '#9E9E9E'],
  gold: ['#FFD700', '#B8860B'],
  elite: ['#9C27B0', '#4A148C'],
  iconic: ['#000000', '#434343'],
};

export function PlayerCardView({ card, playerName, isProvisional }: PlayerCardViewProps) {
  const gradientColors = RARITY_COLORS[card.rarity] || RARITY_COLORS.gold;

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={gradientColors as any}
        style={styles.cardBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Provisional Badge */}
        {isProvisional && (
          <View style={styles.provisionalBadge}>
            <Text style={styles.provisionalText}>PROVISIONAL</Text>
          </View>
        )}

        <View style={styles.topSection}>
          <View style={styles.ratingBox}>
            <Text style={styles.overallText}>{card.overall ?? '-'}</Text>
            <Text style={styles.positionText}>{card.position || 'N/A'}</Text>
          </View>
          <View style={styles.photoPlaceholder}>
            {/* Player photo will go here */}
          </View>
        </View>

        <View style={styles.nameSection}>
          <Text style={styles.nameText} numberOfLines={1}>{playerName.toUpperCase()}</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statColumn}>
            <View style={styles.statRow}>
              <Text style={styles.statValue}>{card.pace ?? '-'}</Text>
              <Text style={styles.statLabel}>PAC</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statValue}>{card.shooting ?? '-'}</Text>
              <Text style={styles.statLabel}>SHO</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statValue}>{card.passing ?? '-'}</Text>
              <Text style={styles.statLabel}>PAS</Text>
            </View>
          </View>

          <View style={styles.statColumn}>
            <View style={styles.statRow}>
              <Text style={styles.statValue}>{card.dribbling ?? '-'}</Text>
              <Text style={styles.statLabel}>DRI</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statValue}>{card.defense ?? '-'}</Text>
              <Text style={styles.statLabel}>DEF</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statValue}>{card.physical ?? '-'}</Text>
              <Text style={styles.statLabel}>PHY</Text>
            </View>
          </View>
        </View>

        {card.card_type !== 'base' && (
          <View style={styles.cardTypeBadge}>
            <Text style={styles.cardTypeText}>{card.card_type.replace('_', ' ').toUpperCase()}</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 260,
    height: 380,
    alignSelf: 'center',
    marginVertical: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardBackground: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  provisionalBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  provisionalText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  topSection: {
    flexDirection: 'row',
    height: 120,
  },
  ratingBox: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  overallText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 48,
  },
  positionText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    opacity: 0.9,
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  nameSection: {
    alignItems: 'center',
    marginVertical: 15,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 10,
  },
  statColumn: {
    width: '45%',
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    width: 28,
    textAlign: 'right',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    opacity: 0.9,
  },
  cardTypeBadge: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardTypeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
