import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormDatePicker } from "@/components/ui/forms/FormDatePicker";
import { FormSelect } from "@/components/ui/forms/FormSelect";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";
import { useTheme } from "@/context/ThemeContext";
import { TournamentSchema, tournamentSchema } from "@/features/tournaments/schemas/tournamentSchema";
import api from "@/services/api";
import { metrics } from "@/services/metrics";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Trophy,
  X,
  Calendar,
  Trash2,
  AlertTriangle,
  Settings,
  ShieldCheck,
  QrCode,
  MessageSquare,
  CreditCard,
  ShoppingBag,
  Award,
  Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
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
    watch,
    formState: { isSubmitting },
  } = useForm<TournamentSchema>({
    resolver: zodResolver(tournamentSchema) as any,
    defaultValues: {
      name: "",
      season_label: "",
      description: "",
      status: "draft",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      format: "11v11",
      gender: "mens",
      registration_open: true,
      champion_determination: "standings",
      standings_tiebreaker: "goal_difference",
      knockout_tiebreaker: "penalty_shootout",
      extra_time_enabled: false,
      two_legged_knockout: false,
      features: {
        inherit_from_league: false,
        discipline_enabled: true,
        payments_enabled: true,
        comms_enabled: true,
        qr_checkin_enabled: true,
        player_market_enabled: false,
        sponsors_enabled: false,
        referee_marketplace_enabled: false,
      },
    },
  });

  const championDetermination = watch("champion_determination");

  useEffect(() => {
    if (visible) {
      if (initialData) {
        reset({
          name: initialData.name,
          season_label: initialData.season_label,
          description: initialData.description || "",
          status: initialData.status,
          start_date: initialData.start_date ? initialData.start_date.split("T")[0] : new Date().toISOString().split("T")[0],
          end_date: initialData.end_date ? initialData.end_date.split("T")[0] : "",
          format: initialData.format || "11v11",
          gender: initialData.gender || "mens",
          registration_open: initialData.registration_open ?? true,
          champion_determination: initialData.champion_determination || "standings",
          standings_tiebreaker: initialData.standings_tiebreaker || "goal_difference",
          knockout_tiebreaker: initialData.knockout_tiebreaker || "penalty_shootout",
          extra_time_enabled: initialData.extra_time_enabled ?? false,
          two_legged_knockout: initialData.two_legged_knockout ?? false,
          max_teams: initialData.max_teams,
          min_age: initialData.min_age,
          max_age: initialData.max_age,
          features: {
            inherit_from_league: initialData.features?.inherit_from_league ?? false,
            discipline_enabled: initialData.features?.discipline_enabled ?? true,
            payments_enabled: initialData.features?.payments_enabled ?? true,
            comms_enabled: initialData.features?.comms_enabled ?? true,
            qr_checkin_enabled: initialData.features?.qr_checkin_enabled ?? true,
            player_market_enabled: initialData.features?.player_market_enabled ?? false,
            sponsors_enabled: initialData.features?.sponsors_enabled ?? false,
            referee_marketplace_enabled: initialData.features?.referee_marketplace_enabled ?? false,
          },
        });
      } else {
        reset({
          name: "",
          season_label: "",
          description: "",
          status: "draft",
          start_date: new Date().toISOString().split("T")[0],
          end_date: "",
          format: "11v11",
          gender: "mens",
          registration_open: true,
          champion_determination: "standings",
          standings_tiebreaker: "goal_difference",
          knockout_tiebreaker: "penalty_shootout",
          extra_time_enabled: false,
          two_legged_knockout: false,
          features: {
            inherit_from_league: false,
            discipline_enabled: true,
            payments_enabled: true,
            comms_enabled: true,
            qr_checkin_enabled: true,
            player_market_enabled: false,
            sponsors_enabled: false,
            referee_marketplace_enabled: false,
          },
        });
      }
    }
  }, [visible, initialData, reset]);

  const onSubmit = async (data: TournamentSchema) => {
    try {
      const payload = {
        ...data,
        league: leagueId,
      };

      if (isEditing && initialData) {
        await api.patch(`/v1/tournaments/${initialData.id}/`, payload);
        Alert.alert("¡Actualizado!", "Torneo actualizado correctamente.");
      } else {
        await api.post("/v1/tournaments/", payload);
        metrics.trackTournamentCreated(data.format || "11v11", data.gender || "mens");
        Alert.alert("¡Éxito!", "Torneo creado correctamente.");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving tournament:", error);
      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.message ||
        "Ocurrió un problema al guardar el torneo.";
      Alert.alert("Error", detail);
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
              if (router.canGoBack()) {
                router.back();
              }
            } catch (error: any) {
              Alert.alert("Error", "No se pudo eliminar el torneo.");
            } finally {
              setIsDeleting(false);
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
                  ? "Modifica los detalles principales y configuraciones de esta temporada."
                  : "Configura la nueva temporada o edición con sus reglas y módulos."}
              </Text>

              {/* SECCIÓN 1: DATOS GENERALES */}
              <View style={styles.cardSection}>
                <View style={styles.cardHeader}>
                  <Trophy size={16} color={theme.primary} />
                  <Text style={styles.cardHeaderText}>DATOS DEL TORNEO</Text>
                </View>

                <FormInput
                  control={control}
                  name="name"
                  label="NOMBRE DEL TORNEO"
                  placeholder="Ej. Torneo Apertura 2026"
                  required
                />

                <FormInput
                  control={control}
                  name="season_label"
                  label="ETIQUETA DE TEMPORADA"
                  placeholder="Ej. 2026-I"
                  required
                />

                <FormInput
                  control={control}
                  name="description"
                  label="DESCRIPCIÓN / REGLAMENTO BREVE"
                  placeholder="Notas, premios, reglamento general..."
                  multiline
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

                <View style={styles.row}>
                  <FormSelect
                    control={control}
                    name="format"
                    label="FORMATO"
                    options={[
                      { label: "Fútbol 11", value: "11v11" },
                      { label: "Fútbol 8", value: "8v8" },
                      { label: "Fútbol 7", value: "7v7" },
                      { label: "Fútbol 5", value: "5v5" },
                    ]}
                    containerStyle={{ flex: 1 }}
                  />
                  <View style={{ width: 15 }} />
                  <FormSelect
                    control={control}
                    name="gender"
                    label="GÉNERO"
                    options={[
                      { label: "Masculino", value: "mens" },
                      { label: "Femenino", value: "womens" },
                      { label: "Mixto", value: "mixed" },
                    ]}
                    containerStyle={{ flex: 1 }}
                  />
                </View>

                <View style={styles.row}>
                  <FormInput
                    control={control}
                    name="max_teams"
                    label="MAX. EQUIPOS"
                    placeholder="Ej. 16"
                    keyboardType="numeric"
                    containerStyle={{ flex: 1 }}
                  />
                  <View style={{ width: 15 }} />
                  <FormInput
                    control={control}
                    name="min_age"
                    label="EDAD MÍN."
                    placeholder="Ej. 16"
                    keyboardType="numeric"
                    containerStyle={{ flex: 1 }}
                  />
                  <View style={{ width: 15 }} />
                  <FormInput
                    control={control}
                    name="max_age"
                    label="EDAD MÁX."
                    placeholder="Ej. 40"
                    keyboardType="numeric"
                    containerStyle={{ flex: 1 }}
                  />
                </View>
              </View>

              {/* SECCIÓN 2: CONFIGURACIONES DE COMPETICIÓN */}
              <View style={styles.cardSection}>
                <View style={styles.cardHeader}>
                  <Settings size={16} color={theme.primary} />
                  <Text style={styles.cardHeaderText}>REGLAS Y DESEMPATES</Text>
                </View>

                <View style={styles.row}>
                  <FormSelect
                    control={control}
                    name="champion_determination"
                    label="DEFINICIÓN DE CAMPEÓN"
                    options={[
                      { label: "Por Puntos en Tabla", value: "standings" },
                      { label: "Playoffs / Liguilla", value: "playoffs" },
                    ]}
                    containerStyle={{ flex: 1 }}
                  />
                  <View style={{ width: 15 }} />
                  <FormSelect
                    control={control}
                    name="standings_tiebreaker"
                    label="DESEMPATE EN TABLA"
                    options={[
                      { label: "Dif. de Goles", value: "goal_difference" },
                      { label: "Duelo Directo", value: "head_to_head" },
                    ]}
                    containerStyle={{ flex: 1 }}
                  />
                </View>

                {championDetermination === "playoffs" && (
                  <>
                    <FormSelect
                      control={control}
                      name="knockout_tiebreaker"
                      label="DESEMPATE EN LIGUILLA"
                      options={[
                        { label: "Tanda de Penales", value: "penalty_shootout" },
                        { label: "Mejor Posición en Tabla", value: "standings" },
                        { label: "Goles de Visitante", value: "away_goals" },
                      ]}
                    />

                    {/* Toggle Prórroga / Tiempo Extra */}
                    <Controller
                      control={control}
                      name="extra_time_enabled"
                      render={({ field: { value, onChange } }) => (
                        <View style={styles.toggleRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.toggleTitle}>Tiempos Extras / Prórroga</Text>
                            <Text style={styles.toggleDesc}>
                              Jugar tiempo suplementario antes de los penales en playoffs
                            </Text>
                          </View>
                          <Switch
                            value={!!value}
                            onValueChange={onChange}
                            trackColor={{ false: isDark ? "#333" : "#E2E8F0", true: theme.primary }}
                            thumbColor={value ? "#001A2C" : "#94A3B8"}
                          />
                        </View>
                      )}
                    />

                    {/* Toggle Ida y Vuelta */}
                    <Controller
                      control={control}
                      name="two_legged_knockout"
                      render={({ field: { value, onChange } }) => (
                        <View style={styles.toggleRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.toggleTitle}>Eliminatorias Ida y Vuelta</Text>
                            <Text style={styles.toggleDesc}>
                              Series de liguilla disputadas a 2 partidos
                            </Text>
                          </View>
                          <Switch
                            value={!!value}
                            onValueChange={onChange}
                            trackColor={{ false: isDark ? "#333" : "#E2E8F0", true: theme.primary }}
                            thumbColor={value ? "#001A2C" : "#94A3B8"}
                          />
                        </View>
                      )}
                    />
                  </>
                )}

                {/* Toggle Convocatoria / Inscripciones abiertas */}
                <Controller
                  control={control}
                  name="registration_open"
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.toggleRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>Inscripciones Abiertas</Text>
                        <Text style={styles.toggleDesc}>
                          Permite que los capitanes inscriban sus equipos a este torneo
                        </Text>
                      </View>
                      <Switch
                        value={!!value}
                        onValueChange={onChange}
                        trackColor={{ false: isDark ? "#333" : "#E2E8F0", true: theme.primary }}
                        thumbColor={value ? "#001A2C" : "#94A3B8"}
                      />
                    </View>
                  )}
                />

                {/* Estado inicial */}
                <FormSelect
                  control={control}
                  name="status"
                  label="ESTADO DEL TORNEO"
                  options={[
                    { label: "Borrador (Oculto al público)", value: "draft" },
                    { label: "Activo (Visible)", value: "active" },
                  ]}
                />
              </View>

              {/* SECCIÓN 3: MÓDULOS Y SERVICIOS ACTIVOS */}
              <View style={styles.cardSection}>
                <View style={styles.cardHeader}>
                  <ShieldCheck size={16} color={theme.primary} />
                  <Text style={styles.cardHeaderText}>MÓDULOS Y SERVICIOS</Text>
                </View>

                {/* QR Checkin */}
                <Controller
                  control={control}
                  name="features.qr_checkin_enabled"
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.toggleRow}>
                      <View style={styles.serviceIconWrap}>
                        <QrCode size={18} color={theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>Check-in con QR</Text>
                        <Text style={styles.toggleDesc}>Acreditación digital de jugadores antes de cada partido</Text>
                      </View>
                      <Switch
                        value={!!value}
                        onValueChange={onChange}
                        trackColor={{ false: isDark ? "#333" : "#E2E8F0", true: theme.primary }}
                        thumbColor={value ? "#001A2C" : "#94A3B8"}
                      />
                    </View>
                  )}
                />

                {/* Disciplina */}
                <Controller
                  control={control}
                  name="features.discipline_enabled"
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.toggleRow}>
                      <View style={styles.serviceIconWrap}>
                        <ShieldCheck size={18} color={theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>Control Disciplinario</Text>
                        <Text style={styles.toggleDesc}>Registro de tarjetas, suspensiones y sanciones</Text>
                      </View>
                      <Switch
                        value={!!value}
                        onValueChange={onChange}
                        trackColor={{ false: isDark ? "#333" : "#E2E8F0", true: theme.primary }}
                        thumbColor={value ? "#001A2C" : "#94A3B8"}
                      />
                    </View>
                  )}
                />

                {/* Pagos */}
                <Controller
                  control={control}
                  name="features.payments_enabled"
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.toggleRow}>
                      <View style={styles.serviceIconWrap}>
                        <CreditCard size={18} color={theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>Pagos en Línea</Text>
                        <Text style={styles.toggleDesc}>Cobro de inscripciones y cuotas de arbitraje</Text>
                      </View>
                      <Switch
                        value={!!value}
                        onValueChange={onChange}
                        trackColor={{ false: isDark ? "#333" : "#E2E8F0", true: theme.primary }}
                        thumbColor={value ? "#001A2C" : "#94A3B8"}
                      />
                    </View>
                  )}
                />

                {/* Comunicados / Chat */}
                <Controller
                  control={control}
                  name="features.comms_enabled"
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.toggleRow}>
                      <View style={styles.serviceIconWrap}>
                        <MessageSquare size={18} color={theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>Tablón de Avisos y Chat</Text>
                        <Text style={styles.toggleDesc}>Canal de comunicación entre liga y delegados</Text>
                      </View>
                      <Switch
                        value={!!value}
                        onValueChange={onChange}
                        trackColor={{ false: isDark ? "#333" : "#E2E8F0", true: theme.primary }}
                        thumbColor={value ? "#001A2C" : "#94A3B8"}
                      />
                    </View>
                  )}
                />

                {/* Bolsa de Árbitros */}
                <Controller
                  control={control}
                  name="features.referee_marketplace_enabled"
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.toggleRow}>
                      <View style={styles.serviceIconWrap}>
                        <Users size={18} color={theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>Bolsa de Árbitros</Text>
                        <Text style={styles.toggleDesc}>Asignación y contratación de colegiados certificados</Text>
                      </View>
                      <Switch
                        value={!!value}
                        onValueChange={onChange}
                        trackColor={{ false: isDark ? "#333" : "#E2E8F0", true: theme.primary }}
                        thumbColor={value ? "#001A2C" : "#94A3B8"}
                      />
                    </View>
                  )}
                />

                {/* Mercado de Jugadores */}
                <Controller
                  control={control}
                  name="features.player_market_enabled"
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.toggleRow}>
                      <View style={styles.serviceIconWrap}>
                        <ShoppingBag size={18} color={theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>Mercado de Jugadores Libres</Text>
                        <Text style={styles.toggleDesc}>Permite reclutar jugadores buscando equipo</Text>
                      </View>
                      <Switch
                        value={!!value}
                        onValueChange={onChange}
                        trackColor={{ false: isDark ? "#333" : "#E2E8F0", true: theme.primary }}
                        thumbColor={value ? "#001A2C" : "#94A3B8"}
                      />
                    </View>
                  )}
                />

                {/* Patrocinadores */}
                <Controller
                  control={control}
                  name="features.sponsors_enabled"
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.toggleRow}>
                      <View style={styles.serviceIconWrap}>
                        <Award size={18} color={theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.toggleTitle}>Patrocinadores y Banners</Text>
                        <Text style={styles.toggleDesc}>Espacios publicitarios dedicados para este torneo</Text>
                      </View>
                      <Switch
                        value={!!value}
                        onValueChange={onChange}
                        trackColor={{ false: isDark ? "#333" : "#E2E8F0", true: theme.primary }}
                        thumbColor={value ? "#001A2C" : "#94A3B8"}
                      />
                    </View>
                  )}
                />
              </View>

              <View style={styles.infoBox}>
                <Calendar size={16} color={theme.primary} />
                <Text style={styles.infoText}>
                  Los torneos finalizados podrán ser clonados hacia una nueva temporada manteniendo configuraciones y equipos inscritos.
                </Text>
              </View>

              <PrimaryButton
                title={isSubmitting ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Torneo"}
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
      paddingHorizontal: 20,
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
      backgroundColor: theme.primary + "15",
      justifyContent: "center",
      alignItems: "center",
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
      marginBottom: 20,
    },
    cardSection: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      paddingBottom: 10,
    },
    cardHeaderText: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.primary,
      letterSpacing: 1.5,
    },
    row: {
      flexDirection: "row",
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
      gap: 12,
    },
    serviceIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.primary + "15",
      justifyContent: "center",
      alignItems: "center",
    },
    toggleTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 2,
    },
    toggleDesc: {
      fontSize: 11,
      color: theme.textSecondary,
      lineHeight: 15,
    },
    infoBox: {
      flexDirection: "row",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      padding: 15,
      borderRadius: 12,
      marginVertical: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    infoText: {
      flex: 1,
      fontSize: 11,
      color: theme.textSecondary,
      lineHeight: 16,
      fontWeight: "600",
    },
    dangerZone: {
      marginTop: 30,
      padding: 20,
      borderRadius: 20,
      backgroundColor: "rgba(255, 68, 68, 0.05)",
      borderWidth: 1,
      borderColor: "rgba(255, 68, 68, 0.1)",
    },
    dangerHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    dangerTitle: {
      fontSize: 12,
      fontWeight: "900",
      color: "#FF4444",
      letterSpacing: 1,
    },
    dangerSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 18,
      marginBottom: 20,
    },
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#FF4444",
      gap: 10,
    },
    deleteButtonText: {
      color: "#FF4444",
      fontSize: 13,
      fontWeight: "800",
    },
  });
