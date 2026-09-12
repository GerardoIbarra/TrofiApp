import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Megaphone, X, Send } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import {
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from '@/features/announcements/services/announcementsApi';
import { Announcement } from '@/features/announcements/types/announcement';

interface CreateAnnouncementModalProps {
  visible: boolean;
  onClose: () => void;
  leagueId?: string;
  tournamentId?: string;
  initialData?: Announcement | null;
}

export function CreateAnnouncementModal({
  visible,
  onClose,
  leagueId,
  tournamentId,
  initialData,
}: CreateAnnouncementModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();

  const isEditing = Boolean(initialData);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setBody(initialData.body);
    } else {
      setTitle('');
      setBody('');
    }
  }, [initialData, visible]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa un título para el aviso.');
      return;
    }
    if (!body.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa el contenido del aviso.');
      return;
    }

    try {
      if (isEditing && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: { title: title.trim(), body: body.trim() },
          leagueId,
          tournamentId,
        });
        Alert.alert('¡Aviso actualizado!', 'Las modificaciones se han guardado.');
      } else {
        await createMutation.mutateAsync({
          title: title.trim(),
          body: body.trim(),
          league: leagueId,
          tournament: tournamentId,
        });
        Alert.alert('¡Aviso publicado!', 'Se ha transmitido a todos los miembros y seguidores.');
      }
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo publicar el aviso.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={styles.iconCircle}>
                <Megaphone size={18} color="#001A2C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  {isEditing ? 'Editar Aviso' : 'Nuevo Aviso Oficial'}
                </Text>
                <Text style={styles.subtitle}>
                  {leagueId ? 'Transmisión a la Liga' : 'Transmisión al Torneo'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={isSubmitting}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>TÍTULO DEL AVISO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Cambio de sede — Fecha 9"
              placeholderTextColor={theme.textSecondary + '77'}
              value={title}
              onChangeText={setTitle}
              maxLength={120}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>MENSAJE / COMUNICADO</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escribe el mensaje oficial que recibirán los participantes..."
              placeholderTextColor={theme.textSecondary + '77'}
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Notice */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Este aviso generará una notificación inmediata (+ push) para todos los miembros registrados.
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#001A2C" />
            ) : (
              <>
                <Send size={16} color="#001A2C" />
                <Text style={styles.submitBtnText}>
                  {isEditing ? 'Guardar Cambios' : 'Publicar Comunicado'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalCard: {
      width: '100%',
      maxWidth: 460,
      backgroundColor: theme.surface,
      borderRadius: 22,
      padding: 20,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      gap: 14,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
    },
    subtitle: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    closeBtn: {
      padding: 6,
    },
    formGroup: {
      gap: 6,
    },
    label: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: theme.textSecondary,
    },
    input: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: theme.text,
      fontSize: 13,
    },
    textArea: {
      minHeight: 100,
    },
    infoBox: {
      padding: 10,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    infoText: {
      fontSize: 10,
      color: theme.textSecondary,
      lineHeight: 14,
    },
    submitBtn: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 4,
    },
    submitBtnText: {
      fontSize: 13,
      fontWeight: '900',
      color: '#001A2C',
    },
  });
