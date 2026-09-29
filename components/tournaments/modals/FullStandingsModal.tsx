import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { X, Share2, Trophy, Info, Shield } from 'lucide-react-native';
import { StandingItem } from '@/features/leagues/types/standings';
import { Tournament } from '@/features/tournaments/types/tournament';

interface FullStandingsModalProps {
  visible: boolean;
  onClose: () => void;
  standings: StandingItem[];
  tournament?: Tournament;
  tournamentId: string;
  onShare?: () => void;
}

export function FullStandingsModal({
  visible,
  onClose,
  standings,
  tournament,
  onShare,
}: FullStandingsModalProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  const getPositionStyle = (pos: number) => {
    if (pos === 1) return styles.posFirst;
    if (pos === 2) return styles.posSecond;
    if (pos === 3) return styles.posThird;
    return null;
  };

  const tiebreakerLabel =
    tournament?.standings_tiebreaker === 'head_to_head'
      ? 'Duelo Directo (Head to Head)'
      : 'Diferencia de Goles (DG)';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} activeOpacity={0.7}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {t('standings.view_full', 'Tabla de Posiciones')}
            </Text>
            {tournament?.name && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {tournament.name}
              </Text>
            )}
          </View>

          {onShare ? (
            <TouchableOpacity onPress={onShare} style={styles.iconBtn} activeOpacity={0.7}>
              <Share2 size={20} color={theme.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Tournament / Tiebreaker Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryBadge}>
                <Trophy size={14} color={theme.primary} />
                <Text style={styles.summaryBadgeText}>
                  {standings.length} {standings.length === 1 ? 'Equipo' : 'Equipos'}
                </Text>
              </View>

              <View style={[styles.summaryBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
                <Info size={13} color={theme.textSecondary} />
                <Text style={styles.tiebreakerText}>
                  Criterio: {tiebreakerLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Full Standings Table with Pinned Left (Team) and Pinned Right (PTS) */}
          <View style={styles.tableCard}>
            {/* Columna Fija Izquierda: Posición (#) y Nombre del Equipo */}
            <View style={styles.fixedLeftColumn}>
              <View style={[styles.tableHeader, styles.headerLeft]}>
                <Text style={[styles.headerCell, styles.cellPos]}>#</Text>
                <Text style={[styles.headerCell, styles.cellTeam]}>
                  {t('standings.header_team')}
                </Text>
              </View>
              {standings.map((item, index) => {
                if (!item) return null;
                const rawName = item.team_name || (item as any)?.team?.name || (item as any)?.name || 'Equipo';
                const teamName = typeof rawName === 'string' ? rawName.toUpperCase() : 'EQUIPO';
                const position = item.position ?? index + 1;
                const safeId = typeof item.tournament_team === 'string' 
                  ? item.tournament_team 
                  : (item as any)?.tournament_team?.id || (item as any)?.id || (item as any)?.team_id || (item as any)?.team?.id || index;

                return (
                  <View
                    key={`f-l-${safeId}-${index}`}
                    style={[
                      styles.tableRow,
                      styles.rowLeft,
                      index % 2 !== 0 && styles.rowAlternate,
                      position <= 3 && styles.rowElite,
                    ]}
                  >
                    <View style={[styles.posBadge, getPositionStyle(position)]}>
                      <Text style={styles.posText}>{position}</Text>
                    </View>
                    <Text style={styles.teamName} numberOfLines={1}>
                      {teamName}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Columnas Intermedias con Scroll Horizontal: GR, PJ, PG, PE, PP, GF, GC, DG */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              style={styles.scrollableMiddle}
            >
              <View>
                <View style={[styles.tableHeader, styles.headerMiddle]}>
                  <Text style={[styles.headerCell, styles.cellGroup]}>
                    {t('standings.header_group')}
                  </Text>
                  <Text style={[styles.headerCell, styles.cellStat]}>
                    {t('standings.header_played')}
                  </Text>
                  <Text style={[styles.headerCell, styles.cellStat]}>
                    {t('standings.header_wins')}
                  </Text>
                  <Text style={[styles.headerCell, styles.cellStat]}>
                    {t('standings.header_draws')}
                  </Text>
                  <Text style={[styles.headerCell, styles.cellStat]}>
                    {t('standings.header_losses')}
                  </Text>
                  <Text style={[styles.headerCell, styles.cellStat]}>
                    {t('standings.header_goals_for')}
                  </Text>
                  <Text style={[styles.headerCell, styles.cellStat]}>
                    {t('standings.header_goals_against')}
                  </Text>
                  <Text style={[styles.headerCell, styles.cellStatDG]}>
                    {t('standings.header_goal_diff')}
                  </Text>
                </View>

                {standings.map((item, index) => {
                  if (!item) return null;
                  const position = item.position ?? index + 1;
                  const safeId = typeof item.tournament_team === 'string' 
                    ? item.tournament_team 
                    : (item as any)?.tournament_team?.id || (item as any)?.id || (item as any)?.team_id || (item as any)?.team?.id || index;

                  return (
                    <View
                      key={`f-m-${safeId}-${index}`}
                      style={[
                        styles.tableRow,
                        styles.rowMiddle,
                        index % 2 !== 0 && styles.rowAlternate,
                        position <= 3 && styles.rowElite,
                      ]}
                    >
                      <Text style={[styles.statCell, styles.cellGroup]}>
                        {item.group || '-'}
                      </Text>
                      <Text style={[styles.statCell, styles.cellStat]}>
                        {item.played ?? '-'}
                      </Text>
                      <Text style={[styles.statCell, styles.cellStat]}>
                        {item.wins ?? '-'}
                      </Text>
                      <Text style={[styles.statCell, styles.cellStat]}>
                        {item.draws ?? '-'}
                      </Text>
                      <Text style={[styles.statCell, styles.cellStat]}>
                        {item.losses ?? '-'}
                      </Text>
                      <Text style={[styles.statCell, styles.cellStat]}>
                        {item.goals_for ?? '-'}
                      </Text>
                      <Text style={[styles.statCell, styles.cellStat]}>
                        {item.goals_against ?? '-'}
                      </Text>
                      <Text
                        style={[
                          styles.statCell,
                          styles.cellStatDG,
                          styles.dgText,
                          item.goal_difference != null && item.goal_difference > 0 && { color: '#4ADE80' },
                          item.goal_difference != null && item.goal_difference < 0 && { color: '#FF4444' },
                        ]}
                      >
                        {item.goal_difference != null
                          ? (item.goal_difference > 0
                              ? `+${item.goal_difference}`
                              : item.goal_difference)
                          : '-'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            {/* Columna Fija Derecha: Puntos (PTS) */}
            <View style={styles.fixedRightColumn}>
              <View style={[styles.tableHeader, styles.headerRight]}>
                <Text style={[styles.headerCell, styles.cellPoints]}>
                  {t('standings.header_points')}
                </Text>
              </View>
              {standings.map((item, index) => {
                if (!item) return null;
                const position = item.position ?? index + 1;
                const safeId = typeof item.tournament_team === 'string' 
                  ? item.tournament_team 
                  : (item as any)?.tournament_team?.id || (item as any)?.id || (item as any)?.team_id || (item as any)?.team?.id || index;

                return (
                  <View
                    key={`f-r-${safeId}-${index}`}
                    style={[
                      styles.tableRow,
                      styles.rowRight,
                      index % 2 !== 0 && styles.rowAlternate,
                      position <= 3 && styles.rowElite,
                    ]}
                  >
                    <Text style={[styles.pointsCell, styles.cellPoints]}>
                      {item.points != null ? item.points : '-'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Glosario de Abreviaturas */}
          <View style={styles.glossaryCard}>
            <View style={styles.glossaryHeader}>
              <Shield size={16} color={theme.primary} />
              <Text style={styles.glossaryTitle}>GLOSARIO DE ESTADÍSTICAS</Text>
            </View>
            <View style={styles.glossaryGrid}>
              <View style={styles.glossaryItem}>
                <Text style={styles.glossaryTerm}>PJ</Text>
                <Text style={styles.glossaryDef}>Partidos Jugados</Text>
              </View>
              <View style={styles.glossaryItem}>
                <Text style={styles.glossaryTerm}>PG</Text>
                <Text style={styles.glossaryDef}>Partidos Ganados</Text>
              </View>
              <View style={styles.glossaryItem}>
                <Text style={styles.glossaryTerm}>PE</Text>
                <Text style={styles.glossaryDef}>Partidos Empatados</Text>
              </View>
              <View style={styles.glossaryItem}>
                <Text style={styles.glossaryTerm}>PP</Text>
                <Text style={styles.glossaryDef}>Partidos Perdidos</Text>
              </View>
              <View style={styles.glossaryItem}>
                <Text style={styles.glossaryTerm}>GF</Text>
                <Text style={styles.glossaryDef}>Goles a Favor</Text>
              </View>
              <View style={styles.glossaryItem}>
                <Text style={styles.glossaryTerm}>GC</Text>
                <Text style={styles.glossaryDef}>Goles en Contra</Text>
              </View>
              <View style={styles.glossaryItem}>
                <Text style={styles.glossaryTerm}>DG</Text>
                <Text style={styles.glossaryDef}>Diferencia de Goles</Text>
              </View>
              <View style={styles.glossaryItem}>
                <Text style={[styles.glossaryTerm, { color: theme.primary }]}>PTS</Text>
                <Text style={styles.glossaryDef}>Puntos Totales</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 8,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
      textAlign: 'center',
    },
    scrollArea: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    summaryCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
    },
    summaryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.12)' : 'rgba(0, 245, 255, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    summaryBadgeText: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.primary,
    },
    tiebreakerText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    tableCard: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255,255,255,0.015)' : '#FFFFFF',
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      marginBottom: 20,
    },
    fixedLeftColumn: {
      width: 156,
      borderRightWidth: 1,
      borderRightColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : '#FFFFFF',
      zIndex: 2,
    },
    scrollableMiddle: {
      flex: 1,
    },
    fixedRightColumn: {
      width: 52,
      borderLeftWidth: 1,
      borderLeftColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.03)' : 'rgba(0, 245, 255, 0.04)',
      zIndex: 2,
    },
    headerLeft: {
      justifyContent: 'flex-start',
    },
    headerMiddle: {
      justifyContent: 'flex-start',
    },
    headerRight: {
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.08)' : 'rgba(0, 245, 255, 0.08)',
    },
    rowLeft: {
      justifyContent: 'flex-start',
    },
    rowMiddle: {
      justifyContent: 'flex-start',
    },
    rowRight: {
      justifyContent: 'center',
    },
    tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 40,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
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
      height: 48,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    },
    rowAlternate: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
    },
    rowElite: {},
    cellPos: { width: 36, textAlign: 'center' },
    cellTeam: { width: 120, textAlign: 'left', paddingLeft: 8 },
    cellGroup: { width: 34, textAlign: 'center' },
    cellStat: { width: 36, textAlign: 'center' },
    cellStatDG: { width: 42, textAlign: 'center' },
    cellPoints: { width: 52, textAlign: 'center' },

    posBadge: {
      width: 24,
      height: 24,
      borderRadius: 6,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 6,
    },
    posFirst: { backgroundColor: '#FFD700' },
    posSecond: { backgroundColor: '#C0C0C0' },
    posThird: { backgroundColor: '#CD7F32' },
    posText: {
      fontSize: 11,
      fontWeight: '900',
      color: isDark ? '#FFF' : '#000',
    },
    teamName: {
      width: 120,
      fontSize: 12,
      fontWeight: '800',
      color: theme.text,
      paddingLeft: 8,
    },
    statCell: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
      textAlign: 'center',
    },
    dgText: {
      fontWeight: '800',
    },
    pointsCell: {
      fontSize: 14,
      fontWeight: '900',
      color: theme.primary,
      textAlign: 'center',
    },
    glossaryCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    glossaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14,
    },
    glossaryTitle: {
      fontSize: 11,
      fontWeight: '900',
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    glossaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    glossaryItem: {
      width: '46%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    glossaryTerm: {
      fontSize: 12,
      fontWeight: '900',
      color: theme.text,
      width: 32,
    },
    glossaryDef: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '500',
      flex: 1,
    },
  });
