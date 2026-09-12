import React, { useEffect } from 'react';
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
import { ChevronLeft, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

  const params = useLocalSearchParams<{ uid?: string; token?: string }>();
  const initialUid = typeof params.uid === 'string' ? params.uid : '';
  const initialToken = typeof params.token === 'string' ? params.token : '';
  const hasDeepLinkTokens = Boolean(initialUid && initialToken);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      uid: initialUid,
      token: initialToken,
      new_password: '',
      new_password2: '',
    },
  });

  useEffect(() => {
    if (initialUid) setValue('uid', initialUid);
    if (initialToken) setValue('token', initialToken);
  }, [initialUid, initialToken, setValue]);

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      await api.post('/v1/auth/password-reset/confirm/', {
        uid: data.uid.trim(),
        token: data.token.trim(),
        new_password: data.new_password,
        new_password2: data.new_password2,
      });
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
                {hasDeepLinkTokens
                  ? 'Hemos autenticado tu enlace de recuperación. Ingresa tu nueva contraseña para continuar.'
                  : 'Ingresa el código que recibiste por correo electrónico junto con tu nueva contraseña.'}
              </Text>
            </View>

            {hasDeepLinkTokens && (
              <View style={styles.verifiedBox}>
                <View style={styles.verifiedRow}>
                  <CheckCircle2 size={18} color="#4ADE80" />
                  <Text style={styles.verifiedTitle}>Enlace de correo verificado</Text>
                </View>
                <Text style={styles.verifiedSubtitle}>
                  Tu código de seguridad ha sido vinculado automáticamente.
                </Text>
              </View>
            )}

            {!hasDeepLinkTokens && (
              <>
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
              </>
            )}

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
                label="Restablecer contraseña"
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
  verifiedBox: {
    backgroundColor: isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(74, 222, 128, 0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(74, 222, 128, 0.2)' : 'rgba(74, 222, 128, 0.3)',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  verifiedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: isDark ? '#4ADE80' : '#16A34A',
  },
  verifiedSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 16,
  },
});
