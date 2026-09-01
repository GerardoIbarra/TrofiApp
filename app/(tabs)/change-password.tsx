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
        'Contraseña actualizada', 
        'Tu contraseña se ha actualizado correctamente. Se ha cerrado tu sesión en otros dispositivos. Deberás iniciar sesión de nuevo aquí.',
        [
          { text: 'Aceptar', onPress: () => signOut() }
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'La contraseña actual es incorrecta o hubo un error.');
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
            <Text style={styles.headerTitle}>CAMBIAR CONTRASEÑA</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.content}>
            <FormInput
              control={control}
              name="old_password"
              label="CONTRASEÑA ACTUAL"
              placeholder="Tu contraseña actual"
              required
              isPassword
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
              label="CONFIRMAR NUEVA CONTRASEÑA"
              placeholder="Repite la nueva contraseña"
              required
              isPassword
            />

            <View style={styles.buttonContainer}>
              <PrimaryButton
                label="Cambiar Contraseña"
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
