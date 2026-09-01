import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert } from "react-native";
import { useForm } from "react-hook-form";
import { X, MapPin } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";
import { FormInput } from "@/components/ui/forms/FormInput";
import { useCreateVenue, useCreateField } from "@/features/venues/services/venueApi";

export function VenueManagerModal({ visible, onClose, leagueId }: { visible: boolean; onClose: () => void; leagueId?: string; }) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const venueMutation = useCreateVenue();
  const fieldMutation = useCreateField();

  const [activeTab, setActiveTab] = useState<'venue'|'field'>('venue');

  const { control: controlVenue, handleSubmit: handleSubmitVenue, reset: resetVenue } = useForm();
  const { control: controlField, handleSubmit: handleSubmitField, reset: resetField } = useForm();

  const onVenueSubmit = (data: any) => {
    venueMutation.mutate({
      name: data.name,
      city: data.city,
      league: leagueId // si se pasa leagueId, es exclusiva
    }, {
      onSuccess: () => {
        Alert.alert("Éxito", "Sede creada. Ahora puedes crearle canchas.");
        resetVenue();
        setActiveTab('field');
      }
    });
  };

  const onFieldSubmit = (data: any) => {
    fieldMutation.mutate({
      venue: data.venue_id,
      name: data.name,
      surface: data.surface
    }, {
      onSuccess: () => {
        Alert.alert("Éxito", "Cancha creada exitosamente.");
        resetField();
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
            <Text style={styles.headerTitle}>GESTOR DE SEDES</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity onPress={() => setActiveTab('venue')} style={[styles.tab, activeTab === 'venue' && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === 'venue' && styles.tabTextActive]}>Crear Sede</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('field')} style={[styles.tab, activeTab === 'field' && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === 'field' && styles.tabTextActive]}>Crear Cancha</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {activeTab === 'venue' ? (
              <View>
                <FormInput control={controlVenue} name="name" label="NOMBRE DE LA SEDE" placeholder="Ej. Complejo Norte" required />
                <FormInput control={controlVenue} name="city" label="CIUDAD" placeholder="Bogotá" />
                <Text style={styles.noteText}>
                  * Las sedes sin liga asociada serán públicas. Esta sede quedará {leagueId ? 'vinculada a tu liga.' : 'como pública.'}
                </Text>
                <PrimaryButton 
                  title={venueMutation.isPending ? "Guardando..." : "Registrar Sede"} 
                  onPress={handleSubmitVenue(onVenueSubmit)}
                  disabled={venueMutation.isPending}
                  style={{ marginTop: 20 }}
                />
              </View>
            ) : (
              <View>
                <FormInput control={controlField} name="venue_id" label="ID DE LA SEDE (UUID)" placeholder="Pega el ID del Venue aquí" required />
                <FormInput control={controlField} name="name" label="NOMBRE DE LA CANCHA" placeholder="Ej. Cancha A" required />
                <FormInput control={controlField} name="surface" label="SUPERFICIE (grass, turf, indoor...)" placeholder="grass" />
                <PrimaryButton 
                  title={fieldMutation.isPending ? "Guardando..." : "Registrar Cancha"} 
                  onPress={handleSubmitField(onFieldSubmit)}
                  disabled={fieldMutation.isPending}
                  style={{ marginTop: 20 }}
                />
              </View>
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
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: theme.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: theme.textSecondary },
  tabTextActive: { color: theme.primary },
  scrollContent: { padding: 25 },
  noteText: { fontSize: 12, color: theme.textSecondary, marginTop: 10, fontStyle: 'italic' }
});
