import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, AlertCircle, AlertOctagon, Check, Plus } from 'lucide-react-native';
import { useGetActiveSuspensions, useGetDisciplinaryRecords, useLiftSuspension } from '@/features/discipline/services/disciplineApi';
import { ManualSuspensionModal } from '@/components/discipline/ManualSuspensionModal';

interface TournamentDisciplineWidgetProps {
  tournamentId: string;
  isAdmin?: boolean;
}

export function TournamentDisciplineWidget({ tournamentId, isAdmin = false }: TournamentDisciplineWidgetProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'suspensions' | 'records'>('suspensions');
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);

  const { data: suspensionsData, isLoading: loadingSuspensions } = useGetActiveSuspensions(tournamentId);
  const { data: recordsData, isLoading: loadingRecords } = useGetDisciplinaryRecords({ tournament: tournamentId });
  
  const liftSuspension = useLiftSuspension();

  const handleLiftSuspension = (id: string, playerName: string) => {
    Alert.alert(
      'Levantar Suspensión',
      `¿Estás seguro de levantar la suspensión de ${playerName}? Podrá jugar inmediatamente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Levantar Sanción', 
          style: 'destructive',
          onPress: () => {
            liftSuspension.mutate(id, {
              onSuccess: () => Alert.alert('Éxito', 'Suspensión levantada.'),
              onError: (err: any) => Alert.alert('Error', err?.response?.data?.detail || 'No se pudo levantar.')
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
      <View style={styles.header}>
        <View style={styles.tabsRow}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'suspensions' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('suspensions')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'suspensions' ? theme.primary : theme.textSecondary }]}>Suspensiones</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'records' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('records')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'records' ? theme.primary : theme.textSecondary }]}>Historial de Tarjetas</Text>
          </TouchableOpacity>
        </View>
        
        {isAdmin && activeTab === 'suspensions' && (
          <TouchableOpacity 
            style={[styles.adminBtn, { backgroundColor: '#FF444420' }]}
            onPress={() => setIsManualModalVisible(true)}
          >
            <Plus size={14} color="#FF4444" />
            <Text style={[styles.adminBtnText, { color: '#FF4444' }]}>Sanción Manual</Text>
          </TouchableOpacity>
        )}
      </View>

      {(loadingSuspensions || loadingRecords) ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : activeTab === 'suspensions' ? (
        <View style={styles.list}>
          {suspensions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Check size={40} color={theme.primary} opacity={0.3} />
              <Text style={styles.emptyText}>No hay jugadores suspendidos en este momento.</Text>
            </View>
          ) : (
            suspensions.map(susp => (
              <View key={susp.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <View style={styles.cardInfo}>
                  <Text style={[styles.playerName, { color: theme.text }]}>{susp.player_name}</Text>
                  <Text style={[styles.teamName, { color: theme.textSecondary }]}>{susp.team_name}</Text>
                  
                  <View style={styles.reasonBadge}>
                    <AlertOctagon size={12} color="#FF4444" />
                    <Text style={styles.reasonText}>
                      {susp.reason === 'manual' ? 'Sanción Administrativa' :
                       susp.reason === 'red_card' ? 'Tarjeta Roja Directa' : 'Acumulación de Amarillas'}
                    </Text>
                  </View>
                  
                  <Text style={[styles.suspendedText, { color: theme.text }]}>
                    Suspendido: {susp.matches_suspended} partidos (Cumplidos: {susp.matches_served})
                  </Text>
                  
                  {susp.notes && <Text style={styles.notesText}>Nota: {susp.notes}</Text>}
                </View>
                
                {isAdmin && (
                  <TouchableOpacity 
                    style={[styles.liftBtn, { borderColor: theme.primary }]}
                    onPress={() => handleLiftSuspension(susp.id, susp.player_name)}
                    disabled={liftSuspension.isPending}
                  >
                    <ShieldAlert size={16} color={theme.primary} />
                    <Text style={[styles.liftBtnText, { color: theme.primary }]}>Levantar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      ) : (
        <View style={styles.list}>
           {records.length === 0 ? (
            <View style={styles.emptyBox}>
              <ShieldAlert size={40} color={theme.textSecondary} opacity={0.3} />
              <Text style={styles.emptyText}>No hay tarjetas registradas en este torneo.</Text>
            </View>
          ) : (
            records.map(rec => (
              <View key={rec.id} style={[styles.recordRow, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                 <View style={styles.recordLeft}>
                    <View style={[styles.cardIcon, { backgroundColor: rec.card_type === 'yellow' ? '#FFD700' : '#FF4444' }]} />
                    <View>
                       <Text style={[styles.playerName, { color: theme.text }]}>{rec.player_name}</Text>
                       <Text style={[styles.teamName, { color: theme.textSecondary }]}>{rec.team_name}</Text>
                    </View>
                 </View>
                 {rec.minute && (
                   <View style={styles.minuteBox}>
                      <Text style={styles.minuteText}>{rec.minute}'</Text>
                   </View>
                 )}
              </View>
            ))
          )}
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  tab: {
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '800',
  },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adminBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  centered: {
    padding: 40,
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 13,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 15,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '800',
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF444415',
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
    fontWeight: '600',
  },
  notesText: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  liftBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 4,
  },
  liftBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 14,
    height: 20,
    borderRadius: 2,
  },
  minuteBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  minuteText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  }
});
