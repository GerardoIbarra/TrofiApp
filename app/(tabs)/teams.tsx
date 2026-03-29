import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { LayoutHeader } from '@/components/LayoutHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Calendar, AlertCircle, Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const MOCK_TEAMS = [
  { 
    id: '1', 
    name: 'Real Goliza', 
    league: 'Liga Zapopan Norte', 
    standing: '2nd PLACE', 
    nextMatch: 'Sat, 18:00 • Field 4',
    logo: 'https://i.pravatar.cc/150?u=RealGoliza',
    status: 'scheduled'
  },
  { 
    id: '2', 
    name: 'Atle. San Pancho', 
    league: 'Torneo de Apertura', 
    standing: '5th PLACE', 
    nextMatch: 'Sun, 10:30 • Stadium Main',
    logo: 'https://i.pravatar.cc/150?u=AtlticoSanPancho',
    status: 'scheduled'
  },
  { 
    id: '3', 
    name: 'Trofi Legends', 
    league: 'Veterans League A', 
    standing: '1st PLACE', 
    nextMatch: 'Rescheduled • TBD',
    logo: 'https://i.pravatar.cc/150?u=Legends',
    status: 'alert'
  },
];

export default function TeamsScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={GlobalStyles.safeArea} edges={['top']}>
        <LayoutHeader title="TEAMS" />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.webContainer}>
            
            {/* Header Section */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.mainTitle}>MY TEAMS</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>3 TEAMS ACTIVE</Text>
                </View>
              </View>
            </View>

            {/* Teams List */}
            {MOCK_TEAMS.map((team) => (
              <View key={team.id} style={styles.teamCard}>
                <View style={styles.teamHeader}>
                  <Image source={{ uri: team.logo }} style={styles.teamLogo} />
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamNameText}>{team.name}</Text>
                    <Text style={styles.leagueNameText}>{team.league}</Text>
                  </View>
                </View>

                {/* Vertical Divider Indicator for #1 team */}
                {team.standing === '1st PLACE' && <View style={styles.exclusiveHighlight} />}

                <View style={styles.statsRow}>
                  <View style={styles.statColumn}>
                    <Text style={styles.statLabel}>STANDING</Text>
                    <Text style={styles.standingValue}>{team.standing}</Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={styles.statLabel}>NEXT MATCH</Text>
                    <View style={styles.nextMatchContainer}>
                      {team.status === 'alert' ? (
                        <AlertCircle size={14} color="#FF6B6B" style={{ marginRight: 6 }} />
                      ) : (
                        <Calendar size={14} color={theme.primary} style={{ marginRight: 6 }} />
                      )}
                      <Text style={[
                        styles.nextMatchValue,
                        team.status === 'alert' && { color: '#FF6B6B' }
                      ]}>
                        {team.nextMatch}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Team Page</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.manageButton}>
                    <Text style={styles.manageButtonText}>Manage Roster</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <Plus size={28} color="#001A2C" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
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
    marginTop: 25,
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: -1,
    marginBottom: 8,
  },
  activeBadge: {
    backgroundColor: theme.primary + '26', // opacity 0.15
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.primary + '4D', // opacity 0.3
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.primary,
    letterSpacing: 1,
  },
  teamCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    elevation: isDark ? 0 : 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0 : 0.1,
    shadowRadius: 10,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  teamLogo: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
  },
  teamInfo: {
    marginLeft: 18,
  },
  teamNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
  },
  leagueNameText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  exclusiveHighlight: {
    position: 'absolute',
    left: 0,
    top: 75,
    bottom: 25,
    width: 3,
    backgroundColor: theme.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statColumn: {
    width: '45%',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  standingValue: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.primary,
    fontStyle: 'italic',
  },
  nextMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextMatchValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  viewButton: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#001A2C',
  },
  manageButton: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.text,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});
