import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { X, Calendar, Clock, MapPin, CheckSquare, Square } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";
import { FormInput } from "@/components/ui/forms/FormInput";
import { useUpdateScheduleConfig, useGetScheduleConfig } from "@/features/matches/services/matchApi";
import { useGetVenues, useGetFields } from "@/features/venues/services/venueApi";
import { ScheduleConfigSchema } from "@/features/matches/schemas/matchSchema";

interface Props {
  visible: boolean;
  onClose: () => void;
  tournamentId: string;
}

const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" }, // Sometimes 0 is Sunday, depends on backend ISO parsing, using ISO 1-7.
];

export function ScheduleConfigModal({ visible, onClose, tournamentId }: Props) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const { data: config, isLoading: isConfigLoading } = useGetScheduleConfig(tournamentId);
  const { data: venues } = useGetVenues();
  
  // Just grabbing the first venue's fields for simplicity in this demo, real app would have a venue selector
  const defaultVenueId = venues && venues.length > 0 ? venues[0].id : undefined;
  const { data: fields } = useGetFields(defaultVenueId);

  const updateMutation = useUpdateScheduleConfig();

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const { control, handleSubmit, reset } = useForm<ScheduleConfigSchema>({
    defaultValues: {
      window_start: "18:00",
      window_end: "23:00",
      match_duration_minutes: 60,
      break_minutes: 10,
    }
  });

  useEffect(() => {
    if (visible && config) {
      reset({
        window_start: config.window_start || "18:00",
        window_end: config.window_end || "23:00",
        match_duration_minutes: config.match_duration_minutes || 60,
        break_minutes: config.break_minutes || 10,
      });
      setSelectedDays(config.days_of_week || []);
      setSelectedFields(config.fields || []);
    }
  }, [visible, config]);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(f => f !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  const onSubmit = (data: ScheduleConfigSchema) => {
    if (selectedDays.length === 0) {
      Alert.alert("Error", "Selecciona al menos un día");
      return;
    }
    
    updateMutation.mutate({
      tournamentId,
      data: {
        ...data,
        days_of_week: selectedDays,
        fields: selectedFields,
      }
    }, {
      onSuccess: () => {
        Alert.alert("Éxito", "Configuración guardada correctamente");
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
            <Text style={styles.headerTitle}>CONFIGURACIÓN SEMANAL</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {isConfigLoading ? (
              <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
            ) : (
              <>
                <Text style={styles.sectionTitle}>Días de Juego</Text>
                <View style={styles.daysGrid}>
                  {DAYS.map(day => (
                    <TouchableOpacity
                      key={day.value}
                      style={[styles.dayChip, selectedDays.includes(day.value) && styles.dayChipActive]}
                      onPress={() => toggleDay(day.value)}
                    >
                      <Text style={[styles.dayText, selectedDays.includes(day.value) && styles.dayTextActive]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.timeRow}>
                  <View style={{ flex: 1 }}>
                    <FormInput control={control} name="window_start" label="HORA INICIO (HH:MM)" placeholder="18:00" />
                  </View>
                  <View style={{ width: 15 }} />
                  <View style={{ flex: 1 }}>
                    <FormInput control={control} name="window_end" label="HORA FIN (HH:MM)" placeholder="23:00" />
                  </View>
                </View>

                <View style={styles.timeRow}>
                  <View style={{ flex: 1 }}>
                    <FormInput control={control} name="match_duration_minutes" label="DURACIÓN (MIN)" placeholder="60" keyboardType="numeric" />
                  </View>
                  <View style={{ width: 15 }} />
                  <View style={{ flex: 1 }}>
                    <FormInput control={control} name="break_minutes" label="DESCANSO (MIN)" placeholder="10" keyboardType="numeric" />
                  </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Canchas Disponibles</Text>
                {fields && fields.length > 0 ? (
                  <View style={styles.fieldsList}>
                    {fields.map((f: any) => (
                      <TouchableOpacity key={f.id} style={styles.fieldItem} onPress={() => toggleField(f.id)}>
                        {selectedFields.includes(f.id) ? (
                          <CheckSquare size={20} color={theme.primary} />
                        ) : (
                          <Square size={20} color={theme.textSecondary} />
                        )}
                        <Text style={styles.fieldText}>{f.name} ({f.surface || 'Pasto'})</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={{ color: theme.textSecondary, marginBottom: 20 }}>No hay canchas configuradas en esta sede.</Text>
                )}

                <PrimaryButton 
                  title={updateMutation.isPending ? "Guardando..." : "Guardar Configuración"}
                  onPress={handleSubmit(onSubmit)}
                  disabled={updateMutation.isPending}
                  style={{ marginTop: 10 }}
                />
              </>
            )}
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
  scrollContent: { padding: 25, paddingBottom: 50 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 15 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  dayChip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  dayChipActive: { backgroundColor: theme.primary },
  dayText: { fontSize: 12, fontWeight: '700', color: theme.textSecondary },
  dayTextActive: { color: '#001A2C' },
  timeRow: { flexDirection: 'row' },
  fieldsList: { gap: 12, marginBottom: 30 },
  fieldItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 15, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 12 },
  fieldText: { color: theme.text, fontSize: 14, fontWeight: '600' }
});
