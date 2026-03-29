import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Filter } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

const MOCK_STANDINGS = [
  { pos: '01', team: 'ATLÉTICO ZAPOPAN', p: 12, w: 10, isUser: false },
  { pos: '02', team: 'TROFI LEGENDS', p: 12, w: 9, isUser: true },
  { pos: '03', team: 'VALLE REAL FC', p: 12, w: 8, isUser: false },
  { pos: '04', team: 'LEONES DORADOS', p: 12, w: 7, isUser: false },
  { pos: '05', team: 'RAYOS NORTE', p: 12, w: 6, isUser: false },
];

export function StandingsWidget() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>OFFICIAL STANDINGS</Text>
        <TouchableOpacity>
          <Filter size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Table Columns */}
      <View style={styles.columnsRow}>
        <Text style={[styles.columnLabel, { width: 40 }]}>POS</Text>
        <Text style={[styles.columnLabel, { flex: 1 }]}>TEAM</Text>
        <Text style={[styles.columnLabel, { width: 30, textAlign: 'center' }]}>P</Text>
        <Text style={[styles.columnLabel, { width: 30, textAlign: 'center' }]}>W</Text>
      </View>

      {/* Table Rows */}
      {MOCK_STANDINGS.map((row) => (
        <View key={row.pos} style={[styles.row, row.isUser && styles.userRow]}>
          <Text style={[styles.posText, row.isUser && { color: theme.primary }]}>
            {row.pos}
          </Text>
          <View style={styles.teamContainer}>
            <View style={styles.shieldPlaceholder} />
            <View>
              <Text style={[styles.teamText, row.isUser && { color: theme.primary }]}>
                {row.team}
              </Text>
              {row.isUser && <Text style={styles.yourTeamLabel}>YOUR TEAM</Text>}
            </View>
          </View>
          <Text style={[styles.statText, row.isUser && { color: theme.primary }]}>{row.p}</Text>
          <Text style={styles.statText}>{row.w}</Text>
        </View>
      ))}

      {/* Footer Button */}
      <TouchableOpacity style={styles.footerButton}>
        <Text style={styles.footerButtonText}>VIEW FULL STANDINGS</Text>
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: 1,
  },
  columnsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  columnLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.textSecondary,
    letterSpacing: 1.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  },
  userRow: {
    backgroundColor: theme.primary + '1A', // 10% opacity
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
    marginLeft: -20,
    paddingLeft: 17,
    marginRight: -20,
    paddingRight: 20,
  },
  posText: {
    width: 40,
    fontSize: 14,
    fontWeight: '900',
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  teamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shieldPlaceholder: {
    width: 24,
    height: 30,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  teamText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.text,
  },
  yourTeamLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: theme.primary,
    marginTop: 2,
    letterSpacing: 1,
  },
  statText: {
    width: 30,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: theme.text,
  },
  footerButton: {
    marginTop: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  footerButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.primary,
    letterSpacing: 1.5,
  },
});
