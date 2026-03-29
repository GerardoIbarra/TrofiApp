import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Calendar, Trophy as ResultsIcon, Image as GalleryIcon, BarChart3 } from 'lucide-react-native';
import { router } from 'expo-router';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { PrimaryButton } from '@/components/PrimaryButton';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { TrofiTheme } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      
      <SafeAreaView style={GlobalStyles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png' }}
                style={{ width: 65, height: 65, resizeMode: 'contain', tintColor: TrofiTheme.primary }}
              />
            </View>
            <Text style={styles.title}>TROFI</Text>
            <Text style={styles.subtitle}>TUS TORNEOS LOCALES</Text>
            <Text style={styles.tagline}>EN LA PALMA DE TU MANO</Text>
          </View>

          <View style={styles.grid}>
            <FeatureIcon icon={<Calendar size={24} color={TrofiTheme.text} />} label="Programación" />
            <FeatureIcon icon={<ResultsIcon size={24} color={TrofiTheme.text} />} label="Resultados" />
            <FeatureIcon icon={<GalleryIcon size={24} color={TrofiTheme.text} />} label="Galería" />
            <FeatureIcon icon={<BarChart3 size={24} color={TrofiTheme.text} />} label="Estadísticas" />
          </View>

          <PrimaryButton 
            title="EMPEZAR" 
            onPress={() => router.push('/login')} 
            style={{ width: '80%', borderRadius: 28 }} 
          />

          <Text style={styles.footerText}>PROXIMO EVENTO: LIGA ZAPOPAN NORTE</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FeatureIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <View style={styles.gridItem}>
      <View style={styles.gridIconContainer}>
        {icon}
      </View>
      <Text style={styles.gridLabel}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.3)',
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: TrofiTheme.text,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TrofiTheme.text,
    letterSpacing: 2,
    marginTop: -5,
  },
  tagline: {
    fontSize: 12,
    color: TrofiTheme.textSecondary,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gridIconContainer: {
    marginBottom: 10,
  },
  gridLabel: {
    fontSize: 10,
    color: TrofiTheme.text,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 10,
    color: TrofiTheme.textSecondary,
    letterSpacing: 1,
    marginTop: 20,
  },
});
