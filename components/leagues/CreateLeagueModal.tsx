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
import { X, Trophy, MapPin, Globe, Trash2, Camera, Image as ImageIcon, Layout } from "lucide-react-native";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { leagueSchema, LeagueSchema } from "@/features/leagues/schemas/leagueSchema";
import { useTheme } from "@/context/ThemeContext";
import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormSelect } from "@/components/ui/forms/FormSelect";
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

const COUNTRIES = [
  { label: "México", value: "México" },
  { label: "Estados Unidos", value: "Estados Unidos" },
  { label: "España", value: "España" },
  { label: "Colombia", value: "Colombia" },
  { label: "Argentina", value: "Argentina" },
  { label: "Chile", value: "Chile" },
  { label: "Costa Rica", value: "Costa Rica" },
  { label: "Otro", value: "Otro" },
];

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
      logo: initialData?.logo || "",
      background_image: initialData?.background_image || "",
    },
  });

  const logo = useWatch({ control, name: "logo" });
  const backgroundImage = useWatch({ control, name: "background_image" });

  const pickImage = async (field: "logo" | "background_image") => {
    const isLogo = field === "logo";
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: isLogo ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      reset({
        ...control._formValues,
        [field]: result.assets[0].uri
      });
      // A safer way to update specific field in react-hook-form
      // but setValue is more standard:
      // setValue(field, result.assets[0].uri);
    }
  };

  // Helper to update form values manually if needed
  const updateField = (field: any, value: string) => {
    reset({ ...control._formValues, [field]: value });
  };

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
      const formData = new FormData();
      const slug = isEditing ? initialData.slug : slugify(data.name) + "-" + Math.floor(Math.random() * 1000);
      
      formData.append("name", data.name);
      formData.append("slug", slug);
      formData.append("city", data.city);
      formData.append("country", data.country);
      formData.append("created_by", user.id);

      // Handle Logo
      if (data.logo && data.logo.startsWith("file://")) {
        const uri = data.logo;
        const name = uri.split('/').pop() || 'logo.jpg';
        const type = `image/${name.split('.').pop() || 'jpg'}`;
        formData.append("logo", { uri, name, type } as any);
      }

      // Handle Background
      if (data.background_image && data.background_image.startsWith("file://")) {
        const uri = data.background_image;
        const name = uri.split('/').pop() || 'background.jpg';
        const type = `image/${name.split('.').pop() || 'jpg'}`;
        formData.append("background_image", { uri, name, type } as any);
      }

      if (isEditing) {
        await api.patch(`/v1/leagues/${initialData.id}/`, formData);
        Alert.alert("¡Éxito!", "La liga ha sido actualizada correctamente.");
      } else {
        await api.post("/v1/leagues/", formData);
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
              {/* BRANDING SECTION */}
              <View style={styles.brandingContainer}>
                {/* Background Image Picker */}
                <TouchableOpacity 
                  style={styles.backgroundPicker} 
                  onPress={() => pickImage("background_image")}
                  activeOpacity={0.8}
                >
                  {backgroundImage ? (
                    <Image source={{ uri: backgroundImage }} style={styles.backgroundImage} />
                  ) : (
                    <View style={styles.backgroundPlaceholder}>
                      <Layout size={24} color={theme.textSecondary} />
                      <Text style={styles.placeholderText}>AÑADIR PORTADA</Text>
                    </View>
                  )}
                  <View style={styles.overlay} />
                </TouchableOpacity>

                {/* Logo Picker (Overlapping) */}
                <TouchableOpacity 
                  style={styles.logoPicker} 
                  onPress={() => pickImage("logo")}
                  activeOpacity={0.9}
                >
                  {logo ? (
                    <Image source={{ uri: logo }} style={styles.logoImage} />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <Trophy size={30} color={theme.primary} />
                    </View>
                  )}
                  <View style={styles.cameraBadge}>
                    <Camera size={14} color="#FFF" />
                  </View>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.sectionTitle}>
                {isEditing ? "Actualizar Liga" : "Organiza tu Liga"}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {isEditing 
                  ? "Modifica los detalles visuales y básicos de tu competición."
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
                <FormSelect
                  control={control}
                  name="country"
                  label="PAÍS"
                  options={COUNTRIES}
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
    brandingContainer: {
      width: '100%',
      height: 180,
      marginBottom: 60,
      position: 'relative',
    },
    backgroundPicker: {
      width: '100%',
      height: 140,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
    },
    backgroundPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    placeholderText: {
      fontSize: 10,
      fontWeight: '900',
      color: theme.textSecondary,
      letterSpacing: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    logoPicker: {
      position: 'absolute',
      bottom: 0,
      alignSelf: 'center',
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: theme.surface,
      borderWidth: 4,
      borderColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    logoImage: {
      width: '100%',
      height: '100%',
      borderRadius: 41,
    },
    logoPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.primary,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.background,
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
