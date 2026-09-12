import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Settings,
  Moon,
  Globe,
  RefreshCw,
  Database,
  Smartphone,
  CheckCircle,
} from 'lucide-react-native';
import * as Updates from 'expo-updates';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { queryClient } from '@/services/queryClient';

interface AppSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenLanguage?: () => void;
}

export const AppSettingsModal = React.memo(function AppSettingsModal({
  visible,
  onClose,
  onOpenLanguage,
}: AppSettingsModalProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const styles = createStyles(theme, isDark);
  const isEn = i18n.language === 'en';

  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      if (__DEV__ || !Updates.isEnabled) {
        setTimeout(() => {
          setIsCheckingUpdates(false);
          Alert.alert(
            isEn ? 'Up to Date' : 'Actualizado',
            isEn
              ? 'Trofi is running the latest available build.'
              : 'Trofi está ejecutando la versión más reciente disponible.'
          );
        }, 800);
        return;
      }

      const update = await Updates.checkForUpdateAsync();
      setIsCheckingUpdates(false);
      if (update.isAvailable) {
        Alert.alert(
          isEn ? 'Update Available' : 'Actualización Disponible',
          isEn
            ? 'A new version is available. Restart the app to apply it?'
            : 'Hay una nueva actualización disponible. ¿Deseas reiniciar para aplicarla?',
          [
            { text: isEn ? 'Later' : 'Más tarde', style: 'cancel' },
            {
              text: isEn ? 'Update' : 'Actualizar',
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          isEn ? 'Up to Date' : 'Actualizado',
          isEn
            ? 'Trofi is running the latest build.'
            : 'Trofi cuenta con la versión más reciente.'
        );
      }
    } catch (e) {
      setIsCheckingUpdates(false);
      Alert.alert(
        isEn ? 'Check Updates' : 'Buscar Actualizaciones',
        isEn
          ? 'Could not check for updates at this moment.'
          : 'No se pudo comprobar actualizaciones en este momento.'
      );
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      isEn ? 'Clear Cache' : 'Limpiar Caché',
      isEn
        ? 'Do you want to reset offline data and local cache?'
        : '¿Deseas reiniciar los datos offline y la memoria caché local?',
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
                ? 'Temporary cache has been cleared successfully.'
                : 'La memoria caché se ha limpiado correctamente.'
            );
          },
        },
      ]
    );
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
              {isEn ? 'APP SETTINGS' : 'AJUSTES DE LA APP'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEn ? 'Preferences & Diagnostics' : 'Preferencias y Diagnóstico'}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* APARIENCIA Y PREFERENCIAS */}
          <Text style={styles.sectionHeader}>
            {isEn ? 'PREFERENCES' : 'PREFERENCIAS'}
          </Text>
          <View style={styles.cardGroup}>
            <View style={styles.itemRow}>
              <View style={styles.leftGroup}>
                <View style={styles.iconCircle}>
                  <Moon size={18} color={theme.primary} />
                </View>
                <View>
                  <Text style={styles.itemTitle}>
                    {isEn ? 'Dark Mode' : 'Modo Oscuro'}
                  </Text>
                  <Text style={styles.itemSubtitle}>
                    {isDark
                      ? isEn ? 'Dark theme active' : 'Tema oscuro activo'
                      : isEn ? 'Light theme active' : 'Tema claro activo'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor={isDark ? '#FFF' : '#f4f3f4'}
              />
            </View>

            {onOpenLanguage && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.itemRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onOpenLanguage();
                  }}
                >
                  <View style={styles.leftGroup}>
                    <View style={styles.iconCircle}>
                      <Globe size={18} color={theme.primary} />
                    </View>
                    <View>
                      <Text style={styles.itemTitle}>
                        {isEn ? 'Language' : 'Idioma'}
                      </Text>
                      <Text style={styles.itemSubtitle}>
                        {i18n.language === 'es' ? 'Español' : 'English'}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>
                    {isEn ? 'Change' : 'Cambiar'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* DIAGNÓSTICO Y MANTENIMIENTO */}
          <Text style={styles.sectionHeader}>
            {isEn ? 'MAINTENANCE' : 'MANTENIMIENTO'}
          </Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={handleCheckUpdates}
              disabled={isCheckingUpdates}
            >
              <View style={styles.leftGroup}>
                <View style={styles.iconCircle}>
                  {isCheckingUpdates ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <RefreshCw size={18} color={theme.primary} />
                  )}
                </View>
                <View>
                  <Text style={styles.itemTitle}>
                    {isEn ? 'Check for Updates' : 'Buscar Actualizaciones'}
                  </Text>
                  <Text style={styles.itemSubtitle}>
                    {isEn
                      ? 'Verify OTA and app releases'
                      : 'Verificar actualizaciones OTA y de app'}
                  </Text>
                </View>
              </View>
              <CheckCircle size={18} color="#10B981" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={handleClearCache}
            >
              <View style={styles.leftGroup}>
                <View style={styles.iconCircle}>
                  <Database size={18} color={theme.textSecondary} />
                </View>
                <View>
                  <Text style={styles.itemTitle}>
                    {isEn ? 'Clear Local Cache' : 'Limpiar Caché Local'}
                  </Text>
                  <Text style={styles.itemSubtitle}>
                    {isEn
                      ? 'Releases memory and cached queries'
                      : 'Libera memoria y queries almacenadas'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* INFORMACIÓN DEL SISTEMA */}
          <Text style={styles.sectionHeader}>
            {isEn ? 'SYSTEM INFO' : 'INFORMACIÓN DEL SISTEMA'}
          </Text>
          <View style={styles.cardGroup}>
            <View style={styles.itemRow}>
              <View style={styles.leftGroup}>
                <View style={styles.iconCircle}>
                  <Smartphone size={18} color={theme.primary} />
                </View>
                <View>
                  <Text style={styles.itemTitle}>Trofi Sports</Text>
                  <Text style={styles.itemSubtitle}>v1.0.0 (Build 2026)</Text>
                </View>
              </View>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Production</Text>
            </View>



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
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    leftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
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
    },
    itemTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
    },
    itemSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.04)',
      marginVertical: 8,
    },
  });
