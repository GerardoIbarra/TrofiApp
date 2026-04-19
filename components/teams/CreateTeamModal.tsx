import { BackgroundGradient } from "@/components/BackgroundGradient";
import { FormInput } from "@/components/FormInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTheme } from "@/context/ThemeContext";
import { TeamSchema, teamSchema } from "@/schemas/teamSchema";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { League, LeaguesResponse } from "@/types/league";
import { Team } from "@/types/team";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Trophy, X, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { router } from "expo-router";

interface CreateTeamModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Team | null;
}

export function CreateTeamModal({
  visible,
  onClose,
  onSuccess,
  initialData = null,
}: CreateTeamModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);

  const isEditing = !!initialData;

  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<TeamSchema>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: initialData?.name || "",
      city: initialData?.city || "",
      league: initialData?.league || "",
    },
  });

  const selectedLeagueId = watch("league");

  useEffect(() => {
    if (visible) {
      fetchLeagues();
      reset({
        name: initialData?.name || "",
        city: initialData?.city || "",
        league: initialData?.league || "",
      });
    }
  }, [visible, initialData, reset]);

  const fetchLeagues = async () => {
    setIsLoadingLeagues(true);
    try {
      const response = await api.get<LeaguesResponse>("/v1/leagues/");
      setLeagues(response.results);
    } catch (error) {
      console.error("Error fetching leagues:", error);
    } finally {
      setIsLoadingLeagues(false);
    }
  };

  const onSubmit = async (data: TeamSchema) => {
    if (!user?.id) {
      Alert.alert("Error", "No se pudo identificar al usuario.");
      return;
    }

    try {
      const payload = {
        name: data.name,
        city: data.city,
        league: data.league,
        owner: user.id,
      };

      if (isEditing && initialData) {
        await api.patch(`/v1/teams/${initialData.id}/`, payload);
        Alert.alert("¡Éxito!", "El equipo ha sido actualizado correctamente.");
      } else {
        await api.post("/v1/teams/", payload);
        Alert.alert("¡Éxito!", "El equipo ha sido creado correctamente.");
      }

      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving team:", error);
      Alert.alert(
        "Error",
        error.message || "Ocurrió un problema al guardar el equipo.",
      );
    }
  };

  const handleDelete = () => {
    if (!initialData?.id) return;

    Alert.alert(
      "Eliminar Equipo",
      "¿Estás seguro de que deseas eliminar este equipo? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar definitivamente",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/v1/teams/${initialData.id}/`);
              onClose();
              router.push("/(tabs)/teams" as any);
              onSuccess();
            } catch (error: any) {
              console.error("Error deleting team:", error);
              Alert.alert("Error", "No se pudo eliminar el equipo.");
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <BackgroundGradient />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? "EDITAR EQUIPO" : "NUEVO EQUIPO"}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>
                {isEditing ? "Ajustes del Equipo" : "Detalles del Equipo"}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {isEditing 
                  ? "Modifica la identidad y la liga de tu equipo."
                  : "Define la identidad de tu equipo en la plataforma."
                }
              </Text>

              <FormInput
                control={control}
                name="name"
                label="NOMBRE DEL EQUIPO"
                placeholder="Ej. Galaxy FC"
                required
              />

              <FormInput
                control={control}
                name="city"
                label="CIUDAD"
                placeholder="Ej. Guadalajara"
                required
              />

              {/* League Selector */}
              <View style={styles.leagueSelectorContainer}>
                <Text style={styles.selectorLabel}>SELECCIONAR LIGA</Text>
                {isLoadingLeagues ? (
                  <ActivityIndicator
                    color={theme.primary}
                    style={{ marginTop: 10 }}
                  />
                ) : (
                  <View style={styles.leaguesGrid}>
                    {leagues.length > 0 ? (
                      leagues.map((league) => (
                        <TouchableOpacity
                          key={league.id}
                          style={[
                            styles.leagueItem,
                            selectedLeagueId === league.id &&
                              styles.leagueSelected,
                          ]}
                          onPress={() => setValue("league", league.id)}
                        >
                          <Trophy
                            size={20}
                            color={
                              selectedLeagueId === league.id
                                ? "#001A2C"
                                : theme.primary
                            }
                          />
                          <Text
                            style={[
                              styles.leagueItemText,
                              selectedLeagueId === league.id &&
                                styles.textSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {league.name}
                          </Text>
                          {selectedLeagueId === league.id && (
                            <CheckCircle2 size={16} color="#001A2C" />
                          )}
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.noLeaguesBox}>
                        <Text style={styles.noLeaguesText}>
                          No hay ligas disponibles en este momento.
                        </Text>
                        <TouchableOpacity onPress={fetchLeagues}>
                          <Text style={styles.retryText}>Reintentar carga</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <PrimaryButton
                title={isSubmitting ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Crear Equipo")}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                style={{ marginTop: 20 }}
                fullWidth
              />

              {isEditing && (
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={handleDelete}
                  disabled={isSubmitting}
                >
                  <Trash2 size={18} color="#FF4B4B" />
                  <Text style={styles.deleteButtonText}>Eliminar Equipo</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "ios" ? 50 : 20,
      paddingBottom: 15,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: theme.primary,
      letterSpacing: 2,
    },
    scrollContent: {
      paddingHorizontal: 25,
      paddingTop: 20,
      paddingBottom: 40,
    },
    formSection: {
      width: "100%",
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 30,
    },
    leagueSelectorContainer: {
      marginBottom: 20,
    },
    selectorLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 12,
    },
    leaguesGrid: {
      gap: 10,
    },
    leagueItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      padding: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      gap: 12,
    },
    leagueSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    leagueItemText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    textSelected: {
      color: "#001A2C",
    },
    noLeaguesBox: {
      padding: 20,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    noLeaguesText: {
      color: theme.textSecondary,
      fontSize: 13,
      textAlign: "center",
      marginBottom: 8,
    },
    retryText: {
      color: theme.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 30,
      padding: 15,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    deleteButtonText: {
      color: '#FF4B4B',
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });
