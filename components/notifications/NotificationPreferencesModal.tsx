import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Bell,
  Mail,
  MessageSquare,
  Shield,
  Trophy,
  Calendar,
  Flame,
  Tag,
  CheckCircle,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import {
  useGetNotificationPreferences,
  useSaveNotificationPreferences,
} from '@/features/notifications/services/notificationPreferencesApi';
import { NotificationPreferences } from '@/features/notifications/types/notificationPreferences';

interface NotificationPreferencesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationPreferencesModal({
  visible,
  onClose,
}: NotificationPreferencesModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const { data: prefs, isLoading } = useGetNotificationPreferences();
  const saveMutation = useSaveNotificationPreferences();

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return;
    saveMutation.mutate({
      ...prefs,
      [key]: value,
    });
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
            <Text style={styles.headerTitle}>NOTIFICACIONES</Text>
            <Text style={styles.headerSubtitle}>Preferencias de alertas</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* CANALES DE ENTREGA */}
            <Text style={styles.sectionHeader}>CANALES DE ENTREGA</Text>
            <View style={styles.cardGroup}>
              <PreferenceRow
                icon={<Bell size={18} color={theme.primary} />}
                title="Notificaciones Push"
                subtitle="Alertas inmediatas en la pantalla de tu móvil."
                value={prefs?.push_enabled ?? true}
                onValueChange={(val) => handleToggle('push_enabled', val)}
                theme={theme}
                isDark={isDark}
              />
              <View style={styles.divider} />
              <PreferenceRow
                icon={<Mail size={18} color={theme.textSecondary} />}
                title="Correo Electrónico"
                subtitle="Boletines y resúmenes semanales de tus ligas."
                value={prefs?.email_enabled ?? false}
                onValueChange={(val) => handleToggle('email_enabled', val)}
                theme={theme}
                isDark={isDark}
              />
              <View style={styles.divider} />
              <PreferenceRow
                icon={<MessageSquare size={18} color={theme.textSecondary} />}
                title="Mensajes SMS"
                subtitle="Avisos críticos y cambios de sede de última hora."
                value={prefs?.sms_enabled ?? false}
                onValueChange={(val) => handleToggle('sms_enabled', val)}
                theme={theme}
                isDark={isDark}
              />
            </View>

            {/* ALERTAS DEPORTIVAS */}
            <Text style={styles.sectionHeader}>ALERTAS DEPORTIVAS</Text>
            <View style={styles.cardGroup}>
              <PreferenceRow
                icon={<Calendar size={18} color="#00F5FF" />}
                title="Recordatorios de Partido"
                subtitle="Avisos de próximos partidos y solicitud de asistencia."
                value={prefs?.match_reminders ?? true}
                onValueChange={(val) => handleToggle('match_reminders', val)}
                theme={theme}
                isDark={isDark}
              />
              <View style={styles.divider} />
              <PreferenceRow
                icon={<Shield size={18} color="#10B981" />}
                title="Actualizaciones de Equipo"
                subtitle="Convocatorias, alineaciones y movimientos de plantilla."
                value={prefs?.team_updates ?? true}
                onValueChange={(val) => handleToggle('team_updates', val)}
                theme={theme}
                isDark={isDark}
              />
              <View style={styles.divider} />
              <PreferenceRow
                icon={<Trophy size={18} color="#F59E0B" />}
                title="Actualizaciones de Torneo"
                subtitle="Tablas de posiciones, resultados y programación de fechas."
                value={prefs?.tournament_updates ?? true}
                onValueChange={(val) => handleToggle('tournament_updates', val)}
                theme={theme}
                isDark={isDark}
              />
              <View style={styles.divider} />
              <PreferenceRow
                icon={<Trophy size={18} color="#8B5CF6" />}
                title="Actualizaciones de Liga"
                subtitle="Boletines oficiales, circulares y suspensiones."
                value={prefs?.league_updates ?? true}
                onValueChange={(val) => handleToggle('league_updates', val)}
                theme={theme}
                isDark={isDark}
              />
              <View style={styles.divider} />
              <PreferenceRow
                icon={<Flame size={18} color="#EC4899" />}
                title="Retas y Pickups"
                subtitle="Avisos de retas cercanas, trending y desafíos de crew."
                value={prefs?.pickup_updates ?? true}
                onValueChange={(val) => handleToggle('pickup_updates', val)}
                theme={theme}
                isDark={isDark}
              />
            </View>

            {/* COMUNICACIONES GENERALES */}
            <Text style={styles.sectionHeader}>COMUNICACIONES GENERALES</Text>
            <View style={styles.cardGroup}>
              <PreferenceRow
                icon={<Tag size={18} color={theme.textSecondary} />}
                title="Noticias y Promociones"
                subtitle="Novedades de la plataforma, beneficios de sponsors y eventos."
                value={prefs?.marketing ?? false}
                onValueChange={(val) => handleToggle('marketing', val)}
                theme={theme}
                isDark={isDark}
              />
            </View>

            {saveMutation.isPending && (
              <View style={styles.savingRow}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={styles.savingText}>Guardando cambios...</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function PreferenceRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  theme,
  isDark,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  theme: any;
  isDark: boolean;
}) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.iconBox}>{icon}</View>
      <View style={rowStyles.infoBox}>
        <Text style={[rowStyles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[rowStyles.subtitle, { color: theme.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: isDark ? '#374151' : '#E5E7EB',
          true: theme.primary,
        }}
        thumbColor={value ? '#001A2C' : '#9CA3AF'}
      />
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoBox: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 16,
  },
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
      paddingTop: 50,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: '900',
      color: theme.text,
      letterSpacing: 0.5,
    },
    headerSubtitle: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 1,
      marginBottom: 10,
      marginTop: 15,
      paddingHorizontal: 4,
    },
    cardGroup: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
    },
    divider: {
      height: 1,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.04)',
      marginHorizontal: 16,
    },
    savingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 20,
    },
    savingText: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: '600',
    },
  });
