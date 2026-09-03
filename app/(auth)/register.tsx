import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale, Layout } from '@/constants/layout';
import {
  ChevronLeft,
  Info,
  Users,
  Eye,
  Shield,
  CheckCircle2,
  Swords,
  Star,
  Trophy,
} from 'lucide-react-native';
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
import { metrics } from '@/services/metrics';
import { RegisterResponse } from '@/features/auth/types/auth';
import { useTranslation } from 'react-i18next';

const { width } = Layout.window;

type UserRole = 'player' | 'spectator' | 'admin' | null;
type PlayerPosition = 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | null;

const TOTAL_STEPS = 3;

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({
  currentStep,
  theme,
  isDark,
}: {
  currentStep: number;
  theme: any;
  isDark: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: scale(30), marginBottom: verticalScale(24) }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        return (
          <React.Fragment key={i}>
            <View
              style={{
                width: isActive ? scale(32) : scale(10),
                height: verticalScale(10),
                borderRadius: moderateScale(5),
                backgroundColor: isActive || isDone ? theme.primary : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              {isDone && (
                <View style={{ flex: 1, backgroundColor: theme.primary, opacity: 0.6 }} />
              )}
            </View>
            {i < TOTAL_STEPS - 1 && (
              <View style={{ flex: 1, height: verticalScale(2), backgroundColor: isDone ? theme.primary + '60' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 1 }} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Role Card ───────────────────────────────────────────────────────────────
function RoleCard({
  icon,
  title,
  description,
  perks,
  selected,
  onPress,
  theme,
  isDark,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  perks: string[];
  selected: boolean;
  onPress: () => void;
  theme: any;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        marginBottom: verticalScale(14),
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? theme.primary : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        backgroundColor: selected
          ? isDark ? 'rgba(0,245,255,0.07)' : 'rgba(0,200,220,0.06)'
          : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 10,
          },
          android: {
            elevation: selected ? 8 : 2,
          },
        }),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: scale(16) }}>
        <View
          style={{
            width: scale(52),
            height: scale(52),
            borderRadius: moderateScale(16),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: selected
              ? theme.primary + '20'
              : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          }}
        >
          {icon}
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: verticalScale(4) }}>
            <Text style={{ fontSize: moderateScale(17), fontWeight: '800', color: theme.text }}>{title}</Text>
            {selected && <CheckCircle2 size={moderateScale(20)} color={theme.primary} />}
          </View>
          <Text style={{ fontSize: moderateScale(12), color: theme.textSecondary, lineHeight: moderateScale(18), marginBottom: verticalScale(12) }}>
            {description}
          </Text>

          <View style={{ gap: verticalScale(6) }}>
            {perks.map((perk, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: scale(8) }}>
                <View style={{ width: scale(5), height: scale(5), borderRadius: 3, backgroundColor: selected ? theme.primary : theme.textSecondary, opacity: selected ? 1 : 0.5 }} />
                <Text style={{ fontSize: moderateScale(11), color: selected ? theme.text : theme.textSecondary, fontWeight: '600' }}>
                  {perk}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Position Card ────────────────────────────────────────────────────────────
function PositionCard({
  label,
  sublabel,
  icon,
  selected,
  onPress,
  theme,
  isDark,
}: {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  theme: any;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: (width - scale(80)) / 2,
        borderRadius: moderateScale(16),
        padding: moderateScale(18),
        alignItems: 'center',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? theme.primary : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        backgroundColor: selected
          ? theme.primary + '15'
          : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
          },
          android: {
            elevation: selected ? 6 : 2,
          },
        }),
      }}
    >
      <View style={{
        width: scale(48),
        height: scale(48),
        borderRadius: moderateScale(24),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: selected ? theme.primary + '25' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        marginBottom: verticalScale(10),
      }}>
        {icon}
      </View>
      <Text style={{ fontSize: moderateScale(14), fontWeight: '800', color: theme.text, marginBottom: verticalScale(2) }}>{label}</Text>
      <Text style={{ fontSize: moderateScale(10), color: theme.textSecondary, textAlign: 'center' }}>{sublabel}</Text>
      {selected && (
        <View style={{ position: 'absolute', top: moderateScale(10), right: moderateScale(10) }}>
          <CheckCircle2 size={moderateScale(16)} color={theme.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, isDark, insets);

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [selectedPosition, setSelectedPosition] = useState<PlayerPosition>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const transitionTo = (nextStep: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

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
      metrics.trackUserRegistered('email');
      transitionTo(2);
    } catch (err: any) {
      const { Alert } = require('react-native');
      Alert.alert(t('auth.register_error_title'), err.message ?? t('auth.register_error_msg'));
    }
  };

  const handleFinish = () => {
    router.replace('/(auth)/auth-login' as any);
  };

  const getBackAction = () => {
    if (step === 1) return () => router.replace('/(auth)' as any);
    if (step === 2) return () => transitionTo(1);
    if (step === 3) return () => transitionTo(2);
    return () => {};
  };

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={GlobalStyles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={getBackAction()} style={styles.backButton}>
              <ChevronLeft size={moderateScale(28)} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.logoHeader}>TROFI</Text>
            <View style={{ width: scale(48) }} />
          </View>

          <StepIndicator currentStep={step} theme={theme} isDark={isDark} />

          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {step === 1 && (
                <>
                  <View style={styles.textSection}>
                    <Text style={styles.stepLabel}>{t('auth.step_indicator', { current: 1, total: TOTAL_STEPS })}</Text>
                    <Text style={[GlobalStyles.title, { color: theme.text }]}>{t('auth.register_title')}</Text>
                    <Text style={[GlobalStyles.subtitle, { color: theme.textSecondary }]}>
                      {t('auth.register_subtitle')}
                    </Text>
                  </View>

                  <FormInput control={control} name="username" label={t('auth.field_username')} placeholder={t('auth.field_username_placeholder')} required />
                  <FormInput control={control} name="email" label={t('auth.field_email')} placeholder={t('auth.field_email_placeholder')} keyboardType="email-address" required />

                  <View style={styles.row}>
                    <FormInput control={control} name="first_name" label={t('auth.field_first_name')} placeholder={t('auth.field_first_name_placeholder')} required containerStyle={styles.halfField} autoCapitalize="words" />
                    <FormInput control={control} name="last_name" label={t('auth.field_last_name')} placeholder={t('auth.field_last_name_placeholder')} required containerStyle={styles.halfField} autoCapitalize="words" />
                  </View>

                  <FormInput control={control} name="password" label={t('auth.field_password')} placeholder={t('auth.field_password_placeholder')} required isPassword />
                  <FormInput control={control} name="password2" label={t('auth.field_password2')} placeholder={t('auth.field_password2_placeholder')} required isPassword />

                  {isSubmitting ? (
                    <View style={styles.loadingWrapper}><ActivityIndicator color={theme.primary} size="large" /></View>
                  ) : (
                    <PrimaryButton title={t('auth.register_button')} onPress={handleSubmit(onSubmit)} fullWidth style={{ marginTop: verticalScale(10) }} />
                  )}

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{t('auth.already_have_account')}</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(auth)/auth-login' as any)}>
                    <Text style={styles.secondaryButtonText}>{t('auth.go_to_login')}</Text>
                  </TouchableOpacity>

                  <View style={styles.infoContainer}>
                    <Info size={moderateScale(16)} color={theme.textSecondary} />
                    <Text style={styles.infoText}>TROFI ELITE SPORTS MANAGEMENT - 2024</Text>
                  </View>
                </>
              )}

              {step === 2 && (
                <>
                  <View style={styles.textSection}>
                    <Text style={styles.stepLabel}>{t('auth.step_indicator', { current: 2, total: TOTAL_STEPS })}</Text>
                    <Text style={[GlobalStyles.title, { color: theme.text }]}>{t('auth.role_title')}</Text>
                    <Text style={[GlobalStyles.subtitle, { color: theme.textSecondary }]}>
                      {t('auth.role_subtitle')}
                    </Text>
                  </View>

                  <RoleCard
                    icon={<Swords size={moderateScale(26)} color={selectedRole === 'player' ? theme.primary : theme.textSecondary} />}
                    title={t('auth.role_player')}
                    description={t('auth.role_player_desc')}
                    perks={[t('auth.role_player_perk_1'), t('auth.role_player_perk_2'), t('auth.role_player_perk_3')]}
                    selected={selectedRole === 'player'}
                    onPress={() => setSelectedRole('player')}
                    theme={theme}
                    isDark={isDark}
                  />

                  <RoleCard
                    icon={<Eye size={moderateScale(26)} color={selectedRole === 'spectator' ? theme.primary : theme.textSecondary} />}
                    title={t('auth.role_spectator')}
                    description={t('auth.role_spectator_desc')}
                    perks={[t('auth.role_spectator_perk_1'), t('auth.role_spectator_perk_2'), t('auth.role_spectator_perk_3')]}
                    selected={selectedRole === 'spectator'}
                    onPress={() => setSelectedRole('spectator')}
                    theme={theme}
                    isDark={isDark}
                  />

                  <RoleCard
                    icon={<Trophy size={moderateScale(26)} color={selectedRole === 'admin' ? theme.primary : theme.textSecondary} />}
                    title={t('auth.role_admin')}
                    description={t('auth.role_admin_desc')}
                    perks={[t('auth.role_admin_perk_1'), t('auth.role_admin_perk_2'), t('auth.role_admin_perk_3')]}
                    selected={selectedRole === 'admin'}
                    onPress={() => setSelectedRole('admin')}
                    theme={theme}
                    isDark={isDark}
                  />

                  <PrimaryButton
                    title={t('auth.continue_btn')}
                    onPress={() => {
                      if (selectedRole === 'player') {
                        transitionTo(3);
                      } else {
                        handleFinish();
                      }
                    }}
                    fullWidth
                    style={{ marginTop: verticalScale(8), opacity: selectedRole ? 1 : 0.4 }}
                    disabled={!selectedRole}
                  />

                  <TouchableOpacity
                    style={[styles.secondaryButton, { marginTop: verticalScale(12) }]}
                    onPress={handleFinish}
                  >
                    <Text style={styles.secondaryButtonText}>{t('auth.skip_for_now')}</Text>
                  </TouchableOpacity>
                </>
              )}

              {step === 3 && (
                <>
                  <View style={styles.textSection}>
                    <Text style={styles.stepLabel}>{t('auth.step_indicator', { current: 3, total: TOTAL_STEPS })}</Text>
                    <Text style={[GlobalStyles.title, { color: theme.text }]}>{t('auth.position_title')}</Text>
                    <Text style={[GlobalStyles.subtitle, { color: theme.textSecondary }]}>
                      {t('auth.position_subtitle')}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: scale(12), marginBottom: verticalScale(24) }}>
                    <PositionCard
                      label={t('auth.pos_goalkeeper')}
                      sublabel={t('auth.pos_goalkeeper_sub')}
                      icon={<Shield size={moderateScale(22)} color={selectedPosition === 'goalkeeper' ? theme.primary : theme.textSecondary} />}
                      selected={selectedPosition === 'goalkeeper'}
                      onPress={() => setSelectedPosition('goalkeeper')}
                      theme={theme}
                      isDark={isDark}
                    />
                    <PositionCard
                      label={t('auth.pos_defender')}
                      sublabel={t('auth.pos_defender_sub')}
                      icon={<Users size={moderateScale(22)} color={selectedPosition === 'defender' ? theme.primary : theme.textSecondary} />}
                      selected={selectedPosition === 'defender'}
                      onPress={() => setSelectedPosition('defender')}
                      theme={theme}
                      isDark={isDark}
                    />
                    <PositionCard
                      label={t('auth.pos_midfielder')}
                      sublabel={t('auth.pos_midfielder_sub')}
                      icon={<Star size={moderateScale(22)} color={selectedPosition === 'midfielder' ? theme.primary : theme.textSecondary} />}
                      selected={selectedPosition === 'midfielder'}
                      onPress={() => setSelectedPosition('midfielder')}
                      theme={theme}
                      isDark={isDark}
                    />
                    <PositionCard
                      label={t('auth.pos_forward')}
                      sublabel={t('auth.pos_forward_sub')}
                      icon={<Swords size={moderateScale(22)} color={selectedPosition === 'forward' ? theme.primary : theme.textSecondary} />}
                      selected={selectedPosition === 'forward'}
                      onPress={() => setSelectedPosition('forward')}
                      theme={theme}
                      isDark={isDark}
                    />
                  </View>

                  <View style={{
                    borderRadius: moderateScale(16),
                    padding: moderateScale(18),
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    marginBottom: verticalScale(24),
                  }}>
                    <Text style={{ fontSize: moderateScale(13), fontWeight: '700', color: theme.textSecondary, marginBottom: verticalScale(4) }}>
                      {t('auth.coming_soon')}
                    </Text>
                    <Text style={{ fontSize: moderateScale(14), color: theme.text, fontWeight: '600' }}>
                      {t('auth.team_coming_soon_text')}
                    </Text>
                  </View>

                  <PrimaryButton
                    title={t('auth.finish_btn')}
                    onPress={handleFinish}
                    fullWidth
                    style={{ marginTop: 0 }}
                  />

                  <TouchableOpacity
                    style={[styles.secondaryButton, { marginTop: verticalScale(12) }]}
                    onPress={handleFinish}
                  >
                    <Text style={styles.secondaryButtonText}>{t('auth.skip_for_now')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean, insets: any) =>
  StyleSheet.create({
    keyboardView: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(20),
      height: verticalScale(60),
    },
    backButton: {
      width: scale(48),
      height: scale(48),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: moderateScale(24),
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    logoHeader: {
      fontSize: moderateScale(22),
      fontWeight: "900",
      color: theme.primary,
      letterSpacing: 2,
      fontStyle: "italic",
    },
    scrollContent: {
      paddingHorizontal: scale(30),
      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(50),
    },
    textSection: { marginBottom: verticalScale(28) },
    stepLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.primary,
      letterSpacing: 1.5,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 0,
    },
    halfField: { flex: 1 },
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
      height: 52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    },
    secondaryButtonText: {
      color: theme.textSecondary,
      fontSize: 14,
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
