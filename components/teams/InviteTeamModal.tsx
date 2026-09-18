import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Linking,
  Alert,
} from 'react-native';
import { X, Share2, MessageCircle, Link, Check, Users, Clock, Shield } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { useCreateTeamInvitation, TeamInvitationResponse } from '@/features/teams/services/teamInvitationApi';
import { useTranslation } from 'react-i18next';

import * as Clipboard from 'expo-clipboard';
import { useToast } from '@/context/ToastContext';

interface InviteTeamModalProps {
  visible: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  tournamentId?: string;
}

export function InviteTeamModal({
  visible,
  onClose,
  teamId,
  teamName,
  tournamentId,
}: InviteTeamModalProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const styles = createStyles(theme, isDark);

  const createInviteMutation = useCreateTeamInvitation(teamId);
  const [inviteData, setInviteData] = useState<TeamInvitationResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible && teamId && !inviteData && !createInviteMutation.isPending) {
      createInviteMutation.mutate(
        tournamentId ? { tournament: tournamentId } : undefined,
        {
          onSuccess: (data) => {
            setInviteData(data);
          },
          onError: (err: any) => {
            Alert.alert(
              'Error',
              err?.message || 'Solo el capitán o administrador puede generar invitaciones.'
            );
          },
        }
      );
    }
  }, [visible, teamId]);

  const getPreformattedMessage = () => {
    if (!inviteData?.invite_url) return '';
    return `¡Únete a nuestro equipo ${teamName} en Trofi para ver el rol de juegos y estadísticas!\n\n${inviteData.invite_url}`;
  };

  const handleCopyLink = async () => {
    const text = getPreformattedMessage();
    if (!text) return;

    await Clipboard.setStringAsync(text);
    setCopied(true);
    showToast({
      type: 'success',
      title: 'Enlace copiado',
      message: 'Mensaje copiado al portapapeles listo para compartir.',
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = async () => {
    const text = getPreformattedMessage();
    if (!text) return;

    await Clipboard.setStringAsync(text);
    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
    const webUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch {
      await Share.share({ message: text });
    }
  };

  const handleNativeShare = async () => {
    const text = getPreformattedMessage();
    if (!text) return;
    try {
      await Share.share({
        title: `Invitación a ${teamName}`,
        message: text,
      });
    } catch (_) {}
  };

  const formattedExpiry = inviteData?.expires_at
    ? new Date(inviteData.expires_at).toLocaleDateString()
    : '7 días';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <BackgroundGradient />
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Users size={20} color={theme.primary} />
              <Text style={styles.title}>INVITAR JUGADORES</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Comparte este enlace en WhatsApp o redes. Quien lo abra entrará directamente a la plantilla de {teamName}.
          </Text>

          {createInviteMutation.isPending && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.loadingText}>Generando enlace único de invitación...</Text>
            </View>
          )}

          {inviteData && (
            <View style={styles.content}>
              <View style={styles.urlBox}>
                <Link size={16} color={theme.primary} style={{ marginRight: 8 }} />
                <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="middle">
                  {inviteData.invite_url}
                </Text>
              </View>

              <View style={styles.expiryRow}>
                <Clock size={14} color={theme.textSecondary} />
                <Text style={styles.expiryText}>Válido hasta el {formattedExpiry} (multiuso)</Text>
              </View>

              {/* Botón WhatsApp */}
              <TouchableOpacity
                style={styles.whatsAppBtn}
                onPress={handleShareWhatsApp}
                activeOpacity={0.8}
              >
                <MessageCircle size={20} color="#FFF" />
                <Text style={styles.whatsAppBtnText}>Compartir por WhatsApp</Text>
              </TouchableOpacity>

              {/* Botón Copiar al Portapapeles */}
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={handleCopyLink}
                activeOpacity={0.8}
              >
                {copied ? (
                  <>
                    <Check size={18} color="#10B981" />
                    <Text style={[styles.copyBtnText, { color: '#10B981' }]}>¡Copiado al portapapeles!</Text>
                  </>
                ) : (
                  <>
                    <Link size={18} color={theme.text} />
                    <Text style={styles.copyBtnText}>Copiar enlace con mensaje</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Botón Compartir Nativo */}
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleNativeShare}
                activeOpacity={0.8}
              >
                <Share2 size={18} color={theme.text} />
                <Text style={styles.shareBtnText}>Más opciones para compartir</Text>
              </TouchableOpacity>
            </View>
          )}

          {createInviteMutation.isError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                No se pudo generar el enlace. Asegúrate de tener permisos de capitán para este equipo.
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() =>
                  createInviteMutation.mutate(
                    tournamentId ? { tournament: tournamentId } : undefined
                  )
                }
              >
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: isDark ? '#0D1E3A' : '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: '900',
      color: theme.text,
      letterSpacing: 0.5,
    },
    closeBtn: {
      padding: 4,
    },
    subtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
      marginBottom: 20,
    },
    loadingBox: {
      alignItems: 'center',
      paddingVertical: 32,
      gap: 12,
    },
    loadingText: {
      color: theme.textSecondary,
      fontSize: 13,
    },
    content: {
      gap: 12,
    },
    urlBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    urlText: {
      flex: 1,
      color: theme.text,
      fontSize: 12,
      fontWeight: '600',
    },
    expiryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    expiryText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    whatsAppBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: '#25D366',
      paddingVertical: 14,
      borderRadius: 12,
      shadowColor: '#25D366',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    whatsAppBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    copyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.08)' : 'rgba(0, 245, 255, 0.12)',
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(0, 245, 255, 0.25)' : 'rgba(0, 245, 255, 0.3)',
    },
    copyBtnText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '700',
    },
    shareBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    shareBtnText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '700',
    },
    errorBox: {
      paddingVertical: 16,
      alignItems: 'center',
      gap: 12,
    },
    errorText: {
      color: '#EF4444',
      fontSize: 13,
      textAlign: 'center',
    },
    retryBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    retryText: {
      color: '#001A2C',
      fontWeight: '700',
      fontSize: 13,
    },
  });
