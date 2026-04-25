import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Calendar, Trophy as ResultsIcon, Image as GalleryIcon, BarChart3 } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  FadeInDown,
  FadeIn
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

import { BackgroundGradient } from '@/components/BackgroundGradient';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { TrofyLogo } from '@/components/TrofyLogo';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const logoScale = useSharedValue(1);

  useEffect(() => {
    // 1. Ocultar el Splash Nativo una vez que JS toma el control
    setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 100);

    // 2. Iniciar el efecto de latido (Breathing)
    logoScale.value = withRepeat(
      withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={styles.content}>
          <Animated.View entering={FadeIn.duration(1500)} style={[styles.logoContainer, animatedLogoStyle]}>
            <View style={styles.iconCircle}>
              <TrofyLogo size={80} color={theme.primary} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).duration(800)} style={{ alignItems: 'center' }}>
            <Text style={styles.title}>TROFY</Text>
            <Text style={styles.subtitle}>TUS TORNEOS LOCALES</Text>
            <Text style={styles.tagline}>EN LA PALMA DE TU MANO</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1200).duration(800)} style={styles.grid}>
            <FeatureIcon icon={<Calendar size={24} color={theme.text} />} label="Programación" theme={theme} isDark={isDark} />
            <FeatureIcon icon={<ResultsIcon size={24} color={theme.text} />} label="Resultados" theme={theme} isDark={isDark} />
            <FeatureIcon icon={<GalleryIcon size={24} color={theme.text} />} label="Galería" theme={theme} isDark={isDark} />
            <FeatureIcon icon={<BarChart3 size={24} color={theme.text} />} label="Estadísticas" theme={theme} isDark={isDark} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1600).duration(800)} style={styles.actions}>
            <PrimaryButton 
              title="CREAR CUENTA" 
              onPress={() => router.push('/(auth)/register' as any)} 
              style={{ width: '100%', borderRadius: 28 }} 
            />
            <SecondaryButton 
              title="INICIAR SESIÓN" 
              onPress={() => router.push('/(auth)/login' as any)} 
              style={{ width: '100%', borderRadius: 28 }} 
            />
            <Text style={styles.footerText}>PROXIMO EVENTO: LIGA ZAPOPAN NORTE</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FeatureIcon({ icon, label, theme, isDark }: { icon: React.ReactNode, label: string, theme: any, isDark: boolean }) {
  const styles = createStyles(theme, isDark);
  return (
    <View style={styles.gridItem}>
      <View style={styles.gridIconContainer}>
        {icon}
      </View>
      <Text style={styles.gridLabel}>{label.toUpperCase()}</Text>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(0, 245, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(0, 245, 255, 0.3)' : 'rgba(0, 245, 255, 0.1)',
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: 2,
    marginTop: -5,
  },
  tagline: {
    fontSize: 12,
    color: theme.textSecondary,
    letterSpacing: 1,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    width: '100%',
    marginVertical: 40,
  },
  gridItem: {
    width: (width - 70) / 2,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  gridIconContainer: {
    marginBottom: 10,
  },
  gridLabel: {
    fontSize: 10,
    color: theme.text,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  actions: {
    width: '80%',
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: 10,
    color: theme.textSecondary,
    letterSpacing: 1,
    marginTop: 10,
  },
});
