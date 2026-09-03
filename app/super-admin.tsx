import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  Layers,
  Trophy,
  Plus,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  useGetPlatformSummary,
  useGetPaymentSummary,
  useGetPendingLeagues,
  useGetPendingTournaments,
  useGetOverdueLeagues,
} from '@/features/superadmin/services/superadminApi';
import { PlatformSummaryWidget } from '@/components/superadmin/PlatformSummaryWidget';
import { ApprovalActionCard } from '@/components/superadmin/ApprovalActionCard';
import { RecordPaymentModal } from '@/components/superadmin/RecordPaymentModal';
import { SetPaymentStatusModal } from '@/components/superadmin/SetPaymentStatusModal';
import { League } from '@/features/leagues/types/league';

type AdminTab = 'summary' | 'approvals' | 'payments';

export default function SuperAdminScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);

  const isStaff = Boolean((user as any)?.is_staff || (user as any)?.is_superuser);

  const [activeTab, setActiveTab] = useState<AdminTab>('summary');
  const [approvalSubTab, setApprovalSubTab] = useState<'leagues' | 'tournaments'>('leagues');

  // Modals state
  const [recordPaymentLeague, setRecordPaymentLeague] = useState<League | null>(null);
  const [statusModalLeague, setStatusModalLeague] = useState<League | null>(null);

  // Queries
  const {
    data: platformSummary,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
    isRefetching: isRefetchingSummary,
  } = useGetPlatformSummary();

  const { data: paymentSummary, refetch: refetchPaymentSummary } = useGetPaymentSummary();
  const {
    data: pendingLeagues,
    isLoading: isLoadingLeagues,
    refetch: refetchPendingLeagues,
  } = useGetPendingLeagues();
  const {
    data: pendingTournaments,
    isLoading: isLoadingTournaments,
    refetch: refetchPendingTournaments,
  } = useGetPendingTournaments();
  const {
    data: overdueLeagues,
    isLoading: isLoadingOverdue,
    refetch: refetchOverdue,
  } = useGetOverdueLeagues();

  const handleRefreshAll = () => {
    refetchSummary();
    refetchPaymentSummary();
    refetchPendingLeagues();
    refetchPendingTournaments();
    refetchOverdue();
  };

  if (!isStaff) {
    return (
      <View style={GlobalStyles.container}>
        <BackgroundGradient />
        <SafeAreaView edges={['top']} style={styles.restrictedContainer}>
          <ShieldAlert size={60} color="#EF4444" />
          <Text style={[styles.restrictedTitle, { color: theme.text }]}>
            Acceso Restringido (403)
          </Text>
          <Text style={[styles.restrictedDesc, { color: theme.textSecondary }]}>
            Esta sección es exclusiva para el equipo administrativo de Trofi (is_staff = true).
          </Text>
          <TouchableOpacity
            style={[styles.backHomeBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backHomeBtnText}>Volver al Inicio</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <CheckCircle2 size={20} color={theme.primary} />
            <Text style={[styles.title, { color: theme.text }]}>Super Admin Trofi</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {/* Tab Selector */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setActiveTab('summary')}
            style={[
              styles.tabBtn,
              activeTab === 'summary' && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'summary' ? theme.primary : theme.textSecondary },
              ]}
            >
              Resumen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('approvals')}
            style={[
              styles.tabBtn,
              activeTab === 'approvals' && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
            ]}
          >
            <View style={styles.tabBadgeRow}>
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'approvals' ? theme.primary : theme.textSecondary },
                ]}
              >
                Por Aprobar
              </Text>
              {(platformSummary?.pending_approval ?? 0) > 0 && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{platformSummary?.pending_approval}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('payments')}
            style={[
              styles.tabBtn,
              activeTab === 'payments' && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
            ]}
          >
            <View style={styles.tabBadgeRow}>
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'payments' ? theme.primary : theme.textSecondary },
                ]}
              >
                Cobranzas
              </Text>
              {(overdueLeagues?.length ?? 0) > 0 && (
                <View style={[styles.badgePill, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.badgePillText}>{overdueLeagues?.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Tab 1: Summary */}
      {activeTab === 'summary' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingSummary}
              onRefresh={handleRefreshAll}
              tintColor={theme.primary}
            />
          }
        >
          <PlatformSummaryWidget summary={platformSummary} paymentSummary={paymentSummary} />

          <Text style={[styles.sectionSubtitle, { color: theme.text }]}>Acciones Rápidas</Text>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: theme.surface }]}
            onPress={() => setActiveTab('approvals')}
          >
            <View style={styles.quickCardLeft}>
              <Clock size={20} color="#F59E0B" />
              <View>
                <Text style={[styles.quickTitle, { color: theme.text }]}>
                  Revisiones Pendientes ({platformSummary?.pending_approval ?? 0})
                </Text>
                <Text style={[styles.quickDesc, { color: theme.textSecondary }]}>
                  Ligas y torneos esperando validación para quedar visibles
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: theme.surface }]}
            onPress={() => setActiveTab('payments')}
          >
            <View style={styles.quickCardLeft}>
              <AlertTriangle size={20} color="#EF4444" />
              <View>
                <Text style={[styles.quickTitle, { color: theme.text }]}>
                  Ligas con Pagos Vencidos ({overdueLeagues?.length ?? 0})
                </Text>
                <Text style={[styles.quickDesc, { color: theme.textSecondary }]}>
                  Ligas con creación de competencias y calendarios bloqueados
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Tab 2: Approvals */}
      {activeTab === 'approvals' && (
        <View style={{ flex: 1 }}>
          <View style={styles.subTabsRow}>
            <TouchableOpacity
              style={[
                styles.subTabBtn,
                approvalSubTab === 'leagues' && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setApprovalSubTab('leagues')}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: approvalSubTab === 'leagues' ? '#001A2C' : theme.text },
                ]}
              >
                Ligas ({pendingLeagues?.length ?? 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.subTabBtn,
                approvalSubTab === 'tournaments' && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setApprovalSubTab('tournaments')}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: approvalSubTab === 'tournaments' ? '#001A2C' : theme.text },
                ]}
              >
                Torneos ({pendingTournaments?.length ?? 0})
              </Text>
            </TouchableOpacity>
          </View>

          {approvalSubTab === 'leagues' ? (
            <FlatList
              data={pendingLeagues || []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <ApprovalActionCard
                  type="league"
                  item={item}
                  onSuccess={handleRefreshAll}
                />
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyBox}>
                  <CheckCircle2 size={44} color="#10B981" />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    No hay ligas pendientes
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    Todas las ligas registradas han sido aprobadas o revisadas.
                  </Text>
                </View>
              )}
            />
          ) : (
            <FlatList
              data={pendingTournaments || []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <ApprovalActionCard
                  type="tournament"
                  item={item}
                  onSuccess={handleRefreshAll}
                />
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyBox}>
                  <CheckCircle2 size={44} color="#10B981" />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    No hay torneos pendientes
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    Todos los torneos creados han sido validados.
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* Tab 3: Payments & Overdue */}
      {activeTab === 'payments' && (
        <FlatList
          data={overdueLeagues || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <View style={styles.paymentsHeader}>
              <View style={styles.overdueNotice}>
                <AlertTriangle size={18} color="#EF4444" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.overdueNoticeTitle}>Control de Cobranza</Text>
                  <Text style={styles.overdueNoticeDesc}>
                    Las ligas marcadas como "overdue" tienen bloqueada la creación de nuevos torneos y generación de fixtures.
                  </Text>
                </View>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.overdueCard, { backgroundColor: theme.surface }]}>
              <View style={styles.overdueCardHeader}>
                <Text style={[styles.overdueCardTitle, { color: theme.text }]}>
                  {item.name}
                </Text>
                <View style={styles.overdueBadge}>
                  <Text style={styles.overdueBadgeText}>PAGO VENCIDO</Text>
                </View>
              </View>

              <Text style={[styles.overdueCity, { color: theme.textSecondary }]}>
                {item.city}, {item.country}
              </Text>

              <View style={styles.overdueActions}>
                <TouchableOpacity
                  style={[styles.recordPayBtn, { backgroundColor: '#10B981' }]}
                  onPress={() => setRecordPaymentLeague(item)}
                >
                  <DollarSign size={14} color="#FFFFFF" />
                  <Text style={styles.recordPayBtnText}>Asentar Pago</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.setStatusBtn, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }]}
                  onPress={() => setStatusModalLeague(item)}
                >
                  <Text style={[styles.setStatusBtnText, { color: theme.text }]}>
                    Cambiar Estado
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyBox}>
              <CheckCircle2 size={44} color="#10B981" />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No hay ligas con pago vencido
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Todas las ligas activas se encuentran al día con sus cuotas.
              </Text>
            </View>
          )}
        />
      )}

      {/* Record Payment Modal */}
      {recordPaymentLeague && (
        <RecordPaymentModal
          visible={Boolean(recordPaymentLeague)}
          onClose={() => setRecordPaymentLeague(null)}
          leagueId={recordPaymentLeague.id}
          leagueName={recordPaymentLeague.name}
          onSuccess={handleRefreshAll}
        />
      )}

      {/* Set Payment Status Modal */}
      {statusModalLeague && (
        <SetPaymentStatusModal
          visible={Boolean(statusModalLeague)}
          onClose={() => setStatusModalLeague(null)}
          leagueId={statusModalLeague.id}
          leagueName={statusModalLeague.name}
          currentStatus={statusModalLeague.payment_status}
          onSuccess={handleRefreshAll}
        />
      )}
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    backBtn: {
      padding: 6,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
    },
    tabsRow: {
      flexDirection: 'row',
      marginTop: 4,
    },
    tabBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
    },
    tabBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '700',
    },
    badgePill: {
      backgroundColor: '#F59E0B',
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 10,
    },
    badgePillText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    sectionSubtitle: {
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 10,
      marginTop: 6,
    },
    quickCard: {
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    quickCardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    quickTitle: {
      fontSize: 14,
      fontWeight: '800',
    },
    quickDesc: {
      fontSize: 11,
      marginTop: 2,
    },
    subTabsRow: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    subTabBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    },
    subTabText: {
      fontSize: 13,
      fontWeight: '700',
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },
    paymentsHeader: {
      marginBottom: 14,
    },
    overdueNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    overdueNoticeTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: '#EF4444',
    },
    overdueNoticeDesc: {
      fontSize: 11,
      color: '#EF4444',
      marginTop: 2,
      lineHeight: 15,
    },
    overdueCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    overdueCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    overdueCardTitle: {
      fontSize: 16,
      fontWeight: '800',
    },
    overdueBadge: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    overdueBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#EF4444',
    },
    overdueCity: {
      fontSize: 12,
      marginBottom: 14,
    },
    overdueActions: {
      flexDirection: 'row',
      gap: 8,
    },
    recordPayBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      height: 38,
      borderRadius: 10,
    },
    recordPayBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    setStatusBtn: {
      paddingHorizontal: 12,
      height: 38,
      borderRadius: 10,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    setStatusBtnText: {
      fontSize: 12,
      fontWeight: '700',
    },
    emptyBox: {
      padding: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      marginTop: 14,
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 16,
    },
    restrictedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
      gap: 12,
    },
    restrictedTitle: {
      fontSize: 20,
      fontWeight: '900',
      marginTop: 10,
    },
    restrictedDesc: {
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 20,
    },
    backHomeBtn: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
    },
    backHomeBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#001A2C',
    },
  });
