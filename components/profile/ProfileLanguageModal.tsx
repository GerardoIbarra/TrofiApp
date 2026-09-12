import React from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';

interface ProfileLanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLanguage: (lang: string) => void;
}

export const ProfileLanguageModal = React.memo(function ProfileLanguageModal({
  visible,
  onClose,
  onSelectLanguage,
}: ProfileLanguageModalProps) {
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const styles = createStyles(theme, isDark);
  const currentLanguage = i18n.language;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('profile.language')}</Text>

          <TouchableOpacity
            style={[
              styles.langOption,
              currentLanguage === 'es' && styles.langOptionSelected,
            ]}
            onPress={() => onSelectLanguage('es')}
          >
            <Text
              style={[
                styles.langOptionText,
                currentLanguage === 'es' && styles.langOptionTextSelected,
              ]}
            >
              Español
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langOption,
              currentLanguage === 'en' && styles.langOptionSelected,
            ]}
            onPress={() => onSelectLanguage('en')}
          >
            <Text
              style={[
                styles.langOptionText,
                currentLanguage === 'en' && styles.langOptionTextSelected,
              ]}
            >
              English
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      maxWidth: 320,
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    langOption: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    },
    langOptionSelected: {
      borderColor: theme.primary,
      backgroundColor: isDark ? 'rgba(0,245,255,0.08)' : 'rgba(0,163,172,0.08)',
    },
    langOptionText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.textSecondary,
      textAlign: 'center',
    },
    langOptionTextSelected: {
      color: theme.primary,
      fontWeight: '800',
    },
  });
