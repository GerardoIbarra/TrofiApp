import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, isDark, insets);

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <SafeAreaView style={GlobalStyles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Aviso de Privacidad</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.contentBox}>
            <Text style={styles.lastUpdated}>Última actualización: Septiembre 2024</Text>
            
            <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
            <Text style={styles.paragraph}>
              Podemos recopilar varios tipos de información de los usuarios de Trofi, incluyendo:
              {'\n'}- Información personal (nombre, dirección de correo electrónico, etc.) proporcionada al crear una cuenta.
              {'\n'}- Información de ubicación para mostrar canchas, ligas y partidos (retas) cercanos, si usted nos otorga permiso explícito.
              {'\n'}- Datos de uso de la aplicación, como interacciones con otros usuarios o estadísticas deportivas.
            </Text>

            <Text style={styles.sectionTitle}>2. Uso de la Información</Text>
            <Text style={styles.paragraph}>
              Utilizamos la información recopilada para:
              {'\n'}- Proveer, mantener y mejorar la Aplicación.
              {'\n'}- Personalizar su experiencia y mostrarle contenido relevante (ej. partidos en su ciudad).
              {'\n'}- Facilitar la comunicación entre usuarios a través de la función de chat.
              {'\n'}- Enviar notificaciones y actualizaciones de servicio.
            </Text>

            <Text style={styles.sectionTitle}>3. Intercambio de Información</Text>
            <Text style={styles.paragraph}>
              No compartimos su información personal con terceros para fines comerciales sin su consentimiento, excepto:
              {'\n'}- Cuando sea necesario para cumplir con la ley.
              {'\n'}- Proveedores de servicios que nos ayudan a operar la Aplicación (ej. alojamiento web, análisis de datos).
              {'\n'}- Con otros usuarios de la plataforma según la configuración de privacidad de su perfil.
            </Text>

            <Text style={styles.sectionTitle}>4. Seguridad</Text>
            <Text style={styles.paragraph}>
              Tomamos medidas razonables para proteger su información personal contra pérdida, robo, mal uso y acceso no autorizado. Sin embargo, ningún sistema de transmisión de datos por Internet es 100% seguro.
            </Text>
            
            <Text style={styles.sectionTitle}>5. Derechos del Usuario</Text>
            <Text style={styles.paragraph}>
              Usted tiene derecho a solicitar acceso a su información personal, corregirla o solicitar su eliminación en cualquier momento desde los ajustes de la aplicación.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean, insets: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      height: 60,
    },
    backButton: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 50,
    },
    contentBox: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
    },
    lastUpdated: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 24,
      fontStyle: 'italic',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
      marginTop: 20,
    },
    paragraph: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 22,
    },
  });
