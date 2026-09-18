import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Users, Shield, CheckCircle2, AlertTriangle, ArrowRight, LogIn, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { useJoinWithToken } from '@/features/teams/services/teamInvitationApi';
import { useGetTeamProfile } from '@/features/teams/services/teamProfileApi';

export const PENDING_INVITE_STORAGE_KEY = '@pending_team_invite';

export default function JoinTeamScreen() {
  const { teamId, token } = useLocalSearchParams<{ teamId: string; token?: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const joinMutation = useJoinWithToken();
  const { data: teamProfile, isLoading: isLoadingProfile } = useGetTeamProfile(teamId);

  const [hasJoined, setHasJoined] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Si no está autenticado, guardamos la invitación para procesarla post-login
    if (!isAuthenticated && token && teamId) {
      AsyncStorage.setItem(
        PENDING_INVITE_STORAGE_KEY,
        JSON.stringify({ teamId, token })
      ).catch(() => {});
    }
  }, [isAuthenticated, token, teamId]);

  const handleJoin = async () => {
    if (!token) {
      setErrorMessage('Enlace de invitación inválido: falta el token de acceso.');
      return;
    }

    setErrorMessage(null);
    joinMutation.mutate(
      { token },
      {
        onSuccess: (res) => {
          setHasJoined(true);
          AsyncStorage.removeItem(PENDING_INVITE_STORAGE_KEY).catch(() => {});
          Alert.alert(
            '¡Bienvenido!',
            res?.detail || 'Te has unido al equipo exitosamente.',
            [
              {
                text: 'Ver Equipo',
                onPress: () => {
                  router.replace({
                    pathname: '/(tabs)/team-detail' as any,
                    params: { id: teamId },
                  });
                },
              },
            ]
          );
        },
        onError: (err: any) => {
          setErrorMessage(
            err?.message ||
              'No se pudo unir al equipo. El enlace pudo haber expirado o el cupo del torneo está completo.'
          );
        },
      }
    );
  };

  const teamName = teamProfile?.team?.name || 'Equipo';

  return (
    <View style={styles.container}>
      <BackgroundGradient />

      {/* Header back button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)')}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.centerContainer}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Shield size={36} color={theme.primary} />
          </View>

          <Text style={styles.badge}>INVITACIÓN A EQUIPO</Text>
          <Text style={styles.teamTitle}>{teamName}</Text>

          {isLoadingProfile ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 12 }} />
          ) : (
            <Text style={styles.description}>
              Has recibido una invitación para sumarte a la plantilla de este equipo y competir en sus torneos activos.
            </Text>
          )}

          {errorMessage && (
            <View style={styles.errorBox}>
              <AlertTriangle size={18} color="#EF4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {hasJoined ? (
            <View style={styles.successBox}>
              <CheckCircle2 size={24} color="#10B981" />
              <Text style={styles.successText}>¡Ya eres parte del equipo!</Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() =>
                  router.replace({
                    pathname: '/(tabs)/team-detail' as any,
                    params: { id: teamId },
                  })
                }
              >
                <Text style={styles.primaryBtnText}>Ir a la pantalla del equipo</Text>
                <ArrowRight size={18} color="#001A2C" />
              </TouchableOpacity>
            </View>
          ) : isAuthenticated ? (
            <TouchableOpacity
              style={[styles.primaryBtn, joinMutation.isPending && { opacity: 0.7 }]}
              onPress={handleJoin}
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? (
                <ActivityIndicator color="#001A2C" />
              ) : (
                <>
                  <Users size={18} color="#001A2C" />
                  <Text style={styles.primaryBtnText}>Unirme al Equipo</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.authPromptBox}>
              <Text style={styles.authPromptText}>
                Debes iniciar sesión con tu cuenta de Trofi para unirte a este equipo.
              </Text>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.push('/(auth)')}
              >
                <LogIn size={18} color="#001A2C" />
                <Text style={styles.primaryBtnText}>Iniciar Sesión</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.secondaryBtnText}>Crear cuenta nueva</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    topBar: {
      paddingTop: 54,
      paddingHorizontal: 20,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: isDark ? '#0D1E3A' : '#FFFFFF',
      borderRadius: 24,
      padding: 28,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 8,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: isDark ? 'rgba(0,240,255,0.1)' : 'rgba(0,240,255,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    badge: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.primary,
      letterSpacing: 1,
      marginBottom: 6,
    },
    teamTitle: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    description: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.3)',
      padding: 12,
      borderRadius: 12,
      marginBottom: 20,
      width: '100%',
    },
    errorText: {
      flex: 1,
      fontSize: 12,
      color: '#EF4444',
      fontWeight: '600',
    },
    successBox: {
      alignItems: 'center',
      gap: 16,
      width: '100%',
    },
    successText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#10B981',
    },
    authPromptBox: {
      width: '100%',
      gap: 12,
      alignItems: 'center',
    },
    authPromptText: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: theme.primary,
      width: '100%',
      paddingVertical: 14,
      borderRadius: 14,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 4,
    },
    primaryBtnText: {
      color: '#001A2C',
      fontSize: 15,
      fontWeight: '800',
    },
    secondaryBtn: {
      width: '100%',
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
    },
    secondaryBtnText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '700',
    },
  });
