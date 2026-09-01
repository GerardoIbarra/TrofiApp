import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormDatePicker } from "@/components/ui/forms/FormDatePicker";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";
import { useTheme } from "@/context/ThemeContext";
import { useCloneTournament } from "@/features/tournaments/services/tournamentApi";
import { Copy, X } from "lucide-react-native";
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
  onSuccess: () => void;
  tournamentId: string;
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
    cloneMutation.mutate(
      {
        id: tournamentId,
        leagueId,
        data: {
          name: data.name || undefined,
          season_label: data.season_label,
          start_date: data.start_date,
          end_date: data.end_date,
        },
      },
      {
        onSuccess: () => {
          Alert.alert("¡Éxito!", "Temporada clonada exitosamente.");
          reset();
          onSuccess();
          onClose();
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "No se pudo clonar la temporada.");
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
              Se copiarán las configuraciones y los equipos participantes, pero se vaciarán los planteles para la nueva temporada.
            </Text>

            <FormInput
              control={control}
              name="season_label"
              label="ETIQUETA DE TEMPORADA"
              placeholder="Ej. 2025-I"
              required
            />
            <FormInput
              control={control}
              name="name"
              label="NUEVO NOMBRE (OPCIONAL)"
              placeholder="Deja en blanco para mantener el mismo nombre"
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormDatePicker control={control} name="start_date" label="FECHA INICIO" required />
              </View>
              <View style={{ width: 15 }} />
              <View style={{ flex: 1 }}>
                <FormDatePicker control={control} name="end_date" label="FECHA FIN" required />
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
    row: { flexDirection: "row" },
  });
