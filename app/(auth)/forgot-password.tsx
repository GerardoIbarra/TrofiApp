import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordSchema } from '@/features/auth/schemas/authSchemas';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { FormInput } from '@/components/ui/forms/FormInput';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';

export default function ForgotPasswordScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      const res = await api.post<{ detail: string }>('/v1/auth/password-reset/request/', data);
      setSuccess(true);
      Alert.alert('Correo enviado', res.detail);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Hubo un problema al procesar tu solicitud.');
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>RECUPERAR</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.content}>
            <View style={styles.textSection}>
              <Text style={[GlobalStyles.title, { color: theme.text }]}>Olvidé mi contraseña</Text>
              <Text style={[GlobalStyles.subtitle, { color: theme.textSecondary }]}>
                {success 
                  ? 'Si el correo existe, te hemos enviado las instrucciones para restablecer tu contraseña. Puedes revisar tu bandeja de entrada.'
                  : 'Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecerla.'}
              </Text>
            </View>

            {!success && (
              <FormInput
                control={control}
                name="email"
                label="CORREO ELECTRÓNICO"
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
                required
              />
            )}

            <View style={styles.buttonContainer}>
              {!success ? (
                <>
                  <PrimaryButton
                    label="Enviar instrucciones"
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  />
                  <TouchableOpacity onPress={() => router.push('/(auth)/reset-password' as any)} style={{ marginTop: 24, alignItems: 'center' }}>
                    <Text style={{ color: theme.primary, fontWeight: '600' }}>Ya tengo un código</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <PrimaryButton
                  label="Volver al inicio"
                  onPress={() => router.replace('/(auth)/auth-login' as any)}
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  textSection: {
    marginBottom: 40,
  },
  buttonContainer: {
    marginTop: 40,
  },
});
