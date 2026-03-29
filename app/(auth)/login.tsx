import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Info } from 'lucide-react-native';
import { router } from 'expo-router';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { PrimaryButton } from '@/components/PrimaryButton';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

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
            <Text style={styles.headerTitle}>Trofi</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.content}>
            <View style={styles.textSection}>
              <Text style={[GlobalStyles.title, { color: theme.text }]}>Bienvenidos</Text>
              <Text style={[GlobalStyles.subtitle, { color: theme.textSecondary }]}>Ingresa tus datos para continuar al campo.</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>NÚMERO DE TELÉFONO</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.countryCode}>+52</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000 000 0000"
                  placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            <PrimaryButton 
              title="Continuar" 
              onPress={() => router.push('/(tabs)' as any)} 
              fullWidth
              style={{ marginTop: 10 }}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Info size={16} color={theme.textSecondary} />
              <Text style={styles.infoText}>TROFI ELITE SPORTS MANAGEMENT - 2024</Text>
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
    paddingHorizontal: 20,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.primary,
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  textSection: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textSecondary,
    marginBottom: 10,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 15,
    height: 60,
  },
  countryCode: {
    fontSize: 18,
    color: theme.text,
    marginRight: 15,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: theme.text,
    height: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    color: theme.textSecondary,
    marginHorizontal: 15,
    fontSize: 14,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
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
    marginTop: 'auto',
    marginBottom: 20,
    gap: 8,
  },
  infoText: {
    fontSize: 9,
    color: theme.textSecondary,
    letterSpacing: 0.5,
  },
});
