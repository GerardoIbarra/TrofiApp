import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import api from '@/services/api';
import { Tournament } from '@/features/tournaments/types/tournament';
import { TournamentHeader } from '@/components/leagues/TournamentHeader';
import { CreateTournamentModal } from '@/components/leagues/CreateTournamentModal';
import { TournamentStandingsWidget } from '@/components/tournaments/TournamentStandingsWidget';
import { TournamentMatchesWidget } from '@/components/tournaments/TournamentMatchesWidget';
import { Trophy, Calendar, Info, ShieldCheck, CreditCard, MessageSquare, QrCode } from 'lucide-react-native';
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
  const [activeTab, setActiveTab] = useState('STANDINGS');

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
          />

          <View style={styles.tabContainer}>
            {['STANDINGS', 'MATCHES', 'INFO'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, activeTab === tab && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {t(`tournament.tab_${tab.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tabContentArea}>
            {activeTab === 'STANDINGS' && (
              <TournamentStandingsWidget tournamentId={tournament.id} />
            )}

            {activeTab === 'MATCHES' && (
              <TournamentMatchesWidget tournamentId={tournament.id} isAdmin={true} />
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
