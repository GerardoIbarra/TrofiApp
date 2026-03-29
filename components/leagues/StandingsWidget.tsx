import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Filter } from 'lucide-react-native';
import { TrofiTheme } from '@/constants/theme';

const MOCK_STANDINGS = [
  { pos: '01', team: 'ATLÉTICO ZAPOPAN', p: 12, w: 10, isUser: false },
  { pos: '02', team: 'TROFI LEGENDS', p: 12, w: 9, isUser: true },
  { pos: '03', team: 'VALLE REAL FC', p: 12, w: 8, isUser: false },
  { pos: '04', team: 'LEONES DORADOS', p: 12, w: 7, isUser: false },
  { pos: '05', team: 'RAYOS NORTE', p: 12, w: 6, isUser: false },
];

export function StandingsWidget() {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>OFFICIAL STANDINGS</Text>
        <TouchableOpacity>
          <Filter size={20} color={TrofiTheme.textSecondary} />
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
          <Text style={[styles.posText, row.isUser && { color: TrofiTheme.primary }]}>
            {row.pos}
          </Text>
          <View style={styles.teamContainer}>
            <View style={styles.shieldPlaceholder} />
            <View>
              <Text style={[styles.teamText, row.isUser && { color: TrofiTheme.primary }]}>
                {row.team}
              </Text>
              {row.isUser && <Text style={styles.yourTeamLabel}>YOUR TEAM</Text>}
            </View>
          </View>
          <Text style={[styles.statText, row.isUser && { color: TrofiTheme.primary }]}>{row.p}</Text>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: TrofiTheme.surface, 
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    color: TrofiTheme.text,
    letterSpacing: 1,
  },
  columnsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  columnLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: TrofiTheme.textSecondary,
    letterSpacing: 1.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  userRow: {
    backgroundColor: 'rgba(0, 245, 255, 0.05)', // Faint cyan background
    borderLeftWidth: 3,
    borderLeftColor: TrofiTheme.primary,
    marginLeft: -20,
    paddingLeft: 17,
    marginRight: -20,
    paddingRight: 20,
  },
  posText: {
    width: 40,
    fontSize: 14,
    fontWeight: '900',
    color: TrofiTheme.textSecondary,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  teamText: {
    fontSize: 12,
    fontWeight: '800',
    color: TrofiTheme.text,
  },
  yourTeamLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: TrofiTheme.primary,
    marginTop: 2,
    letterSpacing: 1,
  },
  statText: {
    width: 30,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: TrofiTheme.text,
  },
  footerButton: {
    marginTop: 20,
    backgroundColor: '#1E293B',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: TrofiTheme.primary,
    letterSpacing: 1.5,
  },
});
