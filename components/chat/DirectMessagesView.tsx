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
import {
  Send,
  Image as ImageIcon,
  X,
  ChevronLeft,
  User,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
  Wifi,
  WifiOff,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import { DirectMessage, ConversationItem, UserBlock } from '@/features/chat/types/chat';
import {
  useGetConversations,
  useGetDirectMessages,
  useSendDirectMessage,
  useMarkDirectMessageRead,
  useGetUserBlocks,
  useBlockUser,
  useUnblockUser,
} from '@/features/chat/services/chatApi';
import { useChatWebSocket } from '@/features/chat/hooks/useChatWebSocket';

interface DirectMessagesViewProps {
  initialWithUserId?: string;
  initialWithUserName?: string;
  onBack?: () => void;
  showListBack?: boolean;
}

export function DirectMessagesView({
  initialWithUserId,
  initialWithUserName,
  onBack,
  showListBack = false,
}: DirectMessagesViewProps) {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const currentUser = useAuthStore((state) => state.user);

  const [activeUser, setActiveUser] = useState<{ id: string; name: string } | null>(
    initialWithUserId ? { id: initialWithUserId, name: initialWithUserName || 'Usuario' } : null
  );

  const [inputText, setInputText] = useState('');
  const [selectedPhotoBase64, setSelectedPhotoBase64] = useState<string | null>(null);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // Queries
  const { data: conversations, isLoading: isLoadingConversations, refetch: refetchConversations } =
    useGetConversations();

  const { data: directMessages, isLoading: isLoadingMessages } = useGetDirectMessages(
    activeUser?.id
  );

  const { data: blocks, refetch: refetchBlocks } = useGetUserBlocks();

  // Mutations
  const sendMutation = useSendDirectMessage();
  const markReadMutation = useMarkDirectMessageRead();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();

  // WebSocket (1 socket for all direct messages)
  const { messages: wsMessages, isConnected: isWsConnected } = useChatWebSocket({
    type: 'direct',
    onNewMessage: (msg) => {
      const dm = msg as DirectMessage;
      // If message is in currently active conversation, mark as read
      if (activeUser && (dm.sender === activeUser.id || dm.recipient === activeUser.id)) {
        if (dm.id && dm.sender === activeUser.id) {
          markReadMutation.mutate(dm.id);
        }
      }
      refetchConversations();
    },
  });

  // Check if active user is blocked by current user
  const currentBlockRecord = useMemo(() => {
    if (!activeUser || !blocks) return null;
    return blocks.find((b) => b.blocked === activeUser.id) || null;
  }, [activeUser, blocks]);

  // Combined messages for active conversation
  const conversationMessages = useMemo(() => {
    if (!activeUser) return [];

    const map = new Map<string, DirectMessage>();
    (directMessages || []).forEach((m) => {
      if (m.id) map.set(m.id, m);
    });

    (wsMessages as DirectMessage[]).forEach((m) => {
      if (m && (m.sender === activeUser.id || m.recipient === activeUser.id)) {
        if (m.id) map.set(m.id, m);
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return list;
  }, [activeUser, directMessages, wsMessages]);

  // Mark unread messages as read when opening conversation
  useEffect(() => {
    if (activeUser && directMessages) {
      directMessages.forEach((msg) => {
        if (msg.recipient === currentUser?.id && !msg.is_read) {
          markReadMutation.mutate(msg.id);
        }
      });
    }
  }, [activeUser, directMessages, currentUser]);

  const handleSelectConversation = (conv: ConversationItem) => {
    setActiveUser({ id: conv.user_id, name: conv.user_name });
  };

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
    if (!activeUser) return;

    if (currentUser?.id && activeUser.id === currentUser.id) {
      Alert.alert('Acción inválida', 'No puedes enviarte un mensaje a ti mismo.');
      return;
    }

    const trimmed = inputText.trim();
    if (!trimmed && !selectedPhotoBase64) {
      Alert.alert('Mensaje vacío', 'Debes ingresar un texto o adjuntar una foto.');
      return;
    }

    try {
      await sendMutation.mutateAsync({
        recipient: activeUser.id,
        body: trimmed || undefined,
        photo: selectedPhotoBase64 || undefined,
      });

      setInputText('');
      setSelectedPhotoBase64(null);
      setSelectedPhotoUri(null);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes('403')) {
        Alert.alert(
          'Mensaje no enviado',
          'No puedes enviar mensajes a este usuario debido a sus preferencias o bloqueo.'
        );
      } else {
        Alert.alert('Error', 'No se pudo enviar el mensaje.');
      }
    }
  };

  const handleToggleBlock = () => {
    if (!activeUser) return;

    if (currentBlockRecord) {
      Alert.alert(
        'Desbloquear usuario',
        `¿Deseas desbloquear a ${activeUser.name}? Podrá volver a enviarte mensajes.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desbloquear',
            onPress: async () => {
              try {
                await unblockMutation.mutateAsync(currentBlockRecord.id);
                refetchBlocks();
              } catch {
                Alert.alert('Error', 'No se pudo desbloquear al usuario.');
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Bloquear usuario',
        `¿Deseas bloquear a ${activeUser.name}? Ya no podrá enviarte mensajes directos (el historial previo seguirá visible).`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Bloquear',
            style: 'destructive',
            onPress: async () => {
              try {
                await blockMutation.mutateAsync({ blocked: activeUser.id });
                refetchBlocks();
              } catch {
                Alert.alert('Error', 'No se pudo bloquear al usuario.');
              }
            },
          },
        ]
      );
    }
  };

  // RENDER CONVERSATION THREAD
  if (activeUser) {
    const isSending = sendMutation.isPending;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.threadHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              setActiveUser(null);
              refetchConversations();
            }}
          >
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.threadUserInfo}>
            <Text style={styles.threadUserName} numberOfLines={1}>
              {activeUser.name}
            </Text>
            <View style={styles.liveIndicator}>
              {isWsConnected ? (
                <View style={styles.connectedBadge}>
                  <Wifi size={11} color="#4ADE80" />
                  <Text style={styles.connectedText}>En vivo</Text>
                </View>
              ) : (
                <View style={styles.disconnectedBadge}>
                  <WifiOff size={11} color={theme.textSecondary} />
                  <Text style={styles.disconnectedText}>Conectando...</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.blockBtn, currentBlockRecord && styles.blockBtnActive]}
            onPress={handleToggleBlock}
          >
            {currentBlockRecord ? (
              <ShieldAlert size={18} color="#EF4444" />
            ) : (
              <ShieldCheck size={18} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        {currentBlockRecord && (
          <View style={styles.blockedNotice}>
            <ShieldAlert size={14} color="#EF4444" />
            <Text style={styles.blockedNoticeText}>
              Has bloqueado a este usuario. No puede responderte.
            </Text>
          </View>
        )}

        {/* Message Feed */}
        {isLoadingMessages && conversationMessages.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={styles.loadingText}>Cargando mensajes...</Text>
          </View>
        ) : conversationMessages.length === 0 ? (
          <View style={styles.centerContainer}>
            <MessageSquare size={36} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>Inicia la conversación</Text>
            <Text style={styles.emptySubtitle}>Envía un mensaje para comenzar a chatear.</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={conversationMessages}
            keyExtractor={(item, index) => item.id || `dm-${index}`}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const isMe = currentUser?.id && item.sender === currentUser.id;
              const timeStr = item.created_at
                ? new Date(item.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <View
                  style={[
                    styles.messageRow,
                    isMe ? styles.messageRowMe : styles.messageRowOther,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                    ]}
                  >
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
                  </View>
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
            placeholder="Escribe un mensaje directo..."
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
      </KeyboardAvoidingView>
    );
  }

  // RENDER CONVERSATIONS LIST
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.threadHeader}>
        {showListBack && onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.conversationsHeaderTitle}>Mensajes Directos</Text>
      </View>

      {isLoadingConversations ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={styles.loadingText}>Cargando conversaciones...</Text>
        </View>
      ) : !conversations || conversations.length === 0 ? (
        <View style={styles.centerContainer}>
          <MessageSquare size={40} color={theme.textSecondary} />
          <Text style={styles.emptyTitle}>Sin mensajes directos</Text>
          <Text style={styles.emptySubtitle}>
            Puedes iniciar un mensaje directo visitando el perfil de un jugador o árbitro.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.conversationsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.conversationRow}
              onPress={() => handleSelectConversation(item)}
              activeOpacity={0.8}
            >
              <View style={styles.avatarPlaceholder}>
                {item.user_photo ? (
                  <Image source={{ uri: item.user_photo }} style={styles.avatarImage} />
                ) : (
                  <User size={20} color={theme.primary} />
                )}
              </View>

              <View style={styles.conversationInfo}>
                <View style={styles.conversationTopRow}>
                  <Text style={styles.conversationName}>{item.user_name}</Text>
                  {Boolean(item.last_message?.created_at) && (
                    <Text style={styles.conversationDate}>
                      {new Date(item.last_message!.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  )}
                </View>

                <View style={styles.conversationBottomRow}>
                  <Text style={styles.conversationSnippet} numberOfLines={1}>
                    {item.last_message?.body || (item.last_message?.photo ? '📷 Foto' : 'Sin mensajes')}
                  </Text>
                  {item.unread_count > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCountText}>{item.unread_count}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
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
    threadHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
      gap: 10,
    },
    backBtn: {
      padding: 4,
    },
    threadUserInfo: {
      flex: 1,
    },
    threadUserName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    liveIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    connectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(74, 222, 128, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      gap: 3,
    },
    connectedText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#4ADE80',
    },
    disconnectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      gap: 3,
    },
    disconnectedText: {
      fontSize: 10,
      color: theme.textSecondary,
    },
    blockBtn: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    blockBtnActive: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    blockedNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      gap: 8,
    },
    blockedNoticeText: {
      fontSize: 12,
      color: '#EF4444',
      fontWeight: '600',
    },
    conversationsHeaderTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    conversationsList: {
      paddingVertical: 8,
    },
    conversationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      gap: 12,
    },
    avatarPlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    conversationInfo: {
      flex: 1,
    },
    conversationTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    conversationName: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
    },
    conversationDate: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    conversationBottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    conversationSnippet: {
      fontSize: 13,
      color: theme.textSecondary,
      flex: 1,
      marginRight: 8,
    },
    unreadBadge: {
      backgroundColor: theme.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    unreadCountText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#000',
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
      marginTop: 12,
      marginBottom: 4,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
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
