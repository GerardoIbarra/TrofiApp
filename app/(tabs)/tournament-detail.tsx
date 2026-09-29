import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { NotFoundState } from '@/components/ui/feedback/NotFoundState';
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
import { Trophy, Calendar, Clock, Info, ShieldCheck, CreditCard, MessageSquare, QrCode, Users, Layers, MapPin, CheckCircle2, XCircle, Copy, ToggleLeft, ToggleRight, Plus, ChevronRight, BookOpen, Settings2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  const renderServiceItem = (Icon: any, label: string, active: boolean) => {
    return (
      <View key={label} style={[styles.featureBox, !active && styles.featureDisabled]}>
        <View style={[
          styles.featureIconWrap, 
          { backgroundColor: active ? (theme.primary + '18') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)') }
        ]}>
          <Icon size={20} color={active ? theme.primary : theme.textSecondary} />
        </View>
        <Text style={[styles.featureLabel, !active && { color: theme.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
        <View style={[
          styles.featureBadge, 
          { backgroundColor: active ? 'rgba(74, 222, 128, 0.12)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') }
        ]}>
          <Text style={[styles.featureBadgeText, { color: active ? '#4ADE80' : theme.textSecondary }]}>
            {active ? 'ACTIVO' : 'INACTIVO'}
          </Text>
        </View>
      </View>
    );
  };
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isCloneModalVisible, setIsCloneModalVisible] = useState(false);
  const [isAwardsModalVisible, setIsAwardsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('STANDINGS');
  const [now] = useState(() => Date.now());
  const isAdmin = true;

  const openRegistration = useOpenRegistration();
  const closeRegistration = useCloseRegistration();

  const {
    data: tournament = null,
    isLoading,
    refetch: fetchTournamentDetails,
  } = useQuery({
    queryKey: ['tournament-detail', id],
    queryFn: async () => {
      if (!id) return null;
      return await api.get<Tournament>(`/v1/tournaments/${id}/`);
    },
    enabled: !!id,
  });

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

  const isTournamentEnded = useMemo(() => {
    if (!tournament) return false;
    if (tournament.status === 'completed') return true;
    if (!tournament.end_date) return false;
    return new Date(tournament.end_date).getTime() < now;
  }, [tournament, now]);

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
      <NotFoundState
        title={t("tournament.not_found_title")}
        message={t("tournament.not_found")}
        actionLabel={t("tournament.go_back")}
        onAction={() => router.back()}
      />
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <ScrollView
        style={styles.contentWrapper}
        contentContainerStyle={styles.scrollContentOuter}
        showsVerticalScrollIndicator={false}
      >
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
              borderColor: 'rgba(245, 158, 11, 0.3)',
              marginHorizontal: 20,
            }}>
              <Clock size={16} color="#F59E0B" />
              <Text style={{ fontSize: 12, color: '#F59E0B', fontWeight: '700', flex: 1 }}>
                {t('tournament.pending_approval')}
              </Text>
            </View>
          )}

          {isTournamentEnded && (
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
              marginHorizontal: 20,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Clock size={18} color="#F59E0B" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: '#F59E0B', fontWeight: '800' }}>
                    {t('tournament.season_finished')}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                    {t('tournament.season_finished_sub')}
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
                  {t('tournament.new_season')}
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
            paddingHorizontal: 20,
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
                {t('tournament.add')}
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
                {t('tournament.clone')}
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
                {t('tournament.awards')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
            style={styles.tabScrollView}
          >
            {['STANDINGS', 'MATCHES', 'PLAYOFFS', 'TEAMS', 'DISCIPLINE', 'AVISOS', 'INFO'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, activeTab === tab && styles.tabActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]} numberOfLines={1}>
                  {tab === 'AVISOS' ? t('tournament.tab_announcements') : t(`tournament.tab_${tab.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

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
              <View style={styles.infoScrollContent}>
                {/* Sobre el Torneo */}
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <Info size={16} color={theme.primary} />
                    <Text style={styles.sectionTitle}>{t("tournament.about", "SOBRE EL TORNEO")}</Text>
                  </View>
                  <View style={styles.aboutCard}>
                    <Text style={styles.description}>
                      {tournament.description || t("tournament.no_description", "Sin descripción detallada por el momento.")}
                    </Text>
                  </View>
                </View>

                {/* Detalles Técnicos */}
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <Layers size={16} color={theme.primary} />
                    <Text style={styles.sectionTitle}>{t("tournament.technical_details", "DETALLES TÉCNICOS")}</Text>
                  </View>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailTile}>
                      <View style={styles.detailIconCircle}>
                        <Trophy size={15} color={theme.primary} />
                      </View>
                      <View style={styles.detailTextWrap}>
                        <Text style={styles.detailLabel}>{t("tournament.format", "FORMATO")}</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>
                          {tournament.format ? t(`tournament.format_${tournament.format}`, tournament.format) : 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailTile}>
                      <View style={styles.detailIconCircle}>
                        <Users size={15} color={theme.primary} />
                      </View>
                      <View style={styles.detailTextWrap}>
                        <Text style={styles.detailLabel}>{t("tournament.gender", "GÉNERO")}</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>
                          {tournament.gender ? t(`tournament.gender_${tournament.gender}`, tournament.gender) : 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailTile}>
                      <View style={styles.detailIconCircle}>
                        <Clock size={15} color={theme.primary} />
                      </View>
                      <View style={styles.detailTextWrap}>
                        <Text style={styles.detailLabel}>ESTADO</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>
                          {tournament.status ? t(`tournament.status_${tournament.status}`, tournament.status.toUpperCase()) : 'ACTIVO'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailTile}>
                      <View style={styles.detailIconCircle}>
                        <ShieldCheck size={15} color={theme.primary} />
                      </View>
                      <View style={styles.detailTextWrap}>
                        <Text style={styles.detailLabel}>{t("tournament.max_teams_label", "CUPOS")}</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>
                          {tournament.team_count || '0'} / {tournament.max_teams || '∞'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailTile}>
                      <View style={[styles.detailIconCircle, { backgroundColor: tournament.registration_open ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 68, 68, 0.15)' }]}>
                        {tournament.registration_open ? (
                          <CheckCircle2 size={15} color="#4ADE80" />
                        ) : (
                          <XCircle size={15} color="#FF4444" />
                        )}
                      </View>
                      <View style={styles.detailTextWrap}>
                        <Text style={styles.detailLabel}>{t("tournament.registration", "REGISTRO")}</Text>
                        <Text style={[styles.detailValue, { color: tournament.registration_open ? "#4ADE80" : "#FF4444" }]} numberOfLines={1}>
                          {tournament.registration_open ? t("tournament.registration_open", "ABIERTAS") : t("tournament.registration_closed", "CERRADAS")}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailTile}>
                      <View style={styles.detailIconCircle}>
                        <Calendar size={15} color={theme.primary} />
                      </View>
                      <View style={styles.detailTextWrap}>
                        <Text style={styles.detailLabel}>{t("tournament.dates", "INICIO")}</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>
                          {tournament.start_date && !isNaN(new Date(tournament.start_date).getTime())
                            ? new Date(tournament.start_date).toLocaleDateString()
                            : 'Por definir'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Servicios de la Liga */}
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <ShieldCheck size={16} color={theme.primary} />
                    <Text style={styles.sectionTitle}>{t("tournament.league_services", "SERVICIOS DE LA LIGA")}</Text>
                  </View>
                  <View style={styles.featuresGrid}>
                    {renderServiceItem(CreditCard, t("tournament.service_payments", "Pagos"), !!tournament.features?.payments_enabled)}
                    {renderServiceItem(QrCode, t("tournament.service_qr", "Check-in QR"), !!tournament.features?.qr_checkin_enabled)}
                    {renderServiceItem(MessageSquare, t("tournament.service_comms", "Mensajería"), !!tournament.features?.comms_enabled)}
                    {renderServiceItem(ShieldCheck, t("tournament.service_discipline", "Control Disciplinario"), !!tournament.features?.discipline_enabled)}
                  </View>
                </View>

                {/* Acciones y Gestión */}
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <Settings2 size={16} color={theme.primary} />
                    <Text style={styles.sectionTitle}>ADMINISTRACIÓN DEL TORNEO</Text>
                  </View>

                  {/* Toggle Inscripciones */}
                  <TouchableOpacity 
                    style={[
                      styles.toggleRegistrationCard, 
                      { borderColor: tournament.registration_open ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255, 68, 68, 0.3)' }
                    ]} 
                    activeOpacity={0.8}
                    onPress={handleToggleRegistration}
                  >
                    <View style={styles.toggleCardLeft}>
                      <View style={[
                        styles.toggleIconCircle,
                        { backgroundColor: tournament.registration_open ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 68, 68, 0.15)' }
                      ]}>
                        {tournament.registration_open ? (
                          <CheckCircle2 size={18} color="#4ADE80" />
                        ) : (
                          <XCircle size={18} color="#FF4444" />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toggleCardTitle}>
                          {tournament.registration_open ? "Inscripciones Abiertas" : "Inscripciones Cerradas"}
                        </Text>
                        <Text style={styles.toggleCardSubtitle}>
                          {tournament.registration_open ? "Los equipos pueden inscribirse • Toca para cerrar" : "Bloqueo de registros activo • Toca para abrir"}
                        </Text>
                      </View>
                    </View>
                    {tournament.registration_open ? (
                      <ToggleRight size={26} color="#4ADE80" />
                    ) : (
                      <ToggleLeft size={26} color="#FF4444" />
                    )}
                  </TouchableOpacity>

                  {/* Botones de acción rápida: Crear Torneo y Clonar Temporada */}
                  <View style={styles.adminActionButtonsRow}>
                    <TouchableOpacity 
                      style={styles.adminActionColBtn} 
                      activeOpacity={0.8}
                      onPress={() => setIsCreateModalVisible(true)}
                    >
                      <Plus size={16} color={theme.primary} />
                      <Text style={styles.adminActionColBtnText}>Nuevo Torneo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.adminActionColBtn} 
                      activeOpacity={0.8}
                      onPress={() => setIsCloneModalVisible(true)}
                    >
                      <Copy size={16} color={theme.text} />
                      <Text style={[styles.adminActionColBtnText, { color: theme.text }]}>Clonar Temporada</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Ver Reglamento */}
                  <TouchableOpacity style={styles.rulesCard} activeOpacity={0.8}>
                    <View style={styles.rulesCardLeft}>
                      <View style={styles.rulesIconCircle}>
                        <BookOpen size={16} color={theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rulesCardTitle}>{t("tournament.view_rules", "Reglamento Oficial")}</Text>
                        <Text style={styles.rulesCardSub}>Normativa y bases de competencia</Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

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
    paddingBottom: 100,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContentOuter: {
    paddingBottom: 100,
  },
  webContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  contentPadding: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  tabContentArea: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  infoScrollContent: {
    paddingBottom: 20,
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
    fontSize: 13,
    color: theme.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  aboutCard: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: theme.surface,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
  },
  detailTile: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  detailIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(0, 245, 255, 0.08)' : 'rgba(0, 245, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextWrap: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.text,
    marginTop: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureBox: {
    width: '48%',
    backgroundColor: theme.surface,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
  },
  featureDisabled: {
    opacity: 0.5,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featureBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  toggleRegistrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  toggleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  toggleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleCardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: theme.text,
  },
  toggleCardSubtitle: {
    fontSize: 10,
    color: theme.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  adminActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  adminActionColBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  },
  adminActionColBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.primary,
  },
  rulesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
  },
  rulesCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rulesIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rulesCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.text,
  },
  rulesCardSub: {
    fontSize: 10,
    color: theme.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  tabScrollView: {
    flexGrow: 0,
    marginTop: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'center',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    flexShrink: 0,
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
