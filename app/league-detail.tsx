import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { useTheme } from '@/context/ThemeContext';

import { LeagueHeader } from '@/components/leagues/LeagueHeader';
import { LeagueTabsList } from '@/components/leagues/LeagueTabsList';
import { LeagueMembersWidget } from '@/components/leagues/LeagueMembersWidget';
import { BulletinWidget } from '@/components/leagues/BulletinWidget';
import { CreateLeagueModal } from '@/components/leagues/CreateLeagueModal';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import api from '@/services/api';
import { League } from '@/types/league';
import { ActivityIndicator } from 'react-native';
import { 
  CreditCard, 
  QrCode, 
  MessageSquare, 
  ShieldCheck, 
  ShoppingBag, 
  Award,
  Zap
} from 'lucide-react-native';

export default function LeagueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('POSICIONES');
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  useEffect(() => {
    if (id) {
      fetchLeagueDetails();
    }
  }, [id]);

  const fetchLeagueDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<League>(`/v1/leagues/${id}/`);
      setLeague(response);
    } catch (error) {
      console.error('Error fetching league details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const FEATURE_CONFIG = [
    { key: 'payments_enabled', label: 'Pagos', icon: CreditCard },
    { key: 'qr_checkin_enabled', label: 'QR', icon: QrCode },
    { key: 'comms_enabled', label: 'Chat', icon: MessageSquare },
    { key: 'discipline_enabled', label: 'Disciplina', icon: ShieldCheck },
    { key: 'player_market_enabled', label: 'Mercado', icon: ShoppingBag },
    { key: 'sponsors_enabled', label: 'Sponsors', icon: Award },
    { key: 'white_label_enabled', label: 'Premium', icon: Zap },
  ];

  const activeFeatures = FEATURE_CONFIG.filter(f => league?.features?.[f.key as keyof typeof league.features]);

  // Generate Dynamic Tabs
  const dynamicTabs = ['POSICIONES', 'PARTIDOS'];
  if (league?.features?.comms_enabled) dynamicTabs.push('NOTICIAS');
  dynamicTabs.push('JUGADORES');
  if (league?.features?.payments_enabled) dynamicTabs.push('PAGOS');

  // Fallback to first tab if activeTab is not in dynamicTabs
  useEffect(() => {
    if (league && dynamicTabs.length > 0 && !dynamicTabs.includes(activeTab)) {
      setActiveTab(dynamicTabs[0]);
    }
  }, [id, activeTab, league === null]); // Only care if league just loaded or id changed

  if (isLoading) {
    return (
      <View style={[GlobalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <BackgroundGradient />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!league) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'JUGADORES':
        return <LeagueMembersWidget leagueId={league.id} />;
      case 'PAGOS':
        return (
          <View style={styles.comingSoonBox}>
             <Text style={styles.comingSoonText}>
               El módulo de pagos seguros está siendo configurado por el administrador de la liga.
             </Text>
          </View>
        );
      default:
        return (
          <View style={styles.comingSoonBox}>
             <Text style={styles.comingSoonText}>
               Las estadísticas y resultados de {activeTab.toLowerCase()} estarán disponibles una vez que inicie el torneo.
             </Text>
          </View>
        );
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        bounces={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.webContainer}>
          {/* ENCABEZADO MONUMENTAL */}
          <LeagueHeader 
            league={league} 
            onEditPress={() => setIsEditModalVisible(true)} 
          />

          {/* FEATURES CHIPS */}
          {activeFeatures.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuresScroll}
            >
              {activeFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <View key={index} style={styles.featureChip}>
                    <Icon size={14} color={theme.primary} />
                    <Text style={styles.featureText}>{feature.label}</Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* CONTENIDO DESLIZABLE */}
          <View style={styles.contentWrapper}>
            <LeagueTabsList 
              tabs={dynamicTabs}
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
            
            {renderTabContent()}
          </View>
        </View>
      </ScrollView>

      {/* MODAL DE EDICIÓN (REUTILIZADO) */}
      <CreateLeagueModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={fetchLeagueDetails}
        initialData={league}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  scrollContent: {
    paddingBottom: 100, // Extra space for nav
  },
  webContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  contentWrapper: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  featuresScroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 12,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  featureText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: 0.5,
  },
  comingSoonBox: {
    padding: 30,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    marginTop: 20,
  },
  comingSoonText: {
    textAlign: 'center',
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
