import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert } from "react-native";
import { useForm } from "react-hook-form";
import { X, MapPin } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { PrimaryButton } from "@/components/ui/buttons/PrimaryButton";
import { FormInput } from "@/components/ui/forms/FormInput";
import { useCreateVenue, useCreateField } from "@/features/venues/services/venueApi";
import { LocationService } from "@/services/locationService";

export function VenueManagerModal({ visible, onClose, leagueId }: { visible: boolean; onClose: () => void; leagueId?: string; }) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const venueMutation = useCreateVenue();
  const fieldMutation = useCreateField();

  const [activeTab, setActiveTab] = useState<'venue'|'field'>('venue');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { control: controlVenue, handleSubmit: handleSubmitVenue, reset: resetVenue, setValue: setValueVenue } = useForm();
  const { control: controlField, handleSubmit: handleSubmitField, reset: resetField } = useForm();

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const loc = await LocationService.fetchCurrentPosition();
      if (loc && typeof loc.latitude === "number" && typeof loc.longitude === "number") {
        setValueVenue("latitude", Number(loc.latitude.toFixed(6)));
        setValueVenue("longitude", Number(loc.longitude.toFixed(6)));
      } else {
        Alert.alert("Ubicación", "No se pudo obtener la ubicación GPS.");
      }
    } catch {
      Alert.alert("Error", "Error al capturar ubicación.");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const onVenueSubmit = (data: any) => {
    const lat = data.latitude != null && data.latitude !== '' ? Number(data.latitude) : undefined;
    const lng = data.longitude != null && data.longitude !== '' ? Number(data.longitude) : undefined;

    venueMutation.mutate({
      name: data.name,
      city: data.city,
      latitude: lat != null && !isNaN(lat) ? lat : undefined,
      longitude: lng != null && !isNaN(lng) ? lng : undefined,
      league: leagueId // si se pasa leagueId, es exclusiva
    }, {
      onSuccess: () => {
        Alert.alert("Éxito", "Sede creada con coordenadas. Ahora puedes crearle canchas.");
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

                <View style={styles.locationSection}>
                  <View style={styles.locationHeader}>
                    <Text style={styles.locationTitle}>COORDENADAS (MAPA)</Text>
                    <TouchableOpacity
                      style={styles.gpsButton}
                      onPress={handleUseCurrentLocation}
                      disabled={isGettingLocation}
                      activeOpacity={0.7}
                    >
                      <MapPin size={13} color={theme.primary} />
                      <Text style={styles.gpsButtonText}>
                        {isGettingLocation ? "Detectando..." : "Detectar GPS"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.row}>
                    <FormInput
                      control={controlVenue}
                      name="latitude"
                      label="LATITUD"
                      placeholder="19.4326"
                      keyboardType="numeric"
                      containerStyle={{ flex: 1 }}
                    />
                    <View style={{ width: 15 }} />
                    <FormInput
                      control={controlVenue}
                      name="longitude"
                      label="LONGITUD"
                      placeholder="-99.1332"
                      keyboardType="numeric"
                      containerStyle={{ flex: 1 }}
                    />
                  </View>
                </View>

                <Text style={styles.noteText}>
                  * Las sedes con coordenadas aparecerán en el mapa de cercanía. {leagueId ? 'Quedará vinculada a tu liga.' : 'Quedará como pública.'}
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
  noteText: { fontSize: 12, color: theme.textSecondary, marginTop: 10, fontStyle: 'italic' },
  row: { flexDirection: 'row', width: '100%' },
  locationSection: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.textSecondary,
    letterSpacing: 1,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(0, 245, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  gpsButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primary,
  },
});
