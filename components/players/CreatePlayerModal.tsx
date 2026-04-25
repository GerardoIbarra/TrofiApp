import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";
import { FormDatePicker } from "@/components/ui/forms/FormDatePicker";
import { FormInput } from "@/components/ui/forms/FormInput";
import { useTheme } from "@/context/ThemeContext";
import {
  PlayerSchema,
  playerSchema,
} from "@/features/players/schemas/playerSchema";
import api from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  Activity,
  Camera,
  Dumbbell,
  Image as ImageIcon,
  Shield,
  Swords,
  Target,
  X,
  Zap
} from "lucide-react-native";
import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
} from "react-native";

interface CreatePlayerModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const POSITIONS = [
  { label: "POR", value: "POR", color: "#FFB000" },
  { label: "DEF", value: "DEF", color: "#4ADE80" },
  { label: "MED", value: "MED", color: "#60A5FA" },
  { label: "DEL", value: "DEL", color: "#F87171" },
];

const STAT_ICONS = [
  { name: "pace", label: "RIT", icon: Zap },
  { name: "shooting", label: "TIR", icon: Target },
  { name: "passing", label: "PAS", icon: Activity },
  { name: "dribbling", label: "REG", icon: Swords },
  { name: "defense", label: "DEF", icon: Shield },
  { name: "physical", label: "FIS", icon: Dumbbell },
];

