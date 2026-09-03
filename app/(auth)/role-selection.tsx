import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { metrics } from '@/services/metrics';
import { router } from 'expo-router';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { useAuthStore } from '@/features/auth/store/authStore';

const ROLES = [
  { id: 'spectator', endpoint: '/v1/spectator-profiles/', title: 'Espectador', description: 'Sigue a tus equipos y ligas favoritas.' },
  { id: 'player', endpoint: '/v1/players/', title: 'Jugador', description: 'Únete a equipos, revisa tus estadísticas y logros.' },
  { id: 'referee', endpoint: '/v1/referee-profiles/', title: 'Árbitro', description: 'Gestiona partidos, resultados y tarjetas.' },
  { id: 'sponsor', endpoint: '/v1/sponsor-profiles/', title: 'Sponsor', description: 'Promociona tu marca en las ligas.' },
];

export default function RoleSelectionScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const [selectedRole, setSelectedRole] = useState<typeof ROLES[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleContinue = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      // API call to create profile
      await api.post(selectedRole.endpoint, {});
      metrics.trackRoleSelected(selectedRole.id);
      
      // Update me
      const meRes = await api.get<any>('/v1/me/');
      useAuthStore.setState({ user: meRes });
      
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Hubo un problema al crear tu perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={GlobalStyles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.textSection}>
            <Text style={[GlobalStyles.title, { color: theme.text }]}>¿Cómo quieres participar?</Text>
            <Text style={[GlobalStyles.subtitle, { color: theme.textSecondary }]}>
              Selecciona tu rol principal para comenzar. Podrás agregar más roles más adelante.
            </Text>
          </View>

          <View style={styles.rolesContainer}>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  selectedRole?.id === role.id && { borderColor: theme.primary, borderWidth: 2 }
                ]}
                onPress={() => setSelectedRole(role)}
              >
                <Text style={[styles.roleTitle, { color: theme.text }]}>{role.title}</Text>
                <Text style={[styles.roleDescription, { color: theme.textSecondary }]}>{role.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <PrimaryButton
              label="Continuar"
              onPress={handleContinue}
              disabled={!selectedRole || isSubmitting}
            />
            {isSubmitting && <ActivityIndicator color={theme.primary} style={{ marginTop: 10 }} />}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  textSection: {
    marginBottom: 32,
    marginTop: 20,
  },
  rolesContainer: {
    gap: 16,
    marginBottom: 40,
  },
  roleCard: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
});
