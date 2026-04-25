import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Info } from 'lucide-react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterSchema } from '@/schemas/authSchemas';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { PrimaryButton } from '@/components/PrimaryButton';
import { FormInput } from '@/components/FormInput';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { RegisterResponse } from '@/types/auth';



export default function RegisterScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password2: '',
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      await api.post<RegisterResponse>('/v1/auth/register/', data as unknown as Record<string, unknown>);
      Alert.alert('¡Registro exitoso!', 'Tu cuenta ha sido creada. Inicia sesión para continuar.', [
        { text: 'Iniciar sesión', onPress: () => router.push('/(auth)/login' as any) },
      ]);
    } catch (err: any) {
      Alert.alert('Error de registro', err.message ?? 'Ocurrió un error. Intenta de nuevo.');
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
            <Text style={styles.headerTitle}>TROFY</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <View style={styles.textSection}>
              <Text style={[GlobalStyles.title, { color: theme.text }]}>Crea tu cuenta</Text>
              <Text style={[GlobalStyles.subtitle, { color: theme.textSecondary }]}>
                Completa tus datos para unirte a la liga.
              </Text>
            </View>

            {/* Form Fields */}
            <FormInput
              control={control}
              name="username"
              label="NOMBRE DE USUARIO"
              placeholder="jugador99"
              required
            />

            <FormInput
              control={control}
              name="email"
              label="CORREO ELECTRÓNICO"
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              required
            />

            <View style={styles.row}>
              <FormInput
                control={control}
                name="first_name"
                label="NOMBRE"
                placeholder="Carlos"
                required
                containerStyle={styles.halfField}
                autoCapitalize="words"
              />
              <FormInput
                control={control}
                name="last_name"
                label="APELLIDO"
                placeholder="García"
                required
                containerStyle={styles.halfField}
                autoCapitalize="words"
              />
            </View>

            <FormInput
              control={control}
              name="password"
              label="CONTRASEÑA"
              placeholder="Mínimo 6 caracteres"
              required
              isPassword
            />

            <FormInput
              control={control}
              name="password2"
              label="CONFIRMAR CONTRASEÑA"
              placeholder="Repite tu contraseña"
              required
              isPassword
            />

            {/* Register Button */}
            {isSubmitting ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator color={theme.primary} size="large" />
              </View>
            ) : (
              <PrimaryButton
                title="Crear cuenta"
                onPress={handleSubmit(onSubmit)}
                fullWidth
                style={{ marginTop: 10 }}
              />
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>¿Ya tienes cuenta?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Go to Login */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/login' as any)}
            >
              <Text style={styles.secondaryButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Info size={16} color={theme.textSecondary} />
              <Text style={styles.infoText}>TROFI ELITE SPORTS MANAGEMENT - 2024</Text>
            </View>
          </ScrollView>
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
    scrollContent: {
      paddingHorizontal: 30,
      paddingTop: 20,
      paddingBottom: 40,
    },
    textSection: { marginBottom: 32 },
    row: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 0,
    },
    halfField: {
      flex: 1,
    },
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
      marginTop: 32,
      gap: 8,
    },
    infoText: {
      fontSize: 9,
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
  });
