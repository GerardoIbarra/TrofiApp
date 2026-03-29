import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Switch } from 'react-native';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { LayoutHeader } from '@/components/LayoutHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, LogOut, ChevronRight, Award, Shield, User, Star, Activity, Mail, Moon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

const PERFORMANCE_DATA = [
  { height: 40, active: false },
  { height: 60, active: false },
  { height: 75, active: false },
  { height: 50, active: false },
  { height: 80, active: true },
  { height: 45, active: false },
  { height: 70, active: false },
  { height: 78, active: false },
  { height: 85, active: true },
];

const MATCHES = [
  { id: '1', date: 'OCT 24', opp: 'Blue Hawks', score: '3 - 1', rating: '9.2', stats: '2 GOALS • 90\'', winner: true },
  { id: '2', date: 'OCT 18', opp: 'Strikers United', score: '0 - 0', rating: '7.1', stats: '0 ASSIST • 78\'', winner: false },
  { id: '3', date: 'OCT 12', opp: 'City Stars', score: '2 - 0', rating: '8.4', stats: '1 ASSIST • 90\'', winner: true },
];

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = createStyles(theme, isDark);

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={GlobalStyles.safeArea} edges={['top']}>
        <LayoutHeader title="PLAYER PROFILE" />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.webContainer}>
            
            {/* Player Hero Section */}
            <View style={styles.heroSection}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/209637/pexels-photo-209637.jpeg?auto=compress&cs=tinysrgb&w=800' }} 
                style={styles.heroImage} 
              />
              <LinearGradient
                colors={['transparent', isDark ? 'rgba(10, 25, 47, 0.95)' : 'rgba(255, 255, 255, 0.95)']}
                style={styles.heroGradient}
              />
              <View style={styles.heroContent}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE SEASON</Text>
                </View>
                <Text style={styles.playerName}>RICARDO</Text>
                <Text style={styles.playerLastName}>MENDEZ</Text>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>POSITION</Text>
                    <Text style={styles.infoValue}>Striker</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>JERSEY</Text>
                    <Text style={styles.infoValue}>#9</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>HEIGHT</Text>
                    <Text style={styles.infoValue}>188cm</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Core Stats */}
            <View style={styles.kpiRow}>
              <KPIBox label="GOALS" value="14" theme={theme} isDark={isDark} />
              <KPIBox label="ASSISTS" value="08" theme={theme} isDark={isDark} />
              <KPIBox label="MATCHES" value="22" theme={theme} isDark={isDark} />
            </View>

            {/* Current Team Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionOverline}>CURRENT TEAM</Text>
            </View>
            <View style={styles.teamCard}>
               <View style={styles.teamBrandBox}>
                  <Activity size={24} color={theme.primary} />
               </View>
               <View style={styles.teamCoreInfo}>
                  <Text style={styles.teamNameTitle}>Real Metros FC</Text>
                  <Text style={styles.teamSubtitle}>Elite Division • Tier A</Text>
               </View>
               <TouchableOpacity style={styles.viewTeamBtn}>
                  <Text style={styles.viewTeamBtnText}>VIEW TEAM PAGE</Text>
               </TouchableOpacity>
            </View>

            {/* Performance Trend Chart */}
            <View style={styles.trendSection}>
              <View style={styles.trendHeader}>
                <View>
                  <Text style={styles.trendTitle}>PERFORMANCE TREND</Text>
                  <Text style={styles.trendSubtitle}>Avg. Match Rating: <Text style={{ color: theme.primary }}>8.4</Text></Text>
                </View>
                <Text style={styles.lastGamesText}>LAST 10 GAMES</Text>
              </View>
              
              <View style={styles.chartContainer}>
                {PERFORMANCE_DATA.map((bar, i) => (
                  <View key={i} style={[
                    styles.chartBar, 
                    { height: bar.height, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                    bar.active && { backgroundColor: theme.primary }
                  ]} />
                ))}
              </View>
            </View>

            {/* Recent Matches */}
            <Text style={styles.mainSectionTitle}>RECENT MATCHES</Text>
            {MATCHES.map((match) => (
              <TouchableOpacity key={match.id} style={styles.matchCard}>
                <View style={styles.matchDateColumn}>
                  <Text style={styles.matchDateMonth}>OCT</Text>
                  <Text style={styles.matchDateDay}>{match.date.split(' ')[1]}</Text>
                </View>
                
                <View style={styles.matchMainInfo}>
                  <View style={styles.matchTeamsRow}>
                    <View style={styles.teamsNameBox}>
                      <Text style={styles.matchTeamName}>{match.winner ? 'Real Metros FC' : match.opp}</Text>
                      <Text style={styles.matchTeamName}>{match.winner ? match.opp : 'Real Metros FC'}</Text>
                    </View>
                    <View style={styles.scoreBox}>
                      <Text style={styles.matchScore}>{match.score}</Text>
                    </View>
                  </View>
                  <View style={styles.matchSmallStats}>
                    <Star size={12} color={theme.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.smallStatsText}>{match.stats}</Text>
                  </View>
                </View>

                <View style={styles.ratingCircle}>
                  <Text style={styles.ratingText}>{match.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* CONFIGURATION */}
            <View style={[styles.sectionHeader, { marginTop: 40 }]}>
              <Text style={styles.mainSectionTitle}>CONFIGURACIÓN</Text>
            </View>

            {/* Theme Toggle Switch */}
            <View style={styles.menuItem}>
              <View style={styles.menuIconText}>
                <Moon size={20} color={theme.primary} />
                <Text style={styles.menuLabel}>Modo Oscuro</Text>
              </View>
              <Switch 
                value={isDark} 
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor={isDark ? '#FFF' : '#f4f3f4'}
              />
            </View>

            <MenuItem icon={<User size={20} color={theme.primary} />} label="Mi Cuenta" theme={theme} />
            <MenuItem icon={<Award size={20} color={theme.primary} />} label="Logros y Trofeos" theme={theme} />
            <MenuItem icon={<Shield size={20} color={theme.primary} />} label="Privacidad y Seguridad" theme={theme} />
            <MenuItem icon={<Settings size={20} color={theme.primary} />} label="Ajustes de la App" theme={theme} />

            <TouchableOpacity style={styles.logoutButton}>
              <LogOut size={20} color={theme.error} />
              <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function KPIBox({ label, value, theme, isDark }: { label: string, value: string, theme: any, isDark: boolean }) {
  const styles = createStyles(theme, isDark);
  return (
    <View style={styles.kpiBox}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label, theme }: { icon: React.ReactNode, label: string, theme: any }) {
  const styles = createStyles(theme, false);
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
      <View style={styles.menuIconText}>
        {icon}
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <ChevronRight size={18} color={theme.textSecondary} />
    </TouchableOpacity>
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
  heroSection: {
    height: 400,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary + '33',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.primary,
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.primary,
  },
  playerName: {
    fontSize: 48,
    fontWeight: '900',
    color: isDark ? '#FFF' : theme.text,
    fontStyle: 'italic',
    lineHeight: 52,
    letterSpacing: -1,
  },
  playerLastName: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.primary,
    fontStyle: 'italic',
    lineHeight: 52,
    marginTop: -5,
    letterSpacing: -1,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 30,
  },
  infoItem: {
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '800',
    color: isDark ? '#FFF' : theme.text,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 25,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    elevation: isDark ? 0 : 2,
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.text,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionOverline: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  teamCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    elevation: isDark ? 0 : 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.05,
    shadowRadius: 10,
  },
  teamBrandBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  teamCoreInfo: {
    flex: 1,
  },
  teamNameTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
  },
  teamSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  viewTeamBtn: {
    marginTop: 20,
    width: '100%',
    height: 50,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewTeamBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.text,
  },
  trendSection: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    elevation: isDark ? 0 : 3,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.text,
  },
  trendSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  lastGamesText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.textSecondary,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    paddingHorizontal: 10,
  },
  chartBar: {
    width: 25,
    borderRadius: 4,
  },
  mainSectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.text,
    marginBottom: 20,
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    elevation: isDark ? 0 : 2,
  },
  matchDateColumn: {
    alignItems: 'center',
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    width: 60,
  },
  matchDateMonth: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.textSecondary,
  },
  matchDateDay: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.text,
  },
  matchMainInfo: {
    flex: 1,
    paddingLeft: 15,
  },
  matchTeamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamsNameBox: {
    flex: 1,
  },
  matchTeamName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.text,
  },
  scoreBox: {
    paddingHorizontal: 10,
  },
  matchScore: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.primary,
    fontStyle: 'italic',
  },
  matchSmallStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  smallStatsText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.textSecondary,
  },
  ratingCircle: {
    width: 48,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary + '1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.primary + '4D',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '900',
    color: theme.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    elevation: isDark ? 0 : 2,
  },
  menuIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    padding: 15,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.error,
    letterSpacing: 1,
  },
});
