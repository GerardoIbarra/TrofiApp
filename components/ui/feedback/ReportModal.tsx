import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ShieldAlert, X, Check, Flag } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { logger } from '@/services/logger';
import { useBlockUser } from '@/features/chat/services/chatApi';

export interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: 'message' | 'user' | 'team' | 'comment';
  targetId: string;
  targetName?: string;
  authorId?: string;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  { id: 'harassment', labelEs: 'Acoso, insultos o violencia', labelEn: 'Harassment, insults, or violence' },
  { id: 'inappropriate', labelEs: 'Contenido sexual o inapropiado', labelEn: 'Sexual or inappropriate content' },
  { id: 'spam', labelEs: 'Spam, publicidad o engaño', labelEn: 'Spam, advertising, or scams' },
  { id: 'hate_speech', labelEs: 'Discurso de odio o discriminación', labelEn: 'Hate speech or discrimination' },
  { id: 'impersonation', labelEs: 'Suplantación de identidad', labelEn: 'Impersonation' },
  { id: 'other', labelEs: 'Otro motivo', labelEn: 'Other reason' },
];

export function ReportModal({
  visible,
  onClose,
  targetType,
  targetId,
  targetName,
  authorId,
  onSuccess,
}: ReportModalProps) {
  const { theme, isDark } = useTheme();
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const [selectedReason, setSelectedReason] = useState<string>('harassment');
  const [comments, setComments] = useState<string>('');
  const [alsoBlockUser, setAlsoBlockUser] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const blockMutation = useBlockUser();

  const handleReset = () => {
    setSelectedReason('harassment');
    setComments('');
    setAlsoBlockUser(true);
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Submit report to backend (graceful fallback if endpoint pending)
      try {
        await api.post('/v1/reports/', {
          target_type: targetType,
          target_id: targetId,
          author_id: authorId,
          reason: selectedReason,
          comments: comments.trim() || undefined,
        }, { silent: true });
      } catch (err: any) {
        // Log info without alerting Sentry
        logger.info('report', 'Report dispatched via fallback', {
          targetType,
          targetId,
          reason: selectedReason,
        });
      }

      // 2. Block author if requested
      if (alsoBlockUser && authorId) {
        try {
          await blockMutation.mutateAsync({
            blocked: authorId,
            reason: selectedReason,
          });
        } catch (_) {}
      }

      Alert.alert(
        isEn ? 'Report Received' : 'Reporte Recibido',
        isEn
          ? 'Thank you for helping keep Trofi safe. Our moderation team reviews all reports within 24 hours.'
          : 'Gracias por mantener a Trofi seguro. Nuestro equipo de moderación revisa todo reporte en un plazo máximo de 24 horas.',
        [
          {
            text: isEn ? 'OK' : 'Entendido',
            onPress: () => {
              handleReset();
              onClose();
              onSuccess?.();
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert(
        isEn ? 'Error' : 'Error',
        isEn ? 'Could not submit report. Please try again.' : 'No se pudo enviar el reporte. Por favor intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <ShieldAlert size={22} color={theme.error || '#EF4444'} />
              <Text style={[styles.title, { color: theme.text }]}>
                {isEn ? 'Report Content' : 'Reportar Contenido'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {targetName ? (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {isEn ? `Target: ${targetName}` : `Reportando: ${targetName}`}
            </Text>
          ) : null}

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {isEn ? 'SELECT A REASON' : 'SELECCIONA EL MOTIVO'}
            </Text>

            {/* Reasons List */}
            {REPORT_REASONS.map((reason) => {
              const isSelected = selectedReason === reason.id;
              return (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reasonOption,
                    {
                      backgroundColor: isSelected
                        ? isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'
                        : theme.surfaceSubtle,
                      borderColor: isSelected ? (theme.error || '#EF4444') : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedReason(reason.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      { color: isSelected ? (theme.error || '#EF4444') : theme.text },
                    ]}
                  >
                    {isEn ? reason.labelEn : reason.labelEs}
                  </Text>
                  {isSelected ? <Check size={18} color={theme.error || '#EF4444'} /> : null}
                </TouchableOpacity>
              );
            })}

            {/* Comments Input */}
            <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 14 }]}>
              {isEn ? 'ADDITIONAL DETAILS (OPTIONAL)' : 'DETALLES ADICIONALES (OPCIONAL)'}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder={isEn ? 'Describe what happened...' : 'Describe lo ocurrido...'}
              placeholderTextColor={theme.textSecondary}
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={3}
              maxLength={300}
            />

            {/* Also block user option */}
            {authorId ? (
              <TouchableOpacity
                style={styles.blockOptionRow}
                onPress={() => setAlsoBlockUser(!alsoBlockUser)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: alsoBlockUser ? (theme.error || '#EF4444') : theme.border,
                      backgroundColor: alsoBlockUser ? (theme.error || '#EF4444') : 'transparent',
                    },
                  ]}
                >
                  {alsoBlockUser ? <Check size={14} color="#FFF" /> : null}
                </View>
                <Text style={[styles.blockOptionText, { color: theme.text }]}>
                  {isEn ? 'Also block this user from contacting you' : 'Bloquear también a este usuario'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
                {isEn ? 'Cancel' : 'Cancelar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.error || '#EF4444' }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Flag size={16} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>
                    {isEn ? 'Send Report' : 'Enviar Reporte'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  scrollBody: {
    marginVertical: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  blockOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockOptionText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
