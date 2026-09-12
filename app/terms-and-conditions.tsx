import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function TermsAndConditionsScreen() {
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
          <Text style={styles.headerTitle}>Términos y Condiciones</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.contentBox}>
            <Text style={styles.lastUpdated}>Última actualización: Septiembre 2024</Text>
            
            <Text style={styles.sectionTitle}>1. Aceptación de los Términos</Text>
            <Text style={styles.paragraph}>
              Al acceder y utilizar Trofi App ("la Aplicación"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de los términos, no podrá acceder a la Aplicación.
            </Text>

            <Text style={styles.sectionTitle}>2. Uso de la Aplicación</Text>
            <Text style={styles.paragraph}>
              La Aplicación es una plataforma para conectar jugadores, organizar partidos (retas) y gestionar ligas deportivas. Usted se compromete a utilizar la Aplicación únicamente para fines lícitos y de una manera que no infrinja los derechos de, restrinja o inhiba el uso y disfrute de la Aplicación por parte de terceros.
            </Text>

            <Text style={styles.sectionTitle}>3. Cuentas de Usuario</Text>
            <Text style={styles.paragraph}>
              Para utilizar ciertas funciones de la Aplicación, debe registrarse y crear una cuenta. Usted es responsable de mantener la confidencialidad de la información de su cuenta, incluida su contraseña. 
              {'\n\n'}
              Nos reservamos el derecho de rechazar el servicio, cancelar cuentas o eliminar contenido inapropiado a nuestra entera discreción.
            </Text>

            <Text style={styles.sectionTitle}>4. Contenido Generado por el Usuario</Text>
            <Text style={styles.paragraph}>
              Los usuarios pueden publicar contenido, incluyendo fotos de perfil, mensajes en chats y detalles de equipos. Usted conserva sus derechos sobre cualquier contenido que envíe, pero otorga a Trofi una licencia mundial, no exclusiva y libre de regalías para usar, reproducir y distribuir dicho contenido en relación con el funcionamiento de la Aplicación.
              {'\n\n'}
              Prohibimos estrictamente el contenido ofensivo, discriminatorio o que fomente la violencia. Trofi se reserva el derecho de eliminar cualquier contenido que viole estas reglas sin previo aviso.
            </Text>

            <Text style={styles.sectionTitle}>5. Renuncia de Garantías y Limitación de Responsabilidad</Text>
            <Text style={styles.paragraph}>
              La Aplicación se proporciona "tal cual" y "según disponibilidad". No garantizamos que el servicio será ininterrumpido o libre de errores.
              {'\n\n'}
              Trofi no se hace responsable por lesiones físicas, daños a la propiedad o disputas que puedan surgir durante los eventos, ligas o "retas" organizadas a través de la plataforma. La participación en actividades deportivas conlleva riesgos inherentes que el usuario asume voluntariamente.
            </Text>
            
            <Text style={styles.sectionTitle}>6. Modificaciones</Text>
            <Text style={styles.paragraph}>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigencia inmediatamente después de su publicación en la Aplicación.
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
