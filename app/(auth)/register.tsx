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
import { registerSchema, RegisterSchema } from '@/features/auth/schemas/authSchemas';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { FormInput } from '@/components/ui/forms/FormInput';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';
import { RegisterResponse } from '@/features/auth/types/auth';
import { useTranslation } from 'react-i18next';



export default function RegisterScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
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
      Alert.alert(t('auth.register_success_title'), t('auth.register_success_msg'), [
        { text: t('auth.register_success_btn'), onPress: () => router.push('/(auth)/auth-login' as any) },
      ]);
    } catch (err: any) {
      Alert.alert(t('auth.register_error_title'), err.message ?? t('auth.register_error_msg'));
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

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <View style={styles.textSection}>
              <Text style={[GlobalStyles.title, { color: theme.text }]}>{t('auth.register_title')}</Text>
              <Text style={[GlobalStyles.subtitle, { color: theme.textSecondary }]}>
                {t('auth.register_subtitle')}
              </Text>
            </View>

            {/* Form Fields */}
            <FormInput
              control={control}
              name="username"
              label={t('auth.field_username')}
              placeholder={t('auth.field_username_placeholder')}
              required
            />

            <FormInput
              control={control}
              name="email"
              label={t('auth.field_email')}
              placeholder={t('auth.field_email_placeholder')}
              keyboardType="email-address"
              required
            />

            <View style={styles.row}>
              <FormInput
                control={control}
                name="first_name"
                label={t('auth.field_first_name')}
                placeholder={t('auth.field_first_name_placeholder')}
                required
                containerStyle={styles.halfField}
                autoCapitalize="words"
              />
              <FormInput
                control={control}
                name="last_name"
                label={t('auth.field_last_name')}
                placeholder={t('auth.field_last_name_placeholder')}
                required
                containerStyle={styles.halfField}
                autoCapitalize="words"
              />
            </View>

            <FormInput
              control={control}
              name="password"
              label={t('auth.field_password')}
              placeholder={t('auth.field_password_placeholder')}
              required
              isPassword
            />

            <FormInput
              control={control}
              name="password2"
              label={t('auth.field_password2')}
              placeholder={t('auth.field_password2_placeholder')}
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
                title={t('auth.register_button')}
                onPress={handleSubmit(onSubmit)}
                fullWidth
                style={{ marginTop: 10 }}
              />
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.already_have_account')}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Go to Login */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/auth-login' as any)}
            >
              <Text style={styles.secondaryButtonText}>{t('auth.go_to_login')}</Text>
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
