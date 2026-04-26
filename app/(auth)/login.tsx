import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Info } from 'lucide-react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginSchema } from '@/features/auth/schemas/authSchemas';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { FormInput } from '@/components/ui/forms/FormInput';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { useAuthStore } from '@/features/auth/store/authStore';
import { AuthResponse } from '@/features/auth/types/auth';



export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const signIn = useAuthStore((state) => state.signIn);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      const res = await api.post<AuthResponse>(
        '/v1/auth/login/',
        data as unknown as Record<string, unknown>
      );
      
      await signIn(res);
    } catch (err: any) {
      Alert.alert('Error al iniciar sesión', err.message ?? 'Credenciales incorrectas.');
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <SafeAreaView style={GlobalStyles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/(auth)' as any)} style={styles.backButton}>
              <ChevronLeft size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>TROFI</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.content}>
            {/* Title */}
            <View style={styles.textSection}>
              <Text style={[GlobalStyles.title, { color: theme.text }]}>Bienvenido</Text>
              <Text style={[GlobalStyles.subtitle, { color: theme.textSecondary }]}>
                Ingresa tus credenciales para continuar al campo.
              </Text>
            </View>

            {/* Email/Identifier */}
            <FormInput
              control={control}
              name="identifier"
              label="CORREO ELECTRÓNICO"
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              required
            />

            {/* Password */}
            <FormInput
              control={control}
              name="password"
              label="CONTRASEÑA"
              placeholder="Tu contraseña"
              required
              isPassword
            />

            {/* Login Button */}
            {isSubmitting ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator color={theme.primary} size="large" />
              </View>
            ) : (
              <PrimaryButton
                title="Iniciar sesión"
                onPress={handleSubmit(onSubmit)}
                fullWidth
                style={{ marginTop: 10 }}
              />
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>¿No tienes cuenta?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Go to Register */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/register' as any)}
            >
              <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Info size={16} color={theme.textSecondary} />
              <Text style={styles.infoText}>TROFI ELITE SPORTS MANAGEMENT - 2024</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    keyboardView: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      height: 60,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.primary,
      letterSpacing: 2,
    },
    content: {
      flex: 1,
      paddingHorizontal: 30,
      paddingTop: 40,
    },
    textSection: { marginBottom: 40 },
    loadingWrapper: {
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    dividerText: {
      color: theme.textSecondary,
      marginHorizontal: 12,
      fontSize: 13,
    },
    secondaryButton: {
      width: '100%',
      height: 56,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    },
    secondaryButtonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
    infoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 'auto',
      marginBottom: 20,
      gap: 8,
    },
    infoText: {
      fontSize: 9,
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
  });
