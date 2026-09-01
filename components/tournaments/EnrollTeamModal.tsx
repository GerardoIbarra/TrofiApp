import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";
import { useTheme } from "@/context/ThemeContext";
import { useEnrollTeam } from "@/features/teams/services/tournamentTeamApi";
import api from "@/services/api";
import { Team } from "@/features/teams/types/team";
import { CheckCircle2, ShieldHalf, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface EnrollTeamModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tournamentId: string;
}

export function EnrollTeamModal({
  visible,
  onClose,
  onSuccess,
  tournamentId,
}: EnrollTeamModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const enrollMutation = useEnrollTeam();

  useEffect(() => {
    if (visible) {
      fetchUserTeams();
    }
  }, [visible]);

  const fetchUserTeams = async () => {
    setIsLoading(true);
    try {
      // Usualmente el backend filtra los equipos donde el usuario es owner o capitán
      const response = await api.get<any>("/v1/teams/");
      setTeams(response.results || response);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = () => {
    if (!selectedTeamId) {
      Alert.alert("Error", "Debes seleccionar un equipo para inscribir.");
      return;
    }

    enrollMutation.mutate(
      {
        tournament: tournamentId,
        team: selectedTeamId,
      },
      {
        onSuccess: () => {
          Alert.alert("¡Éxito!", "Equipo inscrito correctamente en el torneo.");
          onSuccess();
          onClose();
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "Ocurrió un problema al inscribir el equipo.");
        },
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <BackgroundGradient />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>INSCRIBIR EQUIPO</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.heroIconBox}>
              <ShieldHalf size={40} color={theme.primary} />
            </View>

            <Text style={styles.sectionTitle}>Selecciona un Equipo</Text>
            <Text style={styles.sectionSubtitle}>
              Elige uno de tus equipos para inscribirlo en este torneo. Solo puedes seleccionar equipos de los que seas dueño o administrador.
            </Text>

            {isLoading ? (
              <ActivityIndicator color={theme.primary} size="large" style={{ marginVertical: 40 }} />
            ) : teams.length > 0 ? (
              <View style={styles.teamsGrid}>
                {teams.map((team) => (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.teamItem,
                      selectedTeamId === team.id && styles.teamSelected,
                    ]}
                    onPress={() => setSelectedTeamId(team.id)}
                  >
                    <ShieldHalf size={24} color={selectedTeamId === team.id ? "#001A2C" : theme.primary} />
                    <View style={styles.teamInfo}>
                      <Text style={[styles.teamName, selectedTeamId === team.id && styles.textSelected]}>
                        {team.name}
                      </Text>
                      <Text style={[styles.teamCity, selectedTeamId === team.id && styles.textSelected]}>
                        {team.city || "Sin ciudad especificada"}
                      </Text>
                    </View>
                    {selectedTeamId === team.id && <CheckCircle2 size={20} color="#001A2C" />}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No tienes equipos disponibles para inscribir.</Text>
                <Text style={styles.emptySubText}>Crea un equipo primero en la pestaña de equipos.</Text>
              </View>
            )}

            <PrimaryButton
              title={enrollMutation.isPending ? "Inscribiendo..." : "Confirmar Inscripción"}
              onPress={onSubmit}
              disabled={enrollMutation.isPending || !selectedTeamId}
              style={{ marginTop: 30 }}
              fullWidth
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 50 : 20, paddingBottom: 15,
    },
    closeButton: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      justifyContent: "center", alignItems: "center",
    },
    headerTitle: { fontSize: 14, fontWeight: "900", color: theme.primary, letterSpacing: 2 },
    scrollContent: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 40 },
    heroIconBox: {
      width: 80, height: 80, borderRadius: 20, backgroundColor: theme.primary + "15",
      justifyContent: "center", alignItems: "center", marginBottom: 20,
    },
    sectionTitle: { fontSize: 24, fontWeight: "900", color: theme.text, marginBottom: 8 },
    sectionSubtitle: { fontSize: 14, color: theme.textSecondary, marginBottom: 30 },
    teamsGrid: { gap: 12 },
    teamItem: {
      flexDirection: "row", alignItems: "center", gap: 15,
      padding: 16, borderRadius: 16,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    },
    teamSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
    teamInfo: { flex: 1 },
    teamName: { fontSize: 16, fontWeight: "800", color: theme.text, marginBottom: 2 },
    teamCity: { fontSize: 12, color: theme.textSecondary },
    textSelected: { color: "#001A2C" },
    emptyBox: {
      padding: 30, borderRadius: 16,
      backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
      borderWidth: 1, borderStyle: "dashed", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      alignItems: "center"
    },
    emptyText: { color: theme.text, fontSize: 15, fontWeight: "700", textAlign: "center", marginBottom: 5 },
    emptySubText: { color: theme.textSecondary, fontSize: 13, textAlign: "center" },
  });
