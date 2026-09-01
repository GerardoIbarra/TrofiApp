import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert } from "react-native";
import { useForm } from "react-hook-form";
import { X, CalendarPlus } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormDatePicker } from "@/components/ui/forms/FormDatePicker";
import { useGenerateWeeklySchedule, useGenerateRoundRobin } from "@/features/matches/services/matchApi";

interface Props {
  visible: boolean;
  onClose: () => void;
  tournamentId: string;
}

export function GenerateScheduleModal({ visible, onClose, tournamentId }: Props) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const weeklyMutation = useGenerateWeeklySchedule();
  const roundRobinMutation = useGenerateRoundRobin();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      start_date: new Date().toISOString().split('T')[0],
      matches_per_day: "4",
    }
  });

  const onGenerateWeekly = (data: any) => {
    weeklyMutation.mutate({
      tournamentId,
      data: { start_date: data.start_date }
    }, {
      onSuccess: () => {
        Alert.alert("Éxito", "Calendario semanal generado.");
        onClose();
      },
      onError: (err: any) => {
        Alert.alert("Error", err.message || "Revisa que tengas una configuración guardada.");
      }
    });
  };

  const onGenerateRoundRobin = (data: any) => {
    roundRobinMutation.mutate({
      tournamentId,
      data: { 
        start_date: data.start_date,
        matches_per_day: parseInt(data.matches_per_day) || 4
      }
    }, {
      onSuccess: () => {
        Alert.alert("Éxito", "Calendario Round-Robin generado.");
        onClose();
      }
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <BackgroundGradient />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>GENERAR FIXTURE</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.iconBox}>
              <CalendarPlus size={30} color={theme.primary} />
            </View>
            <Text style={styles.title}>Opciones de Generación</Text>
            
            <FormDatePicker control={control} name="start_date" label="FECHA DE INICIO" />
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Opción 1: Semanal Automático</Text>
              <Text style={styles.cardDesc}>Utiliza la configuración de días y canchas guardada previamente.</Text>
              <PrimaryButton 
                title={weeklyMutation.isPending ? "Generando..." : "Generar Semanal"} 
                onPress={handleSubmit(onGenerateWeekly)}
                disabled={weeklyMutation.isPending || roundRobinMutation.isPending}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Opción 2: Round Robin Simple</Text>
              <Text style={styles.cardDesc}>Asigna N partidos consecutivos por día sin importar el día de la semana.</Text>
              <FormInput control={control} name="matches_per_day" label="PARTIDOS POR DÍA" keyboardType="numeric" />
              <PrimaryButton 
                title={roundRobinMutation.isPending ? "Generando..." : "Generar Round Robin"} 
                onPress={handleSubmit(onGenerateRoundRobin)}
                disabled={weeklyMutation.isPending || roundRobinMutation.isPending}
                style={{ marginTop: 10 }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: theme.primary, fontWeight: '900', letterSpacing: 1 },
  scrollContent: { padding: 25 },
  iconBox: { width: 60, height: 60, borderRadius: 15, backgroundColor: theme.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 20, fontWeight: '900', color: theme.text, marginBottom: 20 },
  card: { padding: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: theme.primary, marginBottom: 5 },
  cardDesc: { fontSize: 12, color: theme.textSecondary, marginBottom: 15, lineHeight: 18 }
});
