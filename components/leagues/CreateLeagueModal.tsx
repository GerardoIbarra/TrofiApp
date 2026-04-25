import React from "react";
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { X, Trophy, MapPin, Globe, Trash2 } from "lucide-react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leagueSchema, LeagueSchema } from "@/features/leagues/schemas/leagueSchema";
import { useTheme } from "@/context/ThemeContext";
import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { FormInput } from "@/components/ui/forms/FormInput";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";
import { useAuthStore } from "@/features/auth/store/authStore";
import api from "@/services/api";
import { League } from "@/features/leagues/types/league";
import { useEffect } from "react";
import { router } from "expo-router";

interface CreateLeagueModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: League | null;
}

export function CreateLeagueModal({
  visible,
  onClose,
  onSuccess,
  initialData = null,
}: CreateLeagueModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);

  const isEditing = !!initialData;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LeagueSchema>({
    resolver: zodResolver(leagueSchema),
    defaultValues: {
      name: initialData?.name || "",
      city: initialData?.city || "",
      country: initialData?.country || "México",
    },
  });

  // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (visible) {
      reset({
        name: initialData?.name || "",
        city: initialData?.city || "",
        country: initialData?.country || "México",
      });
    }
  }, [initialData, visible, reset]);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const onSubmit = async (data: LeagueSchema) => {
    if (!user?.id) {
      Alert.alert("Error", "No se pudo identificar al usuario.");
      return;
    }

    try {
      const payload = {
        name: data.name,
        slug: isEditing ? initialData.slug : slugify(data.name) + "-" + Math.floor(Math.random() * 1000),
        city: data.city,
        country: data.country,
        created_by: user.id,
      };

      if (isEditing) {
        await api.patch(`/v1/leagues/${initialData.id}/`, payload);
        Alert.alert("¡Éxito!", "La liga ha sido actualizada correctamente.");
      } else {
        await api.post("/v1/leagues/", payload);
        Alert.alert("¡Éxito!", "La liga ha sido registrada correctamente.");
      }

      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving league:", error);
      Alert.alert(
        "Error",
        error.message || "Ocurrió un problema al guardar la liga."
      );
    }
  };

  const handleDelete = () => {
    if (!initialData?.id) return;

    Alert.alert(
      "Eliminar Liga",
      "¿Estás seguro de que deseas eliminar esta liga? Esta acción no se puede deshacer y se perderán todos los datos asociados.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar definitivamente",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/v1/leagues/${initialData.id}/`);
              onClose();
              // Redirect to main leagues explorer
              router.push("/(tabs)/leagues" as any);
              onSuccess();
            } catch (error: any) {
              console.error("Error deleting league:", error);
              Alert.alert("Error", "No se pudo eliminar la liga.");
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
              {isEditing ? "EDITAR LIGA" : "NUEVA LIGA"}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formSection}>
              <View style={styles.iconCircle}>
                <Trophy size={40} color={theme.primary} />
              </View>
              
              <Text style={styles.sectionTitle}>
                {isEditing ? "Actualizar Liga" : "Organiza tu Liga"}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {isEditing 
                  ? "Modifica los detalles básicos de tu competición para mantenerla actualizada."
                  : "Crea una nueva competición y gestiona equipos, calendarios y estadísticas."
                }
              </Text>

              <FormInput
                control={control}
                name="name"
                label="NOMBRE DE LA LIGA"
                placeholder="Ej. Liga Premier Zapopan"
                required
              />

              <View style={styles.row}>
                <FormInput
                  control={control}
                  name="city"
                  label="CIUDAD"
                  placeholder="Ej. Guadalajara"
                  required
                  containerStyle={{ flex: 1 }}
                />
                <View style={{ width: 15 }} />
                <FormInput
                  control={control}
                  name="country"
                  label="PAÍS"
                  placeholder="Ej. México"
                  required
                  containerStyle={{ flex: 1 }}
                />
              </View>

              <View style={styles.infoBox}>
                <Globe size={18} color={theme.primary} />
                <Text style={styles.infoText}>
                  La liga será visible para todos los jugadores en la sección de exploración.
                </Text>
              </View>

              <PrimaryButton
                title={isSubmitting ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Crear Liga Ahora")}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                style={{ marginTop: 10 }}
                fullWidth
              />

              {isEditing && (
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={handleDelete}
                  disabled={isSubmitting}
                >
                  <Trash2 size={18} color="#FF4B4B" />
                  <Text style={styles.deleteButtonText}>Eliminar Liga</Text>
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
      paddingTop: 10,
      paddingBottom: 40,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? "rgba(0, 245, 255, 0.05)" : "rgba(0, 245, 255, 0.03)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      alignSelf: 'center',
      borderWidth: 1,
      borderColor: isDark ? "rgba(0, 245, 255, 0.1)" : "rgba(0, 245, 255, 0.05)",
    },
    formSection: {
      width: "100%",
    },
    sectionTitle: {
      fontSize: 28,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 35,
      textAlign: 'center',
      paddingHorizontal: 10,
    },
    row: {
      flexDirection: 'row',
      width: '100%',
    },
    infoBox: {
      flexDirection: 'row',
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      gap: 12,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 25,
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
