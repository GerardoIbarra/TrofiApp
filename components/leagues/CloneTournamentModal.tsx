import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormDatePicker } from "@/components/ui/forms/FormDatePicker";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";
import { useTheme } from "@/context/ThemeContext";
import { useCloneTournament } from "@/features/tournaments/services/tournamentApi";
import { Copy, X, Check, Info } from "lucide-react-native";
import React from "react";
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
} from "react-native";

interface CloneTournamentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newTournament?: any) => void;
  tournamentId: string;
  tournamentName?: string;
  leagueId: string;
}

type CloneFormValues = {
  name: string;
  season_label: string;
  start_date: string;
  end_date: string;
};

export function CloneTournamentModal({
  visible,
  onClose,
  onSuccess,
  tournamentId,
  tournamentName,
  leagueId,
}: CloneTournamentModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const cloneMutation = useCloneTournament();

  const { control, handleSubmit, reset } = useForm<CloneFormValues>({
    defaultValues: {
      name: "",
      season_label: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    },
  });

  const onSubmit = (data: CloneFormValues) => {
    const formatIsoDate = (dateStr: string, isEnd = false) => {
      if (!dateStr) return "";
      if (dateStr.includes("T")) return dateStr;
      return `${dateStr}T${isEnd ? "23:59:59Z" : "00:00:00Z"}`;
    };

    cloneMutation.mutate(
      {
        id: tournamentId,
        leagueId,
        data: {
          name: data.name?.trim() ? data.name.trim() : undefined,
          season_label: data.season_label.trim(),
          start_date: formatIsoDate(data.start_date, false),
          end_date: formatIsoDate(data.end_date, true),
        },
      },
      {
        onSuccess: (response: any) => {
          const teamsCloned = response?.teams_cloned ?? 0;
          Alert.alert(
            "¡Temporada Clonada!",
            `Torneo clonado exitosamente.${
              teamsCloned > 0
                ? ` Se transfirieron ${teamsCloned} equipo${teamsCloned === 1 ? "" : "s"} con su capitán.`
                : " Sin equipos transferidos."
            }\n\nLos planteles inician vacíos para nuevas altas y el nuevo torneo arranca en estado pendiente de aprobación.`,
            [
              {
                text: "Aceptar",
                onPress: () => {
                  reset();
                  onSuccess(response);
                  onClose();
                },
              },
            ]
          );
        },
        onError: (error: any) => {
          const detail =
            error?.data?.detail ||
            error?.data?.error ||
            error?.data?.season_label?.[0] ||
            (typeof error?.data === "object" && error?.data !== null
              ? Object.entries(error.data)
                  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                  .join("\n")
              : null) ||
            error?.message ||
            "No se pudo clonar la temporada.";
          Alert.alert("Error", detail);
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
            <Text style={styles.headerTitle}>NUEVA TEMPORADA</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.heroIconBox}>
              <Copy size={40} color={theme.primary} />
            </View>

            <Text style={styles.sectionTitle}>Clonar Torneo</Text>
            <Text style={styles.sectionSubtitle}>
              Crea una nueva temporada manteniendo la configuración y los equipos inscritos, sin historial de partidos ni planteles.
            </Text>

            {tournamentName && (
              <View style={styles.sourceBox}>
                <Text style={styles.sourceLabel}>ORIGEN</Text>
                <Text style={styles.sourceName}>{tournamentName}</Text>
              </View>
            )}

            <FormInput
              control={control}
              name="season_label"
              label="ETIQUETA DE TEMPORADA"
              placeholder="Ej. 2027"
              rules={{
                required: "La etiqueta de temporada es requerida (ej. 2027)",
                minLength: { value: 2, message: "Debe tener al menos 2 caracteres" },
              }}
              required
            />

            <FormInput
              control={control}
              name="name"
              label="NUEVO NOMBRE (OPCIONAL)"
              placeholder={tournamentName ? `Por defecto: ${tournamentName}` : "Mismo nombre del torneo"}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormDatePicker
                  control={control}
                  name="start_date"
                  label="FECHA INICIO"
                  rules={{ required: "La fecha de inicio es requerida" }}
                  required
                />
              </View>
              <View style={{ width: 15 }} />
              <View style={{ flex: 1 }}>
                <FormDatePicker
                  control={control}
                  name="end_date"
                  label="FECHA FIN"
                  rules={{ required: "La fecha de fin es requerida" }}
                  required
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Detalles de la clonación</Text>
              <View style={styles.infoItem}>
                <Check size={14} color="#10B981" style={{ marginTop: 2 }} />
                <Text style={styles.infoText}>
                  Configuración completa: formato, género, desempates, prórrogas, edades, features y programación.
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Check size={14} color="#10B981" style={{ marginTop: 2 }} />
                <Text style={styles.infoText}>
                  Equipos inscritos transferidos junto con sus capitanes asignados.
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Info size={14} color="#F59E0B" style={{ marginTop: 2 }} />
                <Text style={styles.infoText}>
                  Los planteles inician vacíos para nuevos fichajes mediante solicitudes de unión.
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Info size={14} color="#F59E0B" style={{ marginTop: 2 }} />
                <Text style={styles.infoText}>
                  Sin partidos, brackets ni tabla histórica. Aprobación pendiente e inscripciones cerradas por defecto.
                </Text>
              </View>
            </View>

            <PrimaryButton
              title={cloneMutation.isPending ? "Clonando..." : "Clonar Temporada"}
              onPress={handleSubmit(onSubmit)}
              disabled={cloneMutation.isPending}
              style={{ marginTop: 20 }}
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
    headerTitle: { fontSize: 14, fontWeight: "900", color: theme.primary, letterSpacing: 2 },
    scrollContent: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 40 },
    heroIconBox: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: theme.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    sectionTitle: { fontSize: 24, fontWeight: "900", color: theme.text, marginBottom: 8 },
    sectionSubtitle: { fontSize: 14, color: theme.textSecondary, marginBottom: 20, lineHeight: 20 },
    sourceBox: {
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      borderRadius: 12,
      padding: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
    },
    sourceLabel: { fontSize: 10, fontWeight: "800", color: theme.textSecondary, letterSpacing: 1, marginBottom: 2 },
    sourceName: { fontSize: 15, fontWeight: "700", color: theme.text },
    row: { flexDirection: "row" },
    infoBox: {
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
      borderRadius: 12,
      padding: 14,
      marginTop: 8,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      gap: 10,
    },
    infoTitle: {
      fontSize: 12,
      fontWeight: "800",
      color: theme.text,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    infoText: {
      fontSize: 12,
      color: theme.textSecondary,
      flex: 1,
      lineHeight: 17,
    },
  });