export function CreatePlayerModal({
  visible,
  onClose,
  onSuccess,
}: CreatePlayerModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<PlayerSchema>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      full_name: "",
      nickname: "",
      date_of_birth: "",
      position: "MED",
      overall_rating: 50,
      pace: 50,
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defense: 50,
      physical: 50,
      photo: "",
    },
  });

  const photo = useWatch({ control, name: "photo" });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setValue("photo", result.assets[0].uri, { shouldValidate: true });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos permiso para usar la cámara.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setValue("photo", result.assets[0].uri, { shouldValidate: true });
    }
  };

  const statsValues = useWatch({
    control,
    name: ["pace", "shooting", "passing", "dribbling", "defense", "physical"],
  });

  useEffect(() => {
    // Calculamos el promedio para el Overall Rating automáticamente
    const avg = Math.round(
      statsValues.reduce((a, b) => (a || 0) + (b || 0), 0) / 6,
    );
    setValue("overall_rating", avg || 50);
  }, [statsValues]);

  useEffect(() => {
    if (visible) {
      reset();
    }
  }, [visible, reset]);

  const onSubmit = async (data: PlayerSchema) => {
    console.log("Submitting Player Data:", data);
    try {
      const formData = new FormData();

      // Append all fields to FormData robustly
      Object.keys(data).forEach((key) => {
        const value = (data as any)[key];

        if (key === "photo" && value) {
          const uri = value;
          const name = uri.split("/").pop() || "photo.jpg";
          const match = /\.(\w+)$/.exec(name);
          const type = match ? `image/${match[1]}` : `image/jpg`;

          formData.append("photo", {
            uri,
            name,
            type,
          } as any);
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      await api.post("/v1/players/", formData);
      Alert.alert("¡Fichaje Completado!", "El jugador ha sido registrado.");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating player:", error);
      Alert.alert(
        "Error",
        error.message || "Ocurrió un problema al registrar al jugador.",
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
            <Text style={styles.headerTitle}>NUEVO JUGADOR</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formSection}>
              {/* SELECTOR DE FOTO */}
              <View style={styles.photoSection}>
                <TouchableOpacity
                  style={styles.photoContainer}
                  onPress={pickImage}
                  activeOpacity={0.8}
                >
                  {photo ? (
                    <Image
                      source={{ uri: photo }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <ImageIcon size={32} color={theme.textSecondary} />
                      <Text style={styles.photoPlaceholderText}>
                        AÑADIR FOTO
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={takePhoto}
                  >
                    <Camera size={18} color="#FFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
                <View style={styles.heroTextContent}>
                  <Text style={styles.sectionTitle}>Ficha Técnica</Text>
                  <Text style={styles.sectionSubtitle}>
                    La foto es obligatoria para el carnet oficial.
                  </Text>
                </View>
              </View>

              <View style={styles.heroBox}>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>
                    {statsValues.reduce((a, b) => (a || 0) + (b || 0), 0)
                      ? Math.round(
                          statsValues.reduce((a, b) => (a || 0) + (b || 0), 0) /
                            6,
                        )
                      : 50}
                  </Text>
                  <Text style={styles.ratingLabel}>OVR</Text>
                </View>
                <View style={styles.heroTextContent}>
                  <Text style={styles.heroTitle}>Resumen de Stats</Text>
                  <Text style={styles.heroSubtitle}>
                    El rating se calcula automáticamente.
                  </Text>
                </View>
              </View>

              {/* DATOS BÁSICOS */}
              <FormInput
                control={control}
                name="full_name"
                label="NOMBRE COMPLETO"
                placeholder="Nombre y Apellido"
                required
              />

              <FormInput
                control={control}
                name="nickname"
                label="APODO / DORSAL"
                placeholder="Ej. 'La Pulga' o 'Messi'"
                required
              />

              <View style={styles.row}>
                <View style={{ flex: 1.5 }}>
                  <FormDatePicker
                    control={control}
                    name="date_of_birth"
                    label="FECHA NAC."
                    required
                  />
                </View>
                <View style={{ width: 15 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>POSICIÓN</Text>
                  <View style={styles.positionContainer}>
                    {POSITIONS.map((pos) => {
                      const isSelected =
                        useWatch({ control, name: "position" }) === pos.value;
                      return (
                        <TouchableOpacity
                          key={pos.value}
                          onPress={() => setValue("position", pos.value as any)}
                          style={[
                            styles.posChip,
                            isSelected && {
                              backgroundColor: pos.color,
                              borderColor: pos.color,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.posChipText,
                              isSelected && { color: "#FFF" },
                            ]}
                          >
                            {pos.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* STATS FIFA */}
              <Text style={styles.statsHeader}>ATRIBUTOS TÉCNICOS (0-99)</Text>
              <View style={styles.statsGrid}>
                {STAT_ICONS.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <View key={stat.name} style={styles.statBox}>
                      <View style={styles.statIconHeader}>
                        <Icon size={14} color={theme.primary} />
                        <Text style={styles.statLabel}>{stat.label}</Text>
                      </View>
                      <FormInput
                        control={control}
                        name={stat.name as any}
                        label=""
                        placeholder="50"
                        keyboardType="numeric"
                        containerStyle={{ marginBottom: 0 }}
                        style={styles.statInput}
                      />
                    </View>
                  );
                })}
              </View>

              <PrimaryButton
                title={isSubmitting ? "Registrando..." : "Crear Jugador"}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                style={{ marginTop: 20 }}
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
    heroBox: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 30,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      padding: 20,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    ratingBadge: {
      width: 60,
      height: 60,
      borderRadius: 15,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 20,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    ratingText: {
      fontSize: 24,
      fontWeight: "900",
      color: "#001A2C",
    },
    ratingLabel: {
      fontSize: 8,
      fontWeight: "900",
      color: "#001A2C",
      marginTop: -4,
    },
    heroTextContent: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.text,
    },
    heroTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.text,
    },
    heroSubtitle: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    sectionSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 16,
      marginTop: 4,
    },
    photoSection: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      gap: 20,
    },
    photoContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.primary + "40",
      borderStyle: "dashed",
      position: "relative",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      borderRadius: 50,
    },
    photoPlaceholder: {
      alignItems: "center",
      gap: 5,
    },
    photoPlaceholderText: {
      fontSize: 8,
      fontWeight: "900",
      color: theme.textSecondary,
    },
    cameraButton: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: theme.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: theme.background,
    },
    row: {
      flexDirection: "row",
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.textSecondary,
      marginBottom: 8,
      letterSpacing: 1,
    },
    positionContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    posChip: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "transparent",
    },
    posChipText: {
      fontSize: 10,
      fontWeight: "900",
      color: theme.textSecondary,
    },
    statsHeader: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.primary,
      letterSpacing: 1.5,
      marginTop: 30,
      marginBottom: 15,
      textAlign: "center",
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      justifyContent: "space-between",
    },
    statBox: {
      width: "30%",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)",
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      alignItems: "center",
    },
    statIconHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 9,
      fontWeight: "900",
      color: theme.textSecondary,
    },
    statInput: {
      textAlign: "center",
      paddingHorizontal: 0,
      fontSize: 18,
      fontWeight: "900",
      height: 40,
    },
  });
