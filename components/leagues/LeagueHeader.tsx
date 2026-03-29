import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Menu } from 'lucide-react-native';
import { TrofiTheme } from '@/constants/theme';

export function LeagueHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: '#16213E' }]}>
      {/* Imagen del Estadio Pexels (Directo) con expo-image */}
      <Image 
        source="https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1600" 
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={600}
        cachePolicy="disk"
      />
      
      {/* Capa de Gradiente para fusionar con el fondo */}
      <LinearGradient
        colors={['rgba(10, 25, 47, 0.2)', 'rgba(10, 25, 47, 0.6)', TrofiTheme.background]}
        style={styles.gradientOverlay}
      >
        {/* Navegación Superior */}
        <View style={[styles.topNav, { marginTop: insets.top }]}>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Menu size={24} color={TrofiTheme.primary} />
          </TouchableOpacity>
          <Text style={styles.logoText}>TROFI</Text>
          <TouchableOpacity>
            <Image 
              source="https://i.pravatar.cc/150?u=luis" 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>

        {/* Tag de Temporada */}
        <View style={styles.seasonTagContainer}>
          <View style={styles.liveTag}>
            <Text style={styles.liveText}>LIVE SEASON</Text>
          </View>
          <Text style={styles.leagueRegion}>ZAPOPAN REGIONAL LEAGUE</Text>
        </View>

        {/* Título Monumental */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleGiant}>ZAPOPAN</Text>
          <Text style={[styles.titleGiant, { color: TrofiTheme.primary }]}>NORTE</Text>
        </View>

        {/* Puntuación General / Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>TOTAL TEAMS</Text>
            <Text style={styles.statKpi}>16</Text>
          </View>
          <View style={styles.statLine}>
            <Text style={styles.statLabel}>ROUNDS LEFT</Text>
            <Text style={styles.statKpi}>04</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 380,
    backgroundColor: '#020610', // Fondo de seguridad mientras carga la imagen
  },
  gradientOverlay: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    paddingBottom: 25,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 15,
    left: 20,
    right: 20,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  seasonTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  liveTag: {
    backgroundColor: TrofiTheme.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  liveText: {
    color: TrofiTheme.background,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  leagueRegion: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  titleContainer: {
    marginBottom: 20,
  },
  titleGiant: {
    fontSize: 42,
    fontWeight: '900',
    color: TrofiTheme.text,
    lineHeight: 45,
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 30,
  },
  statLine: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  statKpi: {
    fontSize: 22,
    fontWeight: '800',
    color: TrofiTheme.text,
  },
});
