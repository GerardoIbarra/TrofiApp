import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Send, Image as ImageIcon, X, AlertCircle, Wifi, WifiOff, MessageSquare, Flag } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ChatMessage } from '@/features/chat/types/chat';
import {
  useGetTeamChat,
  useSendTeamChatMessage,
  useGetLeagueChat,
  useSendLeagueChatMessage,
  useBlockUser,
} from '@/features/chat/services/chatApi';
import { useChatWebSocket } from '@/features/chat/hooks/useChatWebSocket';
import { ReportModal } from '@/components/ui/feedback/ReportModal';
import { EmptyState } from '@/components/ui/feedback/EmptyState';

interface ChatBoxProps {
  teamId?: string;
  leagueId?: string;
  title?: string;
}

export function ChatBox({ teamId, leagueId, title }: ChatBoxProps) {
  const { theme, isDark } = useTheme();
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const currentUser = useAuthStore((state) => state.user);

  const [inputText, setInputText] = useState('');
  const [selectedPhotoBase64, setSelectedPhotoBase64] = useState<string | null>(null);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ id: string; authorId?: string; name?: string } | null>(null);

  const blockMutation = useBlockUser();
  const flatListRef = useRef<FlatList>(null);

  // 1. REST Queries
  const {
    data: teamMessages,
    isLoading: isLoadingTeam,
    error: teamError,
  } = useGetTeamChat(teamId);

  const {
    data: leagueMessages,
    isLoading: isLoadingLeague,
    error: leagueError,
  } = useGetLeagueChat(leagueId);

  const isPermissionDenied =
    (teamError as any)?.status === 403 ||
    (leagueError as any)?.status === 403 ||
    (teamError as any)?.message?.includes('403') ||
    (leagueError as any)?.message?.includes('403');

  // 2. Mutations
  const sendTeamMessageMutation = useSendTeamChatMessage();
  const sendLeagueMessageMutation = useSendLeagueChatMessage();
  const isSending = sendTeamMessageMutation.isPending || sendLeagueMessageMutation.isPending;

  // 3. WebSocket Real-time
  const {
    messages: wsMessages,
    isConnected: isWsConnected,
    connectionError: wsError,
  } = useChatWebSocket({
    type: teamId ? 'team' : 'league',
    targetId: teamId || leagueId,
    enabled: Boolean(teamId || leagueId) && !isPermissionDenied,
  });

  // 4. Combined Messages (Merge REST + WS deduplicating by ID)
  const allMessages = useMemo(() => {
    const rawRest = (teamId ? teamMessages : leagueMessages) || [];
    const map = new Map<string, ChatMessage>();

    rawRest.forEach((m) => {
      if (m.id) map.set(m.id, m);
    });

    wsMessages.forEach((m) => {
      if (m.id) map.set(m.id, m as ChatMessage);
    });

    const list = Array.from(map.values());
    // Sort oldest first so chat flows naturally from top to bottom
    list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return list;
  }, [teamId, teamMessages, leagueMessages, wsMessages]);

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Se necesita acceso a tus fotos para enviar imágenes.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setSelectedPhotoUri(asset.uri);
        const b64 = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setSelectedPhotoBase64(b64);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed && !selectedPhotoBase64) {
      Alert.alert('Mensaje vacío', 'Debes ingresar un texto o adjuntar una foto.');
      return;
    }

    const payload = {
      body: trimmed || undefined,
      photo: selectedPhotoBase64 || undefined,
    };

    try {
      if (teamId) {
        await sendTeamMessageMutation.mutateAsync({ teamId, payload });
      } else if (leagueId) {
        await sendLeagueMessageMutation.mutateAsync({ leagueId, payload });
      }
      setInputText('');
      setSelectedPhotoBase64(null);
      setSelectedPhotoUri(null);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      const msg =
        err?.status === 403 || err?.message?.includes('403')
          ? 'No tienes permiso para escribir en este chat.'
          : 'No se pudo enviar el mensaje.';
      Alert.alert('Error', msg);
    }
  };

  const handleMessageOptions = (item: ChatMessage) => {
    Alert.alert(
      isEn ? 'Message Options' : 'Opciones del Mensaje',
      item.sender_name ? `${isEn ? 'From' : 'De'}: ${item.sender_name}` : undefined,
      [
        {
          text: isEn ? 'Report Message' : 'Reportar Mensaje',
          style: 'destructive',
          onPress: () => {
            setReportTarget({
              id: item.id,
              authorId: item.sender !== 'me' ? item.sender : undefined,
              name: item.body ? `"${item.body.slice(0, 30)}..."` : 'Mensaje multimedia',
            });
          },
        },
        {
          text: isEn ? 'Block User' : 'Bloquear Usuario',
          style: 'destructive',
          onPress: () => {
            if (item.sender && item.sender !== 'me') {
              Alert.alert(
                isEn ? 'Block User' : 'Bloquear Usuario',
                isEn
                  ? 'Are you sure you want to block this user?'
                  : '¿Estás seguro de que deseas bloquear a este usuario?',
                [
                  { text: isEn ? 'Cancel' : 'Cancelar', style: 'cancel' },
                  {
                    text: isEn ? 'Block' : 'Bloquear',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await blockMutation.mutateAsync({ blocked: item.sender });
                        Alert.alert(
                          isEn ? 'User Blocked' : 'Usuario Bloqueado',
                          isEn
                            ? 'You will no longer see messages from this user.'
                            : 'Ya no verás mensajes de este usuario.'
                        );
                      } catch (_) {
                        Alert.alert('Error', isEn ? 'Could not block user' : 'No se pudo bloquear');
                      }
                    },
                  },
                ]
              );
            }
          },
        },
        { text: isEn ? 'Cancel' : 'Cancelar', style: 'cancel' },
      ]
    );
  };

  if (isPermissionDenied) {
    return (
      <View style={styles.permissionCard}>
        <AlertCircle size={36} color={theme.error || '#EF4444'} />
        <Text style={styles.permissionTitle}>Acceso restringido</Text>
        <Text style={styles.permissionBody}>
          {teamId
            ? 'Solo los jugadores en plantilla, capitanes, dueño del equipo o administradores de la liga pueden acceder al chat de este equipo.'
            : 'Solo miembros autorizados con membresía activa pueden acceder al chat de esta liga.'}
        </Text>
      </View>
    );
  }

  const isLoading = (teamId ? isLoadingTeam : isLoadingLeague) && allMessages.length === 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.container}
    >
      {/* Header Bar with Live Indicator */}
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>{title || (teamId ? 'Chat del Equipo' : 'Chat de la Liga')}</Text>
        <View style={styles.liveIndicator}>
          {isWsConnected ? (
            <View style={styles.connectedBadge}>
              <Wifi size={13} color="#4ADE80" />
              <Text style={styles.connectedText}>En vivo</Text>
            </View>
          ) : (
            <View style={styles.disconnectedBadge}>
              <WifiOff size={13} color={theme.textSecondary} />
              <Text style={styles.disconnectedText}>Conectando...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Messages Feed */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={styles.loadingText}>Cargando mensajes...</Text>
        </View>
      ) : allMessages.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={isEn ? 'No messages yet' : 'No hay mensajes aún'}
          description={isEn ? 'Be the first one to send a message to the group.' : 'Sé el primero en escribir en el chat.'}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={allMessages}
          keyExtractor={(item, index) => item.id || `msg-${index}`}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isMe = currentUser?.id && item.sender === currentUser.id;
            const timeStr = item.created_at
              ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
                <TouchableOpacity
                  activeOpacity={isMe ? 1 : 0.85}
                  onLongPress={!isMe ? () => handleMessageOptions(item) : undefined}
                  delayLongPress={350}
                  style={[
                    styles.messageBubble,
                    isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                  ]}
                >
                  {!isMe && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.senderName}>{item.sender_name || 'Miembro'}</Text>
                      <TouchableOpacity
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => handleMessageOptions(item)}
                        style={{ marginLeft: 8 }}
                      >
                        <Flag size={12} color={theme.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {Boolean(item.photo) && (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setPreviewImageUri(item.photo)}
                    >
                      <Image
                        source={{ uri: item.photo! }}
                        style={styles.messageImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}

                  {Boolean(item.body) && (
                    <Text
                      style={[
                        styles.messageText,
                        isMe ? styles.messageTextMe : styles.messageTextOther,
                      ]}
                    >
                      {item.body}
                    </Text>
                  )}

                  <Text
                    style={[
                      styles.timestampText,
                      isMe ? styles.timestampMe : styles.timestampOther,
                    ]}
                  >
                    {timeStr}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* Photo Attachment Preview */}
      {selectedPhotoUri && (
        <View style={styles.attachmentPreviewContainer}>
          <Image source={{ uri: selectedPhotoUri }} style={styles.attachmentThumbnail} />
          <TouchableOpacity
            style={styles.removeAttachmentBtn}
            onPress={() => {
              setSelectedPhotoBase64(null);
              setSelectedPhotoUri(null);
            }}
          >
            <X size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={handlePickImage}
          disabled={isSending}
        >
          <ImageIcon size={22} color={theme.primary} />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={theme.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!inputText.trim() && !selectedPhotoBase64) || isSending
              ? styles.sendBtnDisabled
              : styles.sendBtnActive,
          ]}
          onPress={handleSendMessage}
          disabled={(!inputText.trim() && !selectedPhotoBase64) || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Send size={18} color="#000" />
          )}
        </TouchableOpacity>
      </View>

      {/* Fullscreen Photo Modal */}
      <Modal
        visible={Boolean(previewImageUri)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUri(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setPreviewImageUri(null)}
          >
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          {previewImageUri && (
            <Image
              source={{ uri: previewImageUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Report Modal */}
      <ReportModal
        visible={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetType="message"
        targetId={reportTarget?.id || ''}
        targetName={reportTarget?.name}
        authorId={reportTarget?.authorId}
      />
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 480,
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
    },
    chatHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    },
    chatTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    liveIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    connectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(74, 222, 128, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      gap: 4,
    },
    connectedText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#4ADE80',
    },
    disconnectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      gap: 4,
    },
    disconnectedText: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 13,
      color: theme.textSecondary,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    messagesList: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    messageRow: {
      flexDirection: 'row',
      marginVertical: 3,
    },
    messageRowMe: {
      justifyContent: 'flex-end',
    },
    messageRowOther: {
      justifyContent: 'flex-start',
    },
    messageBubble: {
      maxWidth: '80%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
    },
    messageBubbleMe: {
      backgroundColor: theme.primary,
      borderBottomRightRadius: 4,
    },
    messageBubbleOther: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      borderBottomLeftRadius: 4,
    },
    senderName: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.primary,
      marginBottom: 3,
    },
    messageText: {
      fontSize: 14,
      lineHeight: 19,
    },
    messageTextMe: {
      color: '#000',
      fontWeight: '500',
    },
    messageTextOther: {
      color: theme.text,
    },
    messageImage: {
      width: 200,
      height: 140,
      borderRadius: 10,
      marginBottom: 6,
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    timestampText: {
      fontSize: 10,
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    timestampMe: {
      color: 'rgba(0, 0, 0, 0.6)',
    },
    timestampOther: {
      color: theme.textSecondary,
    },
    attachmentPreviewContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)',
    },
    attachmentThumbnail: {
      width: 50,
      height: 50,
      borderRadius: 8,
    },
    removeAttachmentBtn: {
      backgroundColor: 'rgba(239, 68, 68, 0.9)',
      borderRadius: 12,
      padding: 4,
      marginLeft: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : '#FFF',
      gap: 8,
    },
    attachBtn: {
      padding: 8,
      borderRadius: 8,
    },
    textInput: {
      flex: 1,
      maxHeight: 100,
      minHeight: 40,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 14,
      color: theme.text,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendBtnActive: {
      backgroundColor: theme.primary,
    },
    sendBtnDisabled: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    },
    permissionCard: {
      padding: 30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.03)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    permissionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginTop: 12,
      marginBottom: 6,
    },
    permissionBody: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.92)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseBtn: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      padding: 8,
    },
    fullImage: {
      width: '90%',
      height: '80%',
    },
  });
