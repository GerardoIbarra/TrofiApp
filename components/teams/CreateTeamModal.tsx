import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { FormInput } from "@/components/ui/forms/FormInput";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";
import { useTheme } from "@/context/ThemeContext";
import { TeamSchema, teamSchema } from "@/features/teams/schemas/teamSchema";
import api from "@/services/api";
import { metrics } from "@/services/metrics";
import { useAuthStore } from "@/features/auth/store/authStore";
import { League, LeaguesResponse } from "@/features/leagues/types/league";
import { Team } from "@/features/teams/types/team";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Trophy, X, Trash2, Shield } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Image } from "expo-image";
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
import { useToast } from "@/context/ToastContext";
import { pickAndOptimizeImage } from "@/services/imageOptimizer";

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
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();

  const isEditing = !!initialData;

  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(false);
  const [logoUri, setLogoUri] = useState<string | null>(initialData?.logo || null);
  const [isOptimizingLogo, setIsOptimizingLogo] = useState(false);

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
  const isNewLogo = Boolean(
    logoUri && (logoUri.startsWith("file:") || logoUri.startsWith("content:"))
  );

  useEffect(() => {
    if (visible) {
      fetchLeagues();
      setLogoUri(initialData?.logo || null);
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

  const handlePickLogo = async () => {
    setIsOptimizingLogo(true);
    try {
      const result = await pickAndOptimizeImage({
        aspect: [1, 1],
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.78, // JPEG, 0.75 - 0.80 range, <= 250 KB
      });

      if (result) {
        setLogoUri(result.uri);
      }
    } catch (err: any) {
      if (err?.message !== "MEDIA_LIBRARY_PERMISSION_DENIED") {
        console.error("Error picking team logo:", err);
        showToast({
          type: "error",
          title: "Error",
          message: "No se pudo optimizar el escudo del equipo.",
        });
      }
    } finally {
      setIsOptimizingLogo(false);
    }
  };

  const onSubmit = async (data: TeamSchema) => {
    if (!user?.id) {
      showToast({ type: "error", title: "Error", message: "No se pudo identificar al usuario." });
      return;
    }

    try {
      const isNewLogo =
        logoUri &&
        (logoUri.startsWith("file:") || logoUri.startsWith("content:"));

      let payload: any;
      if (isNewLogo) {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("city", data.city);
        formData.append("league", data.league);
        formData.append("owner", user.id);

        const uri = logoUri;
        const name = uri.split("/").pop() || "team_logo.jpg";
        const match = /\.(\w+)$/.exec(name);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("logo", {
          uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
          name,
          type,
        } as any);
        payload = formData;
      } else {
        payload = {
          name: data.name,
          city: data.city,
          league: data.league,
          owner: user.id,
        };
      }

      if (isEditing && initialData) {
        await api.patch(`/v1/teams/${initialData.id}/`, payload);
        showToast({ type: "success", title: t('common.save'), message: t('teams_form.success_update') });
      } else {
        await api.post("/v1/teams/", payload);
        metrics.trackTeamCreated(data.league);
        showToast({ type: "success", title: t('common.save'), message: t('teams_form.success_create') });
      }

      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving team:", error);
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Ocurrió un problema al guardar el equipo.",
      });
    }
  };

  const handleDelete = () => {
    if (!initialData?.id) return;

    Alert.alert(
      t('teams_form.delete_team'),
      t('teams_form.delete_confirm_msg'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('teams_form.delete_team'),
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/v1/teams/${initialData.id}/`);
              onClose();
              router.push("/(tabs)/teams" as any);
              onSuccess();
            } catch (error: any) {
              console.error("Error deleting team:", error);
              showToast({ type: "error", title: "Error", message: "No se pudo eliminar el equipo." });
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
              {isEditing ? t('teams_form.edit_team') : t('teams_form.new_team')}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>
                {isEditing ? t('teams_form.team_settings') : t('teams_form.team_details')}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {isEditing 
                  ? t('teams_form.team_subtitle_edit')
                  : t('teams_form.team_subtitle_new')
                }
              </Text>

              {/* Escudo del equipo (optimizado con expo-image-manipulator) */}
              <View style={styles.logoPickerSection}>
                <TouchableOpacity
                  style={styles.logoCircle}
                  onPress={handlePickLogo}
                  disabled={isOptimizingLogo || isSubmitting}
                  activeOpacity={0.8}
                >
                  {logoUri ? (
                    <Image
                      source={{ uri: logoUri }}
                      style={styles.logoImage}
                      contentFit="cover"
                    />
                  ) : (
                    <Shield size={32} color={theme.textSecondary} />
                  )}
                  {isOptimizingLogo && (
                    <View style={styles.logoOverlay}>
                      <ActivityIndicator size="small" color="#001A2C" />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.logoInfo}>
                  <Text style={styles.logoTitle}>Escudo del equipo</Text>
                  <Text style={styles.logoSubtext}>
                    {isOptimizingLogo
                      ? "Optimizando imagen (máx 800px, <250 KB)..."
                      : "Foto optimizada para datos móviles"}
                  </Text>
                  <TouchableOpacity
                    onPress={handlePickLogo}
                    disabled={isOptimizingLogo || isSubmitting}
                    style={styles.pickLogoBtn}
                  >
                    <Text style={styles.pickLogoBtnText}>
                      {logoUri ? "Cambiar escudo" : "Subir escudo"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {isSubmitting && isNewLogo && (
                <View style={styles.uploadProgressBox}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={styles.uploadProgressText}>
                    Subiendo datos y escudo optimizado...
                  </Text>
                </View>
              )}

              <FormInput
                control={control}
                name="name"
                label={t('teams_form.team_name_label')}
                placeholder={t('teams_form.team_name_placeholder')}
                required
              />

              <FormInput
                control={control}
                name="city"
                label={t('teams_form.city_label')}
                placeholder={t('teams_form.city_placeholder')}
                required
              />

              {/* League Selector */}
              <View style={styles.leagueSelectorContainer}>
                <Text style={styles.selectorLabel}>{t('teams_form.select_league')}</Text>
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
                          {t('teams_form.no_leagues_available')}
                        </Text>
                        <TouchableOpacity onPress={fetchLeagues}>
                          <Text style={styles.retryText}>{t('teams_form.retry')}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <PrimaryButton
                title={isSubmitting ? t('teams_form.saving') : (isEditing ? t('teams_form.save_changes') : t('teams_form.create_team'))}
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
                  <Text style={styles.deleteButtonText}>{t('teams_form.delete_team')}</Text>
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
    logoPickerSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      padding: 16,
      borderRadius: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    },
    logoCircle: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      borderWidth: 2,
      borderColor: theme.primary,
    },
    logoImage: {
      width: "100%",
      height: "100%",
    },
    logoOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(0, 240, 255, 0.75)",
      justifyContent: "center",
      alignItems: "center",
    },
    logoInfo: {
      flex: 1,
    },
    logoTitle: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 2,
    },
    logoSubtext: {
      fontSize: 11,
      color: theme.textSecondary,
      marginBottom: 8,
      lineHeight: 15,
    },
    pickLogoBtn: {
      alignSelf: "flex-start",
      backgroundColor: theme.primary + "18",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    pickLogoBtnText: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.primary,
    },
    uploadProgressBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.primary + "15",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.primary + "30",
    },
    uploadProgressText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.primary,
    },
  });
