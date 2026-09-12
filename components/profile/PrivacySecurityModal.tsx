import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  X,
  Shield,
  Lock,
  Bell,
  Trash2,
  Database,
  CheckCircle,
  FileText,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { router } from 'expo-router';
import { queryClient } from '@/services/queryClient';

interface PrivacySecurityModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenNotifications?: () => void;
}

export const PrivacySecurityModal = React.memo(function PrivacySecurityModal({
  visible,
  onClose,
  onOpenNotifications,
}: PrivacySecurityModalProps) {
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const styles = createStyles(theme, isDark);
  const isEn = i18n.language === 'en';

  const handleClearCache = () => {
    Alert.alert(
      isEn ? 'Clear Cache' : 'Limpiar Caché',
      isEn
        ? 'Are you sure you want to clear locally cached data?'
        : '¿Estás seguro de que deseas limpiar los datos locales en caché?',
      [
        { text: isEn ? 'Cancel' : 'Cancelar', style: 'cancel' },
        {
          text: isEn ? 'Clear' : 'Limpiar',
          style: 'destructive',
          onPress: () => {
            queryClient.clear();
            Alert.alert(
              isEn ? 'Cache Cleared' : 'Caché Limpia',
              isEn
                ? 'Local temporary cache has been reset.'
                : 'La memoria caché local se ha restablecido correctamente.'
            );
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      isEn ? 'Account Deletion Request' : 'Solicitud de Eliminación de Cuenta',
      isEn
        ? 'To permanently delete your account and all associated player data per privacy guidelines, contact support at soporte@trofi.club or request deletion from your account settings.'
        : 'Para eliminar permanentemente tu cuenta y todos los datos asociados conforme a las políticas de privacidad, envía un correo a soporte@trofi.club o confirma con soporte de Trofi.',
      [{ text: 'OK' }]
    );
  };

  const handleChangePassword = () => {
    onClose();
    router.push('/(tabs)/change-password' as any);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <BackgroundGradient />
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {isEn ? 'PRIVACY & SECURITY' : 'PRIVACIDAD Y SEGURIDAD'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEn ? 'Data protection and credentials' : 'Protección de datos y credenciales'}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* VISIBILIDAD DE DATOS */}
          <Text style={styles.sectionHeader}>
            {isEn ? 'DATA VISIBILITY' : 'VISIBILIDAD DE DATOS'}
          </Text>
          <View style={styles.cardGroup}>
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Shield size={20} color={theme.primary} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.rowTitle}>
                  {isEn ? 'Public Player Card' : 'Ficha Pública de Jugador'}
                </Text>
                <Text style={styles.rowSubtitle}>
                  {isEn
                    ? 'Your athletic stats, matches, and team affiliations are visible to players and tournament organizers.'
                    : 'Tus estadísticas deportivas, partidos y afiliaciones de equipo son visibles para jugadores y organizadores.'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <CheckCircle size={20} color="#10B981" />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.rowTitle}>
                  {isEn ? 'Encrypted Connection' : 'Conexión Cifrada'}
                </Text>
                <Text style={styles.rowSubtitle}>
                  {isEn
                    ? 'All communications with Trofi servers are encrypted via HTTPS / TLS 1.3.'
                    : 'Todas las comunicaciones con los servidores de Trofi viajan cifradas con HTTPS / TLS 1.3.'}
                </Text>
              </View>
            </View>
          </View>

          {/* ACCIONES DE SEGURIDAD */}
          <Text style={styles.sectionHeader}>
            {isEn ? 'ACCOUNT SECURITY' : 'SEGURIDAD DE LA CUENTA'}
          </Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={handleChangePassword}
            >
              <View style={styles.iconCircle}>
                <Lock size={18} color={theme.primary} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.rowTitle}>
                  {isEn ? 'Change Password' : 'Cambiar Contraseña'}
                </Text>
                <Text style={styles.rowSubtitle}>
                  {isEn
                    ? 'Update your access password regularly.'
                    : 'Actualiza tu contraseña de acceso periódicamente.'}
                </Text>
              </View>
            </TouchableOpacity>

            {onOpenNotifications && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onOpenNotifications();
                  }}
                >
                  <View style={styles.iconCircle}>
                    <Bell size={18} color={theme.primary} />
                  </View>
                  <View style={styles.textColumn}>
                    <Text style={styles.rowTitle}>
                      {isEn ? 'Notification Alerts' : 'Alertas de Notificaciones'}
                    </Text>
                    <Text style={styles.rowSubtitle}>
                      {isEn
                        ? 'Configure push and email notification channels.'
                        : 'Configura canales de notificación push y correo.'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* ALMACENAMIENTO Y CUENTA */}
          <Text style={styles.sectionHeader}>
            {isEn ? 'STORAGE & ACCOUNT' : 'ALMACENAMIENTO Y CUENTA'}
          </Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={handleClearCache}
            >
              <View style={styles.iconCircle}>
                <Database size={18} color={theme.textSecondary} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.rowTitle}>
                  {isEn ? 'Clear Local Cache' : 'Limpiar Caché Local'}
                </Text>
                <Text style={styles.rowSubtitle}>
                  {isEn
                    ? 'Frees temporary storage and re-downloads fresh tournament data.'
                    : 'Libera memoria temporal y descarga datos actualizados de torneos.'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={handleDeleteAccount}
            >
              <View style={styles.iconCircle}>
                <Trash2 size={18} color="#EF4444" />
              </View>
              <View style={styles.textColumn}>
                <Text style={[styles.rowTitle, { color: '#EF4444' }]}>
                  {isEn ? 'Delete Account' : 'Eliminar Cuenta'}
                </Text>
                <Text style={styles.rowSubtitle}>
                  {isEn
                    ? 'Request permanent removal of your account and personal data.'
                    : 'Solicita la baja definitiva de tu cuenta y datos personales.'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
});

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 54,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
    },
    closeBtn: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 1,
      color: theme.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    sectionHeader: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
      color: theme.textSecondary,
      marginTop: 20,
      marginBottom: 10,
    },
    cardGroup: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.03)'
        : 'rgba(0, 0, 0, 0.02)',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.05)',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 6,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 8,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.04)',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    textColumn: {
      flex: 1,
    },
    rowTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 3,
    },
    rowSubtitle: {
      fontSize: 12,
      lineHeight: 17,
      color: theme.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.04)',
      marginVertical: 8,
    },
  });
