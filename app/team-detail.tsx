import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import api from '@/services/api';
import { Team } from '@/types/team';
import { TeamHeader } from '@/components/teams/TeamHeader';
import { CreateTeamModal } from '@/components/teams/CreateTeamModal';
import { Trophy, Users, Calendar, ChevronRight } from 'lucide-react-native';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTeamDetails();
    }
  }, [id]);

  const fetchTeamDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Team>(`/v1/teams/${id}/`);
      setTeam(response);
    } catch (error) {
      console.error('Error fetching team details:', error);
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

  if (!team) {
    return (
      <View style={[GlobalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <BackgroundGradient />
        <Text style={{ color: theme.textSecondary }}>No se encontró la información del equipo.</Text>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.webContainer}>
          {/* HEADER MONUMENTAL */}
          <TeamHeader 
            team={team} 
            onEditPress={() => setIsEditModalVisible(true)}
          />

          {/* TOURNEY REGISTRATIONS SECTION */}
          <View style={styles.contentPadding}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TORNEOS Y COMPETENCIAS</Text>
            </View>

            {team.tournament_registrations && team.tournament_registrations.length > 0 ? (
              team.tournament_registrations.map((reg) => (
                <View key={reg.id} style={styles.registrationCard}>
                  <View style={styles.regIconBox}>
                    <Trophy size={20} color={theme.primary} />
                  </View>
                  <View style={styles.regInfo}>
                    <Text style={styles.regTitle}>{reg.tournament_name}</Text>
                    <View style={styles.regMetaRow}>
                      <View style={styles.metaItem}>
                        <Users size={12} color={theme.textSecondary} />
                        <Text style={styles.metaText}>{reg.player_count} Jugadores</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Calendar size={12} color={theme.textSecondary} />
                        <Text style={styles.metaText}>{new Date(reg.created_at).toLocaleDateString()}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, { color: reg.is_active ? theme.primary : theme.textSecondary }]}>
                      {reg.is_active ? 'ACTIVO' : 'INACTIVO'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Este equipo aún no está inscrito en ningún torneo.</Text>
              </View>
            )}

            {/* ADDITIONAL INFO WIDGET */}
            <View style={styles.infoWidget}>
              <Text style={styles.widgetTitle}>Información del Club</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Liga de Origen</Text>
                <Text style={styles.infoValue}>{team.league_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ciudad</Text>
                <Text style={styles.infoValue}>{team.city}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dueño</Text>
                <Text style={styles.infoValue}>{team.owner_name}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* EDIT MODAL */}
      <CreateTeamModal 
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={fetchTeamDetails}
        initialData={team}
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
    marginTop: -20, // Overlap with header gradient
  },
  sectionHeader: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.primary,
    letterSpacing: 1.5,
  },
  registrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  regIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  regInfo: {
    flex: 1,
  },
  regTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 4,
  },
  regMetaRow: {
    flexDirection: 'row',
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyState: {
    padding: 30,
    backgroundColor: theme.surface,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  emptyText: {
    color: theme.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  infoWidget: {
    marginTop: 30,
    padding: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    color: theme.text,
    fontWeight: '700',
  },
});
