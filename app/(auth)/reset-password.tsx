import React from 'react';
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
import { resetPasswordSchema, ResetPasswordSchema } from '@/features/auth/schemas/authSchemas';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { FormInput } from '@/components/ui/forms/FormInput';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';

export default function ResetPasswordScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { uid: '', token: '', new_password: '', new_password2: '' },
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      await api.post('/v1/auth/password-reset/confirm/', data);
      Alert.alert(
        'Contraseña restablecida', 
        'Tu contraseña se ha restablecido exitosamente. Inicia sesión con tu nueva contraseña.',
        [
          { text: 'OK', onPress: () => router.replace('/(auth)/auth-login' as any) }
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'El enlace es inválido o ha expirado.');
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
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>RESTABLECER</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.content}>
            <View style={styles.textSection}>
              <Text style={[GlobalStyles.title, { color: theme.text }]}>Nueva contraseña</Text>
              <Text style={[GlobalStyles.subtitle, { color: theme.textSecondary }]}>
                Ingresa el código que recibiste por correo electrónico junto con tu nueva contraseña.
              </Text>
            </View>

            <FormInput
              control={control}
              name="uid"
              label="UID"
              placeholder="Ej. Mg"
              required
            />
            <FormInput
              control={control}
              name="token"
              label="TOKEN"
              placeholder="Ej. xxxx-xxxx"
              required
            />
            <FormInput
              control={control}
              name="new_password"
              label="NUEVA CONTRASEÑA"
              placeholder="Tu nueva contraseña"
              required
              isPassword
            />
            <FormInput
              control={control}
              name="new_password2"
              label="CONFIRMAR CONTRASEÑA"
              placeholder="Repite la contraseña"
              required
              isPassword
            />

            <View style={styles.buttonContainer}>
              <PrimaryButton
                label="Restablecer"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              />
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
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
});
