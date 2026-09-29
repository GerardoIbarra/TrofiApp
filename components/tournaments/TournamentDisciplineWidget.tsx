import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, ShieldCheck, AlertOctagon, Plus, History } from 'lucide-react-native';
import { useGetActiveSuspensions, useGetDisciplinaryRecords, useLiftSuspension } from '@/features/discipline/services/disciplineApi';
import { ManualSuspensionModal } from '@/components/discipline/ManualSuspensionModal';

interface TournamentDisciplineWidgetProps {
  tournamentId: string;
  isAdmin?: boolean;
}

export function TournamentDisciplineWidget({ tournamentId, isAdmin = false }: TournamentDisciplineWidgetProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const styles = createStyles(theme, isDark);

  const [activeTab, setActiveTab] = useState<'suspensions' | 'records'>('suspensions');
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);

  const { data: suspensionsData, isLoading: loadingSuspensions } = useGetActiveSuspensions(tournamentId);
  const { data: recordsData, isLoading: loadingRecords } = useGetDisciplinaryRecords({ tournament: tournamentId });
  
  const liftSuspension = useLiftSuspension();

  const handleLiftSuspension = (id: string, playerName: string) => {
    Alert.alert(
      t('discipline.lift_confirm_title'),
      t('discipline.lift_confirm_msg', { name: playerName }),
      [
        { text: t('discipline.lift_cancel'), style: 'cancel' },
        { 
          text: t('discipline.lift_confirm_btn'), 
          style: 'destructive',
          onPress: () => {
            liftSuspension.mutate(id, {
              onSuccess: () => showToast({ type: 'success', title: 'Éxito', message: t('discipline.lift_success') }),
              onError: (err: any) => showToast({ type: 'error', title: 'Error', message: err?.response?.data?.detail || 'No se pudo levantar.' })
            });
          }
        }
      ]
    );
  };

  const suspensions = suspensionsData?.results || [];
  const records = recordsData?.results || [];

  return (
    <View style={styles.container}>
      {/* Sub-tab Switcher: Suspensiones vs Historial */}
      <View style={styles.subTabRow}>
        <TouchableOpacity
          style={[styles.subTabBtn, activeTab === 'suspensions' && styles.subTabBtnActive]}
          onPress={() => setActiveTab('suspensions')}
          activeOpacity={0.8}
        >
          <ShieldAlert size={15} color={activeTab === 'suspensions' ? '#FF4444' : theme.textSecondary} />
          <Text style={[styles.subTabText, activeTab === 'suspensions' && styles.subTabTextActive]}>
            {t('discipline.tab_suspensions').toUpperCase()}
          </Text>
          {suspensions.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{suspensions.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeTab === 'records' && styles.subTabBtnActive]}
          onPress={() => setActiveTab('records')}
          activeOpacity={0.8}
        >
          <History size={15} color={activeTab === 'records' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.subTabText, activeTab === 'records' && styles.subTabTextActive]}>
            {t('discipline.tab_records').toUpperCase()}
          </Text>
          {records.length > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
              <Text style={[styles.tabBadgeText, { color: theme.text }]}>{records.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Admin Action Button for Manual Sanctions */}
      {isAdmin && activeTab === 'suspensions' && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.adminActionBtn} 
            onPress={() => setIsManualModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={15} color="#FF4444" />
            <Text style={styles.adminActionBtnText}>{t('discipline.btn_manual_suspension')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {(loadingSuspensions || loadingRecords) ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : activeTab === 'suspensions' ? (
        suspensions.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircleSuccess}>
              <ShieldCheck size={36} color="#4ADE80" />
            </View>
            <View style={styles.fairPlayPill}>
              <Text style={styles.fairPlayPillText}>FAIR PLAY • JUEGO LIMPIO</Text>
            </View>
            <Text style={styles.emptyTitle}>Sin Jugadores Suspendidos</Text>
            <Text style={styles.emptySubtitle}>
              Todos los equipos tienen a su plantilla completamente habilitada para disputar los próximos partidos.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            <FlatList
              scrollEnabled={false}
              data={suspensions}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item: susp }) => (
                <View style={[styles.card, { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.playerName}>{susp.player_name}</Text>
                    <Text style={styles.teamName}>{susp.team_name}</Text>
                    <View style={styles.reasonBadge}>
                      <AlertOctagon size={12} color="#FF4444" />
                      <Text style={styles.reasonText}>
                        {susp.reason === 'manual'
                          ? t('discipline.reason_manual')
                          : susp.reason === 'red_card' || susp.reason === 'direct_red'
                          ? t('discipline.reason_red')
                          : susp.reason === 'season_carryover' || susp.reason === 'carryover'
                          ? t('discipline.reason_carryover')
                          : t('discipline.reason_yellows')}
                      </Text>
                    </View>
                    
                    <Text style={styles.suspendedText}>
                      {t('discipline.suspended_status', { total: susp.matches_suspended, served: susp.matches_served })}
                    </Text>
                    
                    {susp.notes && <Text style={styles.notesText}>{t('discipline.note_prefix')} {susp.notes}</Text>}
                  </View>
                  
                  {isAdmin && (
                    <TouchableOpacity 
                      style={styles.liftBtn}
                      onPress={() => handleLiftSuspension(susp.id, susp.player_name)}
                      disabled={liftSuspension.isPending}
                      activeOpacity={0.8}
                    >
                      <ShieldAlert size={14} color={theme.primary} />
                      <Text style={styles.liftBtnText}>{t('discipline.btn_lift')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </View>
        )
      ) : (
        records.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircleNeutral}>
              <History size={36} color={theme.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Sin Tarjetas Registradas</Text>
            <Text style={styles.emptySubtitle}>
              {t('discipline.empty_records')}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            <FlatList
              scrollEnabled={false}
              data={records}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item: rec }) => (
                <View style={[styles.recordRow, { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                  <View style={styles.recordLeft}>
                    {rec.card_type === 'second_yellow' ? (
                      <View style={{ flexDirection: 'row', gap: 2 }}>
                        <View style={[styles.cardIcon, { width: 6, backgroundColor: '#FFD700' }]} />
                        <View style={[styles.cardIcon, { width: 6, backgroundColor: '#FF4444' }]} />
                      </View>
                    ) : (
                      <View style={[styles.cardIcon, { backgroundColor: rec.card_type === 'yellow' ? '#FFD700' : '#FF4444' }]} />
                    )}
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.playerName}>{rec.player_name}</Text>
                        {rec.card_type === 'second_yellow' && (
                          <View style={{ backgroundColor: 'rgba(255, 68, 68, 0.15)', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                            <Text style={{ color: '#FF4444', fontSize: 9, fontWeight: '800' }}>2ª Amarilla</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.teamName}>{rec.team_name}</Text>
                    </View>
                  </View>
                  {rec.minute && (
                    <View style={styles.minuteBox}>
                      <Text style={styles.minuteText}>{rec.minute}&apos;</Text>
                    </View>
                  )}
                </View>
              )}
            />
          </View>
        )
      )}

      {isManualModalVisible && (
        <ManualSuspensionModal 
          tournamentId={tournamentId} 
          onClose={() => setIsManualModalVisible(false)} 
        />
      )}
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginTop: 8,
  },
  subTabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  },
  subTabBtnActive: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : '#FFFFFF',
    borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.25 : 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  subTabText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.textSecondary,
    letterSpacing: 0.5,
  },
  subTabTextActive: {
    color: theme.text,
  },
  tabBadge: {
    backgroundColor: '#FF444422',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 2,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF4444',
  },
  actionRow: {
    marginBottom: 14,
  },
  adminActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  adminActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF4444',
    letterSpacing: 0.3,
  },
  centered: {
    padding: 60,
    alignItems: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    paddingVertical: 36,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  emptyIconCircleSuccess: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyIconCircleNeutral: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  fairPlayPill: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  fairPlayPillText: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
    marginBottom: 12,
    backgroundColor: theme.surface,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.text,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 68, 68, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  reasonText: {
    color: '#FF4444',
    fontSize: 10,
    fontWeight: '800',
  },
  suspendedText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text,
  },
  notesText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  liftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.primary,
    backgroundColor: isDark ? 'rgba(0, 245, 255, 0.08)' : 'rgba(0, 245, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 5,
  },
  liftBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.primary,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    backgroundColor: theme.surface,
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardIcon: {
    width: 14,
    height: 20,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  minuteBox: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  minuteText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '900',
  },
});
