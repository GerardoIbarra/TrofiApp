import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useGetEloRankings } from '@/features/leagues/services/eloApi';
import { TrendingUp, ShieldAlert } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface EloRankingWidgetProps {
  leagueId?: string;
}

export function EloRankingWidget({ leagueId }: EloRankingWidgetProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  const { data: rankings, isLoading, isError, refetch } = useGetEloRankings(leagueId);

  useEffect(() => {
    refetch();
  }, [leagueId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.primary} />
        <Text style={styles.loadingText}>Cargando Rankings...</Text>
      </View>
    );
  }

  if (isError || !rankings || rankings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ShieldAlert size={40} color={theme.textSecondary} opacity={0.3} />
        <Text style={styles.emptyText}>No hay suficientes datos de Elo para mostrar el ranking aún.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TrendingUp size={20} color={theme.primary} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Power Ranking Global (ELO)</Text>
          <Text style={styles.subtitle}>Clasificación actualizada en tiempo real tras cada partido.</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.cellPos]}>#</Text>
            <Text style={[styles.headerCell, styles.cellTeam]}>Equipo</Text>
            <Text style={[styles.headerCell, styles.cellElo]}>Puntuación ELO</Text>
          </View>

          {rankings.map((item, index) => {
            const pos = index + 1;
            const isTop3 = pos <= 3;
            
            return (
              <View 
                key={item.team_id} 
                style={[
                  styles.tableRow, 
                  index % 2 !== 0 && styles.rowAlternate,
                  isTop3 && styles.rowElite
                ]}
              >
                <View style={[styles.posBadge, pos === 1 ? styles.posFirst : pos === 2 ? styles.posSecond : pos === 3 ? styles.posThird : null]}>
                  <Text style={styles.posText}>{pos}</Text>
                </View>
                
                <Text style={styles.teamName} numberOfLines={1}>{item.team_name.toUpperCase()}</Text>
                
                <View style={styles.eloContainer}>
                  <Text style={[styles.eloScore, isTop3 && { color: theme.primary, fontWeight: '900' }]}>
                    {Math.round(item.elo_rating)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 15,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
  },
  subtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    marginTop: 20,
  },
  emptyText: {
    color: theme.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  headerCell: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.textSecondary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
  },
  rowAlternate: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
  },
  rowElite: {
    backgroundColor: isDark ? 'rgba(255,215,0,0.05)' : 'rgba(255,215,0,0.1)', // Subtle gold tint
  },
  cellPos: { width: 60 },
  cellTeam: { width: 200, textAlign: 'left', paddingLeft: 10 },
  cellElo: { width: 120 },
  posBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  posFirst: { backgroundColor: '#FFD700' },
  posSecond: { backgroundColor: '#C0C0C0' },
  posThird: { backgroundColor: '#CD7F32' },
  posText: {
    fontSize: 12,
    fontWeight: '900',
    color: isDark ? '#FFF' : '#000',
  },
  teamName: {
    width: 200,
    fontSize: 13,
    fontWeight: '800',
    color: theme.text,
    paddingLeft: 10,
  },
  eloContainer: {
    width: 120,
    alignItems: 'center',
  },
  eloScore: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.text,
  },
});
