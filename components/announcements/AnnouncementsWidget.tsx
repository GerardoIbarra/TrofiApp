import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Megaphone,
  Plus,
  Calendar,
  User,
  Trash2,
  Edit2,
  BellRing,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import {
  useGetAnnouncements,
  useDeleteAnnouncement,
} from '@/features/announcements/services/announcementsApi';
import { Announcement } from '@/features/announcements/types/announcement';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';
import { useTranslation } from 'react-i18next';

interface AnnouncementsWidgetProps {
  leagueId?: string;
  tournamentId?: string;
  canManage?: boolean;
}

export function AnnouncementsWidget({
  leagueId,
  tournamentId,
  canManage = false,
}: AnnouncementsWidgetProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const { data: announcements = [], isLoading } = useGetAnnouncements({
    leagueId,
    tournamentId,
  });

  const deleteMutation = useDeleteAnnouncement();

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setIsModalVisible(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingAnnouncement(item);
    setIsModalVisible(true);
  };

  const handleDelete = (item: Announcement) => {
    Alert.alert(
      t('announcements.delete_title'),
      t('announcements.delete_confirm', { title: item.title }),
      [
        { text: t('common.cancel', 'Cancelar'), style: 'cancel' },
        {
          text: t('common.delete', 'Eliminar'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({
                id: item.id,
                leagueId,
                tournamentId,
              });
              Alert.alert(t('common.done', 'Listo'), t('announcements.deleted_success'));
            } catch (err: any) {
              Alert.alert('Error', err?.message || t('announcements.deleted_error'));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BellRing size={18} color={theme.primary} />
          <Text style={styles.title}>{t('announcements.title')}</Text>
        </View>

        {canManage && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleOpenCreate}
            activeOpacity={0.8}
          >
            <Plus size={14} color="#001A2C" />
            <Text style={styles.addBtnText}>{t('announcements.new_announcement')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      ) : announcements.length === 0 ? (
        <View style={styles.emptyBox}>
          <Megaphone size={32} color={theme.textSecondary} opacity={0.4} />
          <Text style={styles.emptyTitle}>Sin avisos publicados</Text>
          <Text style={styles.emptySubtitle}>
            Los comunicados oficiales e información importante de las fechas aparecerán aquí.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {announcements.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Calendar size={11} color={theme.textSecondary} />
                      <Text style={styles.metaText}>
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    {item.author_name && (
                      <View style={styles.metaItem}>
                        <User size={11} color={theme.textSecondary} />
                        <Text style={styles.metaText}>{item.author_name}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {canManage && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleOpenEdit(item)}
                    >
                      <Edit2 size={14} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleDelete(item)}
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Modal Form */}
      <CreateAnnouncementModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        leagueId={leagueId}
        tournamentId={tournamentId}
        initialData={editingAnnouncement}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      gap: 14,
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    title: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
    },
    addBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    addBtnText: {
      fontSize: 11,
      fontWeight: '900',
      color: '#001A2C',
    },
    centerBox: {
      paddingVertical: 30,
      alignItems: 'center',
    },
    emptyBox: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 36,
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      gap: 8,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text,
    },
    emptySubtitle: {
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    list: {
      gap: 10,
    },
    card: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      gap: 8,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
    },
    cardTitleWrap: {
      flex: 1,
      gap: 4,
    },
    cardTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 10,
      color: theme.textSecondary,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    actionIconBtn: {
      padding: 6,
      borderRadius: 6,
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    },
    cardBody: {
      fontSize: 12,
      color: theme.text,
      lineHeight: 18,
      opacity: 0.9,
    },
  });
