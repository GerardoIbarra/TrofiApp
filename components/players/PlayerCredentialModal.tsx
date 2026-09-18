import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  CheckCircle2,
  AlertTriangle,
  Award,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { LinearGradient } from 'expo-linear-gradient';

export interface CredentialPlayerData {
  player_id?: string;
  player_name: string;
  nickname?: string;
  shirt_number?: number | string | null;
  position?: string | null;
  photo?: string | null;
  team_name?: string;
  status?: 'active' | 'suspended';
  is_suspended?: boolean;
  suspension_reason?: string;
  medical_clearance?: boolean;
}

interface PlayerCredentialModalProps {
  visible: boolean;
  onClose: () => void;
  player: CredentialPlayerData | null;
}

export function PlayerCredentialModal({
  visible,
  onClose,
  player,
}: PlayerCredentialModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  if (!player) return null;

  const isSuspended =
    player.is_suspended ||
    player.status === 'suspended' ||
    (player as any).suspended;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, isSuspended && styles.cardSuspended]}>
          <BackgroundGradient />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.leagueTagRow}>
              <Shield size={16} color={isSuspended ? '#EF4444' : theme.primary} />
              <Text
                style={[
                  styles.leagueTagText,
                  { color: isSuspended ? '#EF4444' : theme.primary },
                ]}
              >
                FICHA DIGITAL OFICIAL
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Foto Avatar Grande con Dorsal */}
            <View style={styles.avatarSection}>
              <View
                style={[
                  styles.avatarBorder,
                  isSuspended ? styles.avatarBorderSuspended : styles.avatarBorderActive,
                ]}
              >
                {player.photo ? (
                  <Image
                    source={{ uri: player.photo.replace(/\s/g, '') }}
                    style={styles.avatarImg}
                    contentFit="cover"
                    transition={300}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <User size={54} color={isDark ? '#475569' : '#94A3B8'} />
                  </View>
                )}
              </View>

              {/* Dorsal Flotante */}
              {player.shirt_number !== undefined && player.shirt_number !== null && (
                <LinearGradient
                  colors={isSuspended ? ['#EF4444', '#B91C1C'] : ['#00F5FF', '#00A3FF']}
                  style={styles.dorsalBadge}
                >
                  <Text style={styles.dorsalText}>#{player.shirt_number}</Text>
                </LinearGradient>
              )}
            </View>

            {/* Datos del Jugador */}
            <View style={styles.infoSection}>
              <Text style={styles.playerName}>{player.player_name}</Text>
              {player.nickname ? (
                <Text style={styles.playerNickname}>&ldquo;{player.nickname}&rdquo;</Text>
              ) : null}

              {player.team_name ? (
                <Text style={styles.teamNameText}>{player.team_name}</Text>
              ) : null}

              <View style={styles.pillRow}>
                <View style={styles.positionPill}>
                  <Text style={styles.positionText}>
                    {player.position || 'Jugador de Campo'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Estado de Habilitación / Sanción */}
            {isSuspended ? (
              <View style={styles.suspendedBanner}>
                <View style={styles.statusTitleRow}>
                  <ShieldAlert size={20} color="#EF4444" />
                  <Text style={styles.suspendedTitle}>JUGADOR SUSPENDIDO</Text>
                </View>
                <Text style={styles.suspendedDescription}>
                  {player.suspension_reason ||
                    'Inhabilitado por sanción disciplinaria o acumulación de tarjetas. No puede ingresar al terreno de juego.'}
                </Text>
              </View>
            ) : (
              <View style={styles.activeBanner}>
                <View style={styles.statusTitleRow}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <Text style={styles.activeTitle}>HABILITADO PARA JUGAR</Text>
                </View>
                <Text style={styles.activeDescription}>
                  Registro verificado en cédula arbitral. Cumple con la normativa de elegibilidad de la liga.
                </Text>
              </View>
            )}

            {/* Verificación de Identidad */}
            <View style={styles.verificationRow}>
              <ShieldCheck size={16} color="#00F5FF" />
              <Text style={styles.verificationText}>
                Ficha blindada contra suplantación (Anticachirul)
              </Text>
            </View>
          </ScrollView>

          {/* Botón cerrar */}
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: isSuspended ? '#EF4444' : theme.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.confirmBtnText, { color: isSuspended ? '#FFF' : '#001A2C' }]}>
              Entendido
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    card: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: isDark ? '#0A192F' : '#FFFFFF',
      borderRadius: 24,
      padding: 24,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(0, 245, 255, 0.2)' : 'rgba(0,0,0,0.1)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10,
    },
    cardSuspended: {
      borderColor: '#EF4444',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    leagueTagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    leagueTagText: {
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1,
    },
    closeBtn: {
      padding: 4,
    },
    scrollContent: {
      alignItems: 'center',
      paddingBottom: 16,
    },
    avatarSection: {
      position: 'relative',
      marginVertical: 12,
    },
    avatarBorder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      overflow: 'hidden',
      borderWidth: 3,
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    },
    avatarBorderActive: {
      borderColor: '#10B981',
    },
    avatarBorderSuspended: {
      borderColor: '#EF4444',
    },
    avatarImg: {
      width: '100%',
      height: '100%',
    },
    avatarFallback: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dorsalBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#0A192F',
    },
    dorsalText: {
      color: '#001A2C',
      fontSize: 14,
      fontWeight: '900',
    },
    infoSection: {
      alignItems: 'center',
      marginVertical: 12,
      width: '100%',
    },
    playerName: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.text,
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    playerNickname: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.primary,
      fontStyle: 'italic',
      marginTop: 2,
    },
    teamNameText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
      marginTop: 4,
    },
    pillRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
    },
    positionPill: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 10,
    },
    positionText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
      textTransform: 'uppercase',
    },
    suspendedBanner: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      borderWidth: 1.5,
      borderColor: '#EF4444',
      borderRadius: 16,
      padding: 14,
      width: '100%',
      marginVertical: 10,
    },
    activeBanner: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      borderWidth: 1.5,
      borderColor: '#10B981',
      borderRadius: 16,
      padding: 14,
      width: '100%',
      marginVertical: 10,
    },
    statusTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    suspendedTitle: {
      color: '#EF4444',
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    suspendedDescription: {
      color: '#F87171',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
    },
    activeTitle: {
      color: '#10B981',
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    activeDescription: {
      color: '#34D399',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
    },
    verificationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
    },
    verificationText: {
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    confirmBtn: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 14,
    },
    confirmBtnText: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
  });
