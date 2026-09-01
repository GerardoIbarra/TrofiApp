import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { GlobalStyles } from "@/constants/GlobalStyles";
import api from "@/services/api";
import { useCreateJoinRequest, useApproveJoinRequest, useRejectJoinRequest } from "@/features/players/services/rosterApi";
import { Users, UserPlus, Check, X, ShieldHalf, Star } from "lucide-react-native";
import { useAuthStore } from "@/features/auth/store/authStore";

export default function TournamentTeamDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);

  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const joinMutation = useCreateJoinRequest();
  const approveMutation = useApproveJoinRequest();
  const rejectMutation = useRejectJoinRequest();

  // Basic role check - in a real app this uses the 'captain' property or admin role
  const isCaptain = teamInfo?.captain_id === user?.id;

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch team details for this tournament
      const teamRes = await api.get(`/v1/tournament-teams/${id}/`);
      setTeamInfo(teamRes);

      // 2. Fetch roster
      const rosterRes = await api.get<any>(`/v1/roster/?tournament_team=${id}`);
      setRoster(rosterRes.results || []);

      // 3. Fetch join requests (only if captain/admin, but backend might filter)
      try {
        const requestsRes = await api.get<any>(`/v1/join-requests/?tournament_team=${id}`);
        setJoinRequests(requestsRes.results || []);
      } catch (e) {
        // Ignored if user doesn't have permission to view requests
      }
    } catch (error) {
      console.error("Error fetching tournament team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = () => {
    if (!user || !user.player_profile_id) {
      Alert.alert("Perfil Requerido", "Debes crear tu perfil de jugador primero.");
      return;
    }

    joinMutation.mutate({
      tournament: teamInfo.tournament,
      tournament_team: id as string,
      player: user.player_profile_id
    }, {
      onSuccess: () => {
        Alert.alert("Solicitud Enviada", "El capitán debe aprobar tu solicitud.");
        fetchData();
      },
      onError: (err: any) => {
        Alert.alert("Error", err.message || "No se pudo enviar la solicitud.");
      }
    });
  };

  if (isLoading) {
    return (
      <View style={[GlobalStyles.container, { justifyContent: "center", alignItems: "center" }]}>
        <BackgroundGradient />
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  if (!teamInfo) {
    return (
      <View style={[GlobalStyles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: theme.textSecondary }}>Equipo no encontrado en este torneo.</Text>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <ShieldHalf size={40} color={theme.primary} />
          </View>
          <Text style={styles.teamName}>{teamInfo.team_name}</Text>
          <Text style={styles.tournamentName}>Plantel del Torneo</Text>
          
          {!isCaptain && (
            <TouchableOpacity 
              style={[styles.joinButton, joinMutation.isPending && { opacity: 0.7 }]} 
              onPress={handleJoinRequest}
              disabled={joinMutation.isPending}
            >
              <UserPlus size={18} color="#001A2C" />
              <Text style={styles.joinButtonText}>Solicitar Unirse</Text>
            </TouchableOpacity>
          )}
        </View>

        {isCaptain && joinRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Solicitudes Pendientes</Text>
            {joinRequests.map(req => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.reqInfo}>
                  <Text style={styles.reqName}>{req.player_name || 'Jugador'}</Text>
                  <Text style={styles.reqDate}>{new Date(req.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.reqActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#FF444420' }]}
                    onPress={() => rejectMutation.mutate(req.id, { onSuccess: fetchData })}
                  >
                    <X size={16} color="#FF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#4ADE8020' }]}
                    onPress={() => approveMutation.mutate(req.id, { onSuccess: fetchData })}
                  >
                    <Check size={16} color="#4ADE80" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jugadores ({roster.length})</Text>
          {roster.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={30} color={theme.textSecondary} opacity={0.5} />
              <Text style={styles.emptyText}>No hay jugadores en el plantel aún.</Text>
            </View>
          ) : (
            <View style={styles.rosterGrid}>
              {roster.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.playerCard}
                  onPress={() => router.push({
                    pathname: '/player-detail',
                    params: { 
                      playerId: item.player, 
                      tournamentId: teamInfo.tournament, 
                      playerName: item.player_name 
                    }
                  })}
                >
                  <View style={styles.playerAvatar}>
                    <Text style={styles.avatarText}>{item.player_name?.charAt(0) || 'J'}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{item.player_name}</Text>
                    <Text style={styles.playerPosition}>
                      {item.position ? item.position.toUpperCase() : 'SIN POSICIÓN'}
                      {item.shirt_number ? ` • #${item.shirt_number}` : ''}
                    </Text>
                  </View>
                  {teamInfo.captain_id === item.player && (
                    <Star size={16} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  scrollContent: { paddingBottom: 40, paddingHorizontal: 20 },
  header: { alignItems: 'center', marginVertical: 30 },
  iconBox: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: theme.primary + '15',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15,
  },
  teamName: { fontSize: 24, fontWeight: '900', color: theme.text, marginBottom: 4 },
  tournamentName: { fontSize: 14, color: theme.textSecondary, marginBottom: 20 },
  joinButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
  },
  joinButtonText: { color: '#001A2C', fontSize: 14, fontWeight: '800' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 15 },
  requestCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.surface, padding: 15, borderRadius: 12, marginBottom: 10,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  reqInfo: { flex: 1 },
  reqName: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 2 },
  reqDate: { fontSize: 11, color: theme.textSecondary },
  reqActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  rosterGrid: { gap: 10 },
  playerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 15,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
  },
  playerAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primary + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: theme.primary, fontWeight: '800', fontSize: 16 },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 2 },
  playerPosition: { fontSize: 10, fontWeight: '700', color: theme.textSecondary, letterSpacing: 0.5 },
  emptyState: {
    padding: 30, alignItems: 'center', backgroundColor: theme.surface, borderRadius: 16,
    borderWidth: 1, borderStyle: 'dashed', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  emptyText: { marginTop: 10, fontSize: 13, color: theme.textSecondary, textAlign: 'center' },
});
