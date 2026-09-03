import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Layers, Clock, DollarSign, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { PlatformSummary, PaymentRecordSummary } from '@/features/superadmin/types/superadmin';

interface PlatformSummaryWidgetProps {
  summary?: PlatformSummary;
  paymentSummary?: PaymentRecordSummary;
}

export const PlatformSummaryWidget: React.FC<PlatformSummaryWidgetProps> = ({
  summary,
  paymentSummary,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const activeLeagues = summary?.active_leagues ?? 0;
  const pendingApprovals = summary?.pending_approval ?? 0;
  const revenueThisMonth = summary?.collected_this_month || paymentSummary?.total_this_month || '0.00';
  const paymentCount = paymentSummary?.count_this_month ?? 0;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Resumen Global Trofi
      </Text>

      <View style={styles.cardsRow}>
        {/* Active Leagues */}
        <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
          <View style={styles.iconCircle}>
            <Layers size={18} color={theme.primary} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.text }]}>{activeLeagues}</Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Ligas Activas</Text>
        </View>

        {/* Pending Approvals */}
        <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
            <Clock size={18} color="#F59E0B" />
          </View>
          <Text style={[styles.kpiValue, { color: pendingApprovals > 0 ? '#F59E0B' : theme.text }]}>
            {pendingApprovals}
          </Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Por Aprobar</Text>
        </View>

        {/* Collected this month */}
        <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <DollarSign size={18} color="#10B981" />
          </View>
          <Text style={[styles.kpiValue, { color: '#10B981' }]} numberOfLines={1}>
            ${Number(revenueThisMonth).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
            Mes ({paymentCount} cobros)
          </Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 10,
      letterSpacing: 0.2,
    },
    cardsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    kpiCard: {
      flex: 1,
      borderRadius: 16,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(56, 189, 248, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    kpiValue: {
      fontSize: 18,
      fontWeight: '900',
      marginBottom: 2,
    },
    kpiLabel: {
      fontSize: 10,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
