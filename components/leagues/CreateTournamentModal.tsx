import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormDatePicker } from "@/components/ui/forms/FormDatePicker";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";
import { useTheme } from "@/context/ThemeContext";
import { TournamentSchema, tournamentSchema } from "@/features/tournaments/schemas/tournamentSchema";
import api from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trophy, X, Calendar, Trash2, AlertTriangle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import { Tournament } from "@/features/tournaments/types/tournament";
import { router } from "expo-router";

interface CreateTournamentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leagueId: string;
  initialData?: Tournament | null;
}

export function CreateTournamentModal({
  visible,
  onClose,
  onSuccess,
  leagueId,
  initialData,
}: CreateTournamentModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditing = !!initialData;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TournamentSchema>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: "",
      season_label: "",
      status: "draft",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    },
  });

  useEffect(() => {
    if (visible) {
      if (initialData) {
        reset({
          name: initialData.name,
          season_label: initialData.season_label,
          status: initialData.status,
          start_date: initialData.start_date.split("T")[0],
          end_date: initialData.end_date.split("T")[0],
        });
      } else {
        reset({
          name: "",
          season_label: "",
          status: "draft",
          start_date: new Date().toISOString().split("T")[0],
          end_date: "",
        });
      }
    }
  }, [visible, initialData, reset]);

  const onSubmit = async (data: TournamentSchema) => {
    try {
      if (isEditing && initialData) {
        await api.patch(`/v1/tournaments/${initialData.id}/`, {
          ...data,
          league: leagueId,
        });
        Alert.alert("¡Actualizado!", "Torneo actualizado correctamente.");
      } else {
        await api.post("/v1/tournaments/", {
          ...data,
          league: leagueId,
        });
        Alert.alert("¡Éxito!", "Torneo creado correctamente.");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving tournament:", error);
      Alert.alert(
        "Error",
        error.message || "Ocurrió un problema al guardar el torneo."
      );
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;

    Alert.alert(
      "Eliminar Torneo",
      "¿Estás seguro? Esta acción eliminará permanentemente todos los partidos y posiciones de este torneo.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await api.delete(`/v1/tournaments/${initialData.id}/`);
              Alert.alert("Torneo Eliminado", "La competición ha sido removida.");
              onSuccess();
              onClose();
              // Si estamos en el detalle del torneo, regresamos a la pantalla anterior
              if (router.canGoBack()) {
                router.back();
              }
            } catch (error: any) {
              Alert.alert("Error", "No se pudo eliminar el torneo.");
            } finally {
              setIsDeleting(false);
            }
          }
        }
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
              {isEditing ? "EDITAR TORNEO" : "NUEVO TORNEO"}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formSection}>
              <View style={styles.heroIconBox}>
                <Trophy size={40} color={theme.primary} />
              </View>
              
              <Text style={styles.sectionTitle}>
                {isEditing ? "Ajustes de Competición" : "Lanzar Competición"}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {isEditing 
                  ? "Modifica los detalles principales de esta temporada."
                  : "Configura la nueva temporada o edición de tu liga."}
              </Text>

              <FormInput
                control={control}
                name="name"
                label="NOMBRE DEL TORNEO"
                placeholder="Ej. Torneo Apertura 2024"
                required
              />

              <FormInput
                control={control}
                name="season_label"
                label="ETIQUETA DE TEMPORADA"
                placeholder="Ej. 2024-I"
                required
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <FormDatePicker
                    control={control}
                    name="start_date"
                    label="FECHA INICIO"
                    required
                  />
                </View>
                <View style={{ width: 15 }} />
                <View style={{ flex: 1 }}>
                  <FormDatePicker
                    control={control}
                    name="end_date"
                    label="FECHA FIN"
                    required
                  />
                </View>
              </View>

              <View style={styles.infoBox}>
                 <Calendar size={16} color={theme.primary} />
                 <Text style={styles.infoText}>
                   El estado del torneo determina si es visible para los jugadores y si se pueden registrar resultados.
                 </Text>
              </View>

              <PrimaryButton
                title={isSubmitting ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Crear Torneo")}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting || isDeleting}
                style={{ marginTop: 10 }}
                fullWidth
              />

              {/* DANGER ZONE */}
              {isEditing && (
                <View style={styles.dangerZone}>
                  <View style={styles.dangerHeader}>
                    <AlertTriangle size={16} color="#FF4444" />
                    <Text style={styles.dangerTitle}>ZONA DE PELIGRO</Text>
                  </View>
                  <Text style={styles.dangerSubtitle}>
                    Eliminar este torneo es una acción irreversible. Se perderán todos los datos vinculados.
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator color="#FF4444" size="small" />
                    ) : (
                      <>
                        <Trash2 size={18} color="#FF4444" />
                        <Text style={styles.deleteButtonText}>Eliminar Torneo Permanentemente</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
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
      fontSize: 14,
      fontWeight: "900",
      color: theme.primary,
      letterSpacing: 2,
    },
    scrollContent: {
      paddingHorizontal: 25,
      paddingTop: 10,
      paddingBottom: 40,
    },
    formSection: {
      width: "100%",
    },
    heroIconBox: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: theme.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
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
    row: {
      flexDirection: 'row',
    },
    infoBox: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      padding: 15,
      borderRadius: 12,
      marginVertical: 20,
      gap: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    infoText: {
      flex: 1,
      fontSize: 11,
      color: theme.textSecondary,
      lineHeight: 16,
      fontWeight: '600',
    },
    dangerZone: {
      marginTop: 40,
      padding: 20,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 68, 68, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255, 68, 68, 0.1)',
    },
    dangerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
    },
    dangerTitle: {
      fontSize: 12,
      fontWeight: '900',
      color: '#FF4444',
      letterSpacing: 1,
    },
    dangerSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 18,
      marginBottom: 20,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#FF4444',
      gap: 10,
    },
    deleteButtonText: {
      color: '#FF4444',
      fontSize: 13,
      fontWeight: '800',
    },
  });
