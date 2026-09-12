import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordSchema } from '@/features/auth/schemas/authSchemas';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { FormInput } from '@/components/ui/forms/FormInput';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function ChangePasswordScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const signOut = useAuthStore((state) => state.signOut);
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const handleBack = () => {
    router.replace('/(tabs)/profile' as any);
  };

  useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: '', new_password: '', new_password2: '' },
  });

  const onSubmit = async (data: ChangePasswordSchema) => {
    try {
      await api.post('/v1/auth/change-password/', data);
      Alert.alert(
        isEn ? 'Password Updated' : 'Contraseña actualizada', 
        isEn
          ? 'Your password has been updated successfully. You have been logged out of other devices. Please sign in again here.'
          : 'Tu contraseña se ha actualizado correctamente. Se ha cerrado tu sesión en otros dispositivos. Deberás iniciar sesión de nuevo aquí.',
        [
          { text: isEn ? 'OK' : 'Aceptar', onPress: () => signOut() }
        ]
      );
    } catch (err: any) {
      Alert.alert(
        isEn ? 'Error' : 'Error', 
        err.message || (isEn ? 'The current password is wrong or an error occurred.' : 'La contraseña actual es incorrecta o hubo un error.')
      );
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
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ChevronLeft size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEn ? 'CHANGE PASSWORD' : 'CAMBIAR CONTRASEÑA'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.content}>
            <FormInput
              control={control}
              name="old_password"
              label={isEn ? 'CURRENT PASSWORD' : 'CONTRASEÑA ACTUAL'}
              placeholder={isEn ? 'Your current password' : 'Tu contraseña actual'}
              required
              isPassword
            />
            <FormInput
              control={control}
              name="new_password"
              label={isEn ? 'NEW PASSWORD' : 'NUEVA CONTRASEÑA'}
              placeholder={isEn ? 'Your new password' : 'Tu nueva contraseña'}
              required
              isPassword
            />
            <FormInput
              control={control}
              name="new_password2"
              label={isEn ? 'CONFIRM NEW PASSWORD' : 'CONFIRMAR NUEVA CONTRASEÑA'}
              placeholder={isEn ? 'Repeat new password' : 'Repite la nueva contraseña'}
              required
              isPassword
            />

            <View style={styles.buttonContainer}>
              <PrimaryButton
                label={isEn ? 'Change Password' : 'Cambiar Contraseña'}
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
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
});
