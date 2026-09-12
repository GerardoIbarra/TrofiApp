import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import { Trophy, MapPin, Users, Activity } from 'lucide-react-native';

import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const slides = [
    {
      id: '1',
      title: t('onboarding.slide1_title', 'Bienvenido a Trofi'),
      description: t('onboarding.slide1_desc', 'La red social diseñada para conectar jugadores, equipos y ligas.'),
      icon: (color: string) => <Trophy size={80} color={color} strokeWidth={1.5} />,
    },
    {
      id: '2',
      title: t('onboarding.slide2_title', 'Encuentra Retas'),
      description: t('onboarding.slide2_desc', 'Descubre partidos y canchas cerca de ti en nuestro mapa interactivo.'),
      icon: (color: string) => <MapPin size={80} color={color} strokeWidth={1.5} />,
    },
    {
      id: '3',
      title: t('onboarding.slide3_title', 'Arma tu Equipo'),
      description: t('onboarding.slide3_desc', 'Invita a tus amigos, gestiona alineaciones y encuentra nuevos talentos en el mercado.'),
      icon: (color: string) => <Users size={80} color={color} strokeWidth={1.5} />,
    },
    {
      id: '4',
      title: t('onboarding.slide4_title', 'Sigue tus Estadísticas'),
      description: t('onboarding.slide4_desc', 'Registra tus goles, asistencias y conviértete en el MVP de la temporada.'),
      icon: (color: string) => <Activity size={80} color={color} strokeWidth={1.5} />,
    }
  ];

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setCurrentIndex(currentIndex + 1);
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      });
    } else {
      await AsyncStorage.setItem('has_seen_onboarding', 'true');
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
    router.replace('/(tabs)');
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        
        <View style={styles.header}>
          {currentIndex < slides.length - 1 ? (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>{t('onboarding.skip', 'Saltar')}</Text>
            </TouchableOpacity>
          ) : <View />}
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              {currentSlide.icon(theme.primary)}
            </View>
          </View>
          
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.dot, 
                  currentIndex === index && styles.dotActive
                ]} 
              />
            ))}
          </View>
          
          <PrimaryButton 
            title={currentIndex === slides.length - 1 ? t('onboarding.start', 'Comenzar') : t('onboarding.next', 'Siguiente')} 
            onPress={handleNext} 
            fullWidth 
          />
        </View>

      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  skipText: {
    color: theme.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.primary,
  },
});
