import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Info } from 'lucide-react-native';
import { router } from 'expo-router';
import { TrofiTheme } from '@/constants/theme';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[TrofiTheme.background, '#0D1B2A']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={28} color={TrofiTheme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Trofi</Text>
            <View style={{ width: 28 }} /> {/* Balancer */}
          </View>

          <View style={styles.content}>
            <View style={styles.textSection}>
              <Text style={styles.title}>Bienvenidos</Text>
              <Text style={styles.subtitle}>Ingresa tus datos para continuar al campo.</Text>
            </View>

            {/* Input Section */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>NÚMERO DE TELÉFONO</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.countryCode}>+52</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000 000 0000"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => router.push('/dashboard')}
            >
              <LinearGradient
                colors={[TrofiTheme.primary, '#00D1FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Continuar</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Info size={16} color={TrofiTheme.textSecondary} />
              <Text style={styles.infoText}>TROFI ELITE SPORTS MANAGEMENT - 2024</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: TrofiTheme.primary,
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
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: TrofiTheme.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: TrofiTheme.textSecondary,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: TrofiTheme.textSecondary,
    marginBottom: 10,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    height: 60,
  },
  countryCode: {
    fontSize: 18,
    color: TrofiTheme.text,
    marginRight: 15,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: TrofiTheme.text,
    height: '100%',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#001A2C',
    fontSize: 18,
    fontWeight: '800',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: TrofiTheme.textSecondary,
    marginHorizontal: 15,
    fontSize: 14,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  secondaryButtonText: {
    color: TrofiTheme.text,
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
    color: TrofiTheme.textSecondary,
    letterSpacing: 0.5,
  },
});
