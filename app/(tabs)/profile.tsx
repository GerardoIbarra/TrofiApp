import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { LayoutHeader } from '@/components/LayoutHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrofiTheme } from '@/constants/theme';
import { Settings, LogOut, ChevronRight, Award, Shield, User } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={GlobalStyles.safeArea}>
        <LayoutHeader />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.webContainer}>
            {/* User Info Header */}
            <View style={styles.profileHeader}>
              <Image 
                source={{ uri: 'https://i.pravatar.cc/150?u=luis' }} 
                style={styles.avatar} 
              />
              <Text style={styles.userName}>LUIS GARCÍA</Text>
              <Text style={styles.userRole}>CENTRODELANTERO • TROFI LEGENDS</Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <StatItem label="GOLES" value="14" />
              <StatItem label="MINTURAS" value="1.2k" />
              <StatItem label="MVPs" value="5" />
            </View>

            {/* Menu Items */}
            <View style={styles.sectionHeader}>
              <Text style={GlobalStyles.sectionTitle}>CONFIGURACIÓN</Text>
            </View>

            <MenuItem icon={<User size={20} color={TrofiTheme.primary} />} label="Mi Cuenta" />
            <MenuItem icon={<Award size={20} color={TrofiTheme.primary} />} label="Logros y Trofeos" />
            <MenuItem icon={<Shield size={20} color={TrofiTheme.primary} />} label="Privacidad y Seguridad" />
            <MenuItem icon={<Settings size={20} color={TrofiTheme.primary} />} label="Ajustes de la App" />

            <TouchableOpacity style={styles.logoutButton}>
              <LogOut size={20} color={TrofiTheme.error} />
              <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
      <View style={styles.menuIconText}>
        {icon}
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <ChevronRight size={18} color={TrofiTheme.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 110,
  },
  webContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: TrofiTheme.primary,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: TrofiTheme.text,
    letterSpacing: 1,
  },
  userRole: {
    fontSize: 10,
    fontWeight: '700',
    color: TrofiTheme.primary,
    letterSpacing: 1,
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: TrofiTheme.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: TrofiTheme.text,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: TrofiTheme.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: TrofiTheme.surface,
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TrofiTheme.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    padding: 15,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: TrofiTheme.error,
    letterSpacing: 1,
  },
});
