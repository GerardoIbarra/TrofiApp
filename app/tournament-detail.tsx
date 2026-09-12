import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import api from '@/services/api';
import { Tournament } from '@/features/tournaments/types/tournament';
import { TournamentHeader } from '@/components/leagues/TournamentHeader';
import { CreateTournamentModal } from '@/components/leagues/CreateTournamentModal';
import { TournamentStandingsWidget } from '@/components/tournaments/TournamentStandingsWidget';
import { TournamentMatchesWidget } from '@/components/tournaments/TournamentMatchesWidget';
import { TournamentTeamsWidget } from '@/components/tournaments/TournamentTeamsWidget';
import { BracketWidget } from '@/components/tournaments/BracketWidget';
import { TournamentDisciplineWidget } from '@/components/tournaments/TournamentDisciplineWidget';
import { CloneTournamentModal } from '@/components/leagues/CloneTournamentModal';
import { TournamentAwardsModal } from '@/components/tournaments/TournamentAwardsModal';
import { AnnouncementsWidget } from '@/components/announcements/AnnouncementsWidget';
import { useOpenRegistration, useCloseRegistration } from '@/features/tournaments/services/tournamentApi';
import { Trophy, Calendar, Clock, Info, ShieldCheck, CreditCard, MessageSquare, QrCode, Users, Layers, MapPin, CheckCircle2, XCircle, Copy, ToggleLeft, ToggleRight, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  const ServiceItem = ({ icon: Icon, label, active }: { icon: any, label: string, active: boolean }) => {
    return (
      <View style={[styles.featureBox, !active && styles.featureDisabled]}>
        <Icon size={20} color={active ? theme.primary : theme.textSecondary} />
        <Text style={[styles.featureLabel, !active && { color: theme.textSecondary }]}>
          {label}
        </Text>
      </View>
    );
  };
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isCloneModalVisible, setIsCloneModalVisible] = useState(false);
  const [isAwardsModalVisible, setIsAwardsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('STANDINGS');
  const isAdmin = true;

  const openRegistration = useOpenRegistration();
  const closeRegistration = useCloseRegistration();

  const handleToggleRegistration = () => {
    if (!tournament) return;
    if (tournament.registration_open) {
      closeRegistration.mutate(tournament.id, {
        onSuccess: () => fetchTournamentDetails()
      });
    } else {
      openRegistration.mutate(tournament.id, {
        onSuccess: () => fetchTournamentDetails()
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchTournamentDetails();
    }
  }, [id]);

  const fetchTournamentDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Tournament>(`/v1/tournaments/${id}/`);
      setTournament(response);
    } catch (error) {
      console.error('Error fetching tournament details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[GlobalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <BackgroundGradient />
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={[GlobalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <BackgroundGradient />
        <Text style={{ color: theme.textSecondary }}>{t("tournament.not_found")}</Text>
      </View>
    );
  }

  const FEATURE_LIST = [
    { key: 'payments_enabled', label: t("tournament.service_payments"), icon: CreditCard },
    { key: 'qr_checkin_enabled', label: t("tournament.service_qr"), icon: QrCode },
    { key: 'comms_enabled', label: t("tournament.service_comms"), icon: MessageSquare },
    { key: 'discipline_enabled', label: t("tournament.service_discipline"), icon: ShieldCheck },
  ];

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      
      <View style={styles.contentWrapper}>
        <View style={styles.webContainer}>
          <TournamentHeader 
            tournament={tournament} 
            onEditPress={() => setIsEditModalVisible(true)}
            onAddPress={() => setIsCreateModalVisible(true)}
          />

          {tournament.approval_status === 'pending' && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              padding: 10,
              borderRadius: 10,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: 'rgba(245, 158, 11, 0.3)'
            }}>
              <Clock size={16} color="#F59E0B" />
              <Text style={{ fontSize: 12, color: '#F59E0B', fontWeight: '700', flex: 1 }}>
                Torneo Pendiente de Aprobación por Staff de Trofi
              </Text>
            </View>
          )}

          {(tournament.status === 'completed' || (!!tournament.end_date && new Date(tournament.end_date).getTime() < Date.now())) && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              padding: 12,
              borderRadius: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: 'rgba(245, 158, 11, 0.3)',
              gap: 10,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Clock size={18} color="#F59E0B" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: '#F59E0B', fontWeight: '800' }}>
                    Temporada Finalizada
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                    Crea la nueva temporada clonando configuraciones y equipos.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#F59E0B',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
                activeOpacity={0.8}
                onPress={() => setIsCloneModalVisible(true)}
              >
                <Copy size={13} color="#001A2C" />
                <Text style={{ fontSize: 11, fontWeight: '900', color: '#001A2C' }}>
                  Nueva Temporada
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* BARRA DE ACCIÓN RÁPIDA: AGREGAR, CLONAR O PREMIAR TORNEO */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.primary,
                paddingVertical: 9,
                paddingHorizontal: 8,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
              activeOpacity={0.8}
              onPress={() => setIsCreateModalVisible(true)}
            >
              <Plus size={14} color="#001A2C" />
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#001A2C' }} numberOfLines={1}>
                Agregar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1.1,
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                paddingVertical: 9,
                paddingHorizontal: 8,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              }}
              activeOpacity={0.8}
              onPress={() => setIsCloneModalVisible(true)}
            >
              <Copy size={13} color={theme.text} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text }} numberOfLines={1}>
                Clonar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1.1,
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                paddingVertical: 9,
                paddingHorizontal: 8,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                borderWidth: 1,
                borderColor: '#F59E0B',
              }}
              activeOpacity={0.8}
              onPress={() => setIsAwardsModalVisible(true)}
            >
              <Trophy size={13} color="#F59E0B" />
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#F59E0B' }} numberOfLines={1}>
                Premios
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            {['STANDINGS', 'MATCHES', 'PLAYOFFS', 'TEAMS', 'DISCIPLINE', 'AVISOS', 'INFO'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, activeTab === tab && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'AVISOS' ? 'Avisos' : t(`tournament.tab_${tab.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tabContentArea}>
            {activeTab === 'STANDINGS' && (
              <TournamentStandingsWidget tournamentId={tournament.id} isAdmin={true} tournament={tournament} />
            )}

            {activeTab === 'MATCHES' && (
              <TournamentMatchesWidget tournamentId={tournament.id} isAdmin={true} />
            )}

            {activeTab === 'PLAYOFFS' && (
              <BracketWidget tournamentId={tournament.id} isAdmin={true} />
            )}

            {activeTab === 'TEAMS' && (
               <TournamentTeamsWidget tournamentId={tournament.id} />
            )}

            {activeTab === 'DISCIPLINE' && (
               <TournamentDisciplineWidget tournamentId={tournament.id} isAdmin={true} />
            )}

            {activeTab === 'AVISOS' && (
              <AnnouncementsWidget tournamentId={tournament.id} canManage={isAdmin} />
            )}

            {activeTab === 'INFO' && (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.infoScrollContent}
              >
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <Info size={16} color={theme.primary} />
                    <Text style={styles.sectionTitle}>{t("tournament.about")}</Text>
                  </View>
                  <Text style={styles.description}>
                    {tournament.description || t("tournament.no_description")}
                  </Text>
                </View>

                {/* Technical Details */}
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <Layers size={16} color={theme.primary} />
                    <Text style={styles.sectionTitle}>{t("tournament.technical_details")}</Text>
                  </View>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Users size={14} color={theme.textSecondary} />
                      <View>
                        <Text style={styles.detailLabel}>{t("tournament.gender")}</Text>
                        <Text style={styles.detailValue}>
                          {tournament.gender ? t(`tournament.gender_${tournament.gender}`) : 'N/A'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailItem}>
                      <Trophy size={14} color={theme.textSecondary} />
                      <View>
                        <Text style={styles.detailLabel}>{t("tournament.format")}</Text>
                        <Text style={styles.detailValue}>
                          {tournament.format ? t(`tournament.format_${tournament.format}`) : 'N/A'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailItem}>
                      {tournament.registration_open ? (
                        <CheckCircle2 size={14} color="#4ADE80" />
                      ) : (
                        <XCircle size={14} color="#FF4444" />
                      )}
                      <View>
                        <Text style={styles.detailLabel}>{t("tournament.registration")}</Text>
                        <Text style={[styles.detailValue, { color: tournament.registration_open ? "#4ADE80" : "#FF4444" }]}>
                          {tournament.registration_open ? t("tournament.registration_open") : t("tournament.registration_closed")}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailItem}>
                      <ShieldCheck size={14} color={theme.textSecondary} />
                      <View>
                        <Text style={styles.detailLabel}>{t("tournament.max_teams_label")}</Text>
                        <Text style={styles.detailValue}>{tournament.team_count || '0'} / {tournament.max_teams || '∞'}</Text>
                      </View>
                    </View>
                    <View style={styles.detailItem}>
                      <Calendar size={14} color={theme.textSecondary} />
                      <View>
                        <Text style={styles.detailLabel}>{t("tournament.dates")}</Text>
                        <Text style={styles.detailValue}>
                          {new Date(tournament.start_date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <ShieldCheck size={16} color={theme.primary} />
                    <Text style={styles.sectionTitle}>{t("tournament.league_services")}</Text>
                  </View>
                  <View style={styles.featuresGrid}>
                    <ServiceItem icon={CreditCard} label={t("tournament.service_payments")} active={!!tournament.features?.payments_enabled} />
                    <ServiceItem icon={QrCode} label={t("tournament.service_qr")} active={!!tournament.features?.qr_checkin_enabled} />
                    <ServiceItem icon={MessageSquare} label={t("tournament.service_comms")} active={!!tournament.features?.comms_enabled} />
                    <ServiceItem icon={ShieldCheck} label={t("tournament.service_discipline")} active={!!tournament.features?.discipline_enabled} />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.rulesButton, { borderColor: theme.primary + '40', borderWidth: 1 }]} 
                  activeOpacity={0.7}
                  onPress={() => setIsCreateModalVisible(true)}
                >
                  <Plus size={18} color={theme.primary} />
                  <Text style={[styles.rulesText, { color: theme.primary, fontWeight: '800' }]}>
                    Crear Nuevo Torneo en esta Liga
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.rulesButton} 
                  activeOpacity={0.7}
                  onPress={() => setIsCloneModalVisible(true)}
                >
                  <Copy size={18} color={theme.primary} />
                  <Text style={styles.rulesText}>Clonar Temporada</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.rulesButton} 
                  activeOpacity={0.7}
                  onPress={handleToggleRegistration}
                >
                  {tournament.registration_open ? (
                    <ToggleRight size={18} color="#FF4444" />
                  ) : (
                    <ToggleLeft size={18} color="#4ADE80" />
                  )}
                  <Text style={[styles.rulesText, { color: tournament.registration_open ? "#FF4444" : "#4ADE80" }]}>
                    {tournament.registration_open ? "Cerrar Inscripciones" : "Abrir Inscripciones"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.rulesButton} activeOpacity={0.7}>
                  <Info size={18} color={theme.primary} />
                  <Text style={styles.rulesText}>{t("tournament.view_rules")}</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </View>

      <CreateTournamentModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={fetchTournamentDetails}
        leagueId={tournament.league}
        initialData={tournament}
      />

      <CreateTournamentModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSuccess={(newTournament?: any) => {
          fetchTournamentDetails();
          if (newTournament?.id) {
            router.push({
              pathname: '/tournament-detail',
              params: { id: newTournament.id },
            });
          }
        }}
        leagueId={tournament.league}
        initialData={null}
      />

      <CloneTournamentModal
        visible={isCloneModalVisible}
        onClose={() => setIsCloneModalVisible(false)}
        onSuccess={(newTournament) => {
          fetchTournamentDetails();
          if (newTournament?.id) {
            router.push({
              pathname: '/tournament-detail',
              params: { id: newTournament.id },
            });
          }
        }}
        tournamentId={tournament.id}
        tournamentName={tournament.name}
        leagueId={tournament.league}
      />

      <TournamentAwardsModal
        visible={isAwardsModalVisible}
        onClose={() => setIsAwardsModalVisible(false)}
        tournamentId={tournament.id}
        tournamentName={tournament.name}
        championDetermination={tournament.champion_determination}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  contentWrapper: {
    flex: 1,
  },
  webContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  contentPadding: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  tabContentArea: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  infoScrollContent: {
    paddingBottom: 40,
  },
  infoSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: theme.textSecondary,
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  detailItem: {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.text,
    marginTop: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureBox: {
    width: '48%',
    backgroundColor: theme.surface,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  featureDisabled: {
    opacity: 0.5,
    borderStyle: 'dashed',
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.text,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  },
  tabActive: {
    backgroundColor: theme.primary + '20',
    borderWidth: 1,
    borderColor: theme.primary + '40',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.textSecondary,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: theme.primary,
  },
  comingSoonBox: {
    padding: 40,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderStyle: 'dashed',
  },
  comingSoonText: {
    color: theme.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  rulesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    padding: 18,
    borderRadius: 16,
    gap: 12,
    marginTop: 10,
  },
  rulesText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
