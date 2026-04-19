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
import { X, Trophy, MapPin, Globe } from "lucide-react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leagueSchema, LeagueSchema } from "@/schemas/leagueSchema";
import { useTheme } from "@/context/ThemeContext";
import { BackgroundGradient } from "@/components/BackgroundGradient";
import { FormInput } from "@/components/FormInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";

interface CreateLeagueModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateLeagueModal({
  visible,
  onClose,
  onSuccess,
}: CreateLeagueModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LeagueSchema>({
    resolver: zodResolver(leagueSchema),
    defaultValues: {
      name: "",
      city: "",
      country: "México",
    },
  });

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
      await api.post("/v1/leagues/", {
        name: data.name,
        slug: slugify(data.name) + "-" + Math.floor(Math.random() * 1000), // Append random to ensure uniqueness if needed
        city: data.city,
        country: data.country,
        created_by: user.id,
      });

      Alert.alert("¡Éxito!", "La liga ha sido registrada correctamente.");
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating league:", error);
      Alert.alert(
        "Error de registro",
        error.message || "Ocurrió un problema al registrar la liga."
      );
    }
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
            <Text style={styles.headerTitle}>NUEVA LIGA</Text>
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
              
              <Text style={styles.sectionTitle}>Organiza tu Liga</Text>
              <Text style={styles.sectionSubtitle}>
                Crea una nueva competición y gestiona equipos, calendarios y estadísticas.
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
                title={isSubmitting ? "Registrando..." : "Crear Liga Ahora"}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                style={{ marginTop: 10 }}
                fullWidth
              />
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
  });
