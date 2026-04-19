import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import api from '@/services/api';
import { Tournament } from '@/types/tournament';
import { TournamentHeader } from '@/components/leagues/TournamentHeader';
import { CreateTournamentModal } from '@/components/leagues/CreateTournamentModal';
import { Trophy, Calendar, Info, ShieldCheck, CreditCard, MessageSquare, QrCode } from 'lucide-react-native';

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

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
        <Text style={{ color: theme.textSecondary }}>No se encontró la información del torneo.</Text>
      </View>
    );
  }

  const FEATURE_LIST = [
    { key: 'payments_enabled', label: 'Pagos', icon: CreditCard },
    { key: 'qr_checkin_enabled', label: 'Check-in QR', icon: QrCode },
    { key: 'comms_enabled', label: 'Mensajería', icon: MessageSquare },
    { key: 'discipline_enabled', label: 'Control Disciplinario', icon: ShieldCheck },
  ];

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.webContainer}>
          {/* HEADER MONUMENTAL */}
          <TournamentHeader 
            tournament={tournament} 
            onEditPress={() => setIsEditModalVisible(true)}
          />

          <View style={styles.contentPadding}>
            {/* DESCRIPTION WIDGET */}
            {tournament.description && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Info size={16} color={theme.primary} />
                  <Text style={styles.cardTitle}>SOBRE EL TORNEO</Text>
                </View>
                <Text style={styles.description}>{tournament.description}</Text>
              </View>
            )}

            {/* FEATURES GRID */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>SERVICIOS ACTIVOS</Text>
            </View>
            
            <View style={styles.featuresGrid}>
              {FEATURE_LIST.map((feature) => {
                const isEnabled = tournament.features?.[feature.key as keyof typeof tournament.features];
                const Icon = feature.icon;
                return (
                  <View 
                    key={feature.key} 
                    style={[styles.featureBox, !isEnabled && styles.featureDisabled]}
                  >
                    <Icon size={20} color={isEnabled ? theme.primary : theme.textSecondary} />
                    <Text style={[styles.featureLabel, !isEnabled && { color: theme.textSecondary }]}>
                      {feature.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* STANDINGS PREVIEW / ACTION BUTTONS */}
            <TouchableOpacity style={styles.mainActionButton}>
              <Trophy size={20} color="#001A2C" />
              <Text style={styles.mainActionText}>VER TABLA DE POSICIONES</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.mainActionButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.primary, marginTop: 12 }]}>
              <Calendar size={20} color={theme.primary} />
              <Text style={[styles.mainActionText, { color: theme.primary }]}>VER CALENDARIO DE PARTIDOS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* MODAL DE GESTIÓN */}
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
  webContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  contentPadding: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  card: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.primary,
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  sectionHeader: {
    marginVertical: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: theme.textSecondary,
    letterSpacing: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
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
  mainActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    padding: 18,
    borderRadius: 16,
    gap: 12,
  },
  mainActionText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#001A2C',
    letterSpacing: 0.5,
  },
});
