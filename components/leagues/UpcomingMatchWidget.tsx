import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';

export function UpcomingMatchWidget() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.card}>
      <Text style={styles.overline}>UPCOMING MATCH</Text>

      <View style={styles.matchTeams}>
        <View style={styles.team}>
          <View style={[styles.shieldPlaceholder, { backgroundColor: '#FCD34D' }]} />
          <Text style={styles.teamName}>TROFI LEGENDS</Text>
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.team}>
          <View style={[styles.shieldPlaceholder, { backgroundColor: '#10B981' }]} />
          <Text style={styles.teamName}>VALLE REAL</Text>
        </View>
      </View>

      <View style={styles.matchDetails}>
        <Text style={styles.dateText}>SAT, 21 OCT • 20:00</Text>
        <Text style={styles.stadiumText}>ESTADIO MUNICIPAL ZAPOPAN</Text>
      </View>

      <PrimaryButton 
        title="MATCH CENTER" 
        onPress={() => console.log('Match Center')} 
        style={styles.actionButton}
      />
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
    elevation: isDark ? 0 : 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.05,
    shadowRadius: 5,
  },
  overline: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.primary,
    letterSpacing: 2,
    marginBottom: 20,
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  team: {
    alignItems: 'center',
    width: 100,
  },
  shieldPlaceholder: {
    width: 46,
    height: 54,
    borderRadius: 6,
    marginBottom: 10,
    opacity: 0.8,
  },
  teamName: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  vsText: {
    fontSize: 22,
    fontWeight: '900',
    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)',
    fontStyle: 'italic',
  },
  matchDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: 1,
    marginBottom: 4,
  },
  stadiumText: {
    fontSize: 8,
    color: theme.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  actionButton: {
    width: '100%',
    borderRadius: 12, // Consistente con otros diseños
    paddingVertical: 14,
  },
});
