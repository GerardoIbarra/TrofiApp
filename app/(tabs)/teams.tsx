import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { LayoutHeader } from '@/components/LayoutHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrofiTheme } from '@/constants/theme';
import { ChevronRight, Plus } from 'lucide-react-native';

const MOCK_TEAMS = [
  { id: '1', name: 'Trofi Legends', league: 'Zapopan Norte', players: 12, isUser: true },
  { id: '2', name: 'Zapopan FC', league: 'Zapopan Regional', players: 15, isUser: false },
];

export default function TeamsScreen() {
  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={GlobalStyles.safeArea}>
        <LayoutHeader />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.webContainer}>
            <View style={styles.headerRow}>
              <Text style={GlobalStyles.sectionTitle}>MIS EQUIPOS</Text>
              <TouchableOpacity style={styles.addButton}>
                <Plus size={20} color={TrofiTheme.background} />
              </TouchableOpacity>
            </View>

            {MOCK_TEAMS.map((team) => (
              <TouchableOpacity key={team.id} style={styles.teamCard} activeOpacity={0.7}>
                {team.isUser && <View style={styles.userHighlight} />}
                <View style={styles.teamInfo}>
                  <View style={styles.badgePlaceholder} />
                  <View>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.leagueName}>{team.league}</Text>
                  </View>
                </View>
                <View style={styles.rightSection}>
                  <Text style={styles.playersCount}>{team.players} JUGADORES</Text>
                  <ChevronRight size={20} color={TrofiTheme.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 110,
  },
  webContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TrofiTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamCard: {
    backgroundColor: TrofiTheme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  userHighlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: TrofiTheme.primary,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  badgePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '800',
    color: TrofiTheme.text,
  },
  leagueName: {
    fontSize: 12,
    color: TrofiTheme.textSecondary,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playersCount: {
    fontSize: 10,
    fontWeight: '700',
    color: TrofiTheme.primary,
    letterSpacing: 0.5,
  },
});
