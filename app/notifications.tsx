import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { BackgroundGradient } from "@/components/ui/branding/BackgroundGradient";
import { LayoutHeader } from "@/components/ui/layout/LayoutHeader";
import { GlobalStyles } from "@/constants/GlobalStyles";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { 
  useGetNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead 
} from "@/features/notifications/services/notificationApi";
import { 
  Trophy, 
  MessageSquare, 
  Zap, 
  ChevronRight, 
  Circle,
  Activity,
  Sliders,
  Megaphone,
  CheckCheck,
  Shield,
  Award,
  TrendingUp,
} from "lucide-react-native";
import { NotificationPreferencesModal } from "@/components/notifications/NotificationPreferencesModal";
import { NotificationDetailModal } from "@/components/notifications/NotificationDetailModal";
import { router } from "expo-router";
import { handleNotificationData, resolveNotificationRoute } from "@/services/notifications";

const getNotificationVisuals = (type: string) => {
  const normalized = (type || "").toLowerCase();
  if (normalized === "achievement_unlocked" || normalized.includes("achievement")) {
    return { icon: Award, color: "#F59E0B" };
  }
  if (normalized === "rating_changed" || normalized.includes("rating")) {
    return { icon: TrendingUp, color: "#10B981" };
  }
  if (normalized.includes("league")) {
    return { icon: Trophy, color: "#FFB000" };
  }
  if (normalized.includes("match")) {
    return { icon: Zap, color: "#00F5FF" };
  }
  if (normalized.includes("tournament")) {
    return { icon: Trophy, color: "#FF8C00" };
  }
  if (normalized.includes("team")) {
    return { icon: Shield, color: "#A855F7" };
  }
  if (normalized.includes("message") || normalized.includes("chat")) {
    return { icon: MessageSquare, color: "#3B82F6" };
  }
  if (normalized.includes("announcement")) {
    return { icon: Megaphone, color: "#00F5FF" };
  }
  return { icon: Activity, color: "#00F5FF" };
};

export default function NotificationsScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);

  const { data: serverNotifications = [], isLoading, refetch } = useGetNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

  const handleNotificationPress = (item: any) => {
    if (!item.read) {
      markAsRead(item.rawId);
    }
    
    // Si la notificación tiene una pantalla de destino (partido, equipo, liga, chat, logros, perfil, etc.)
    if (item.targetRoute) {
      handleNotificationData(
        item.data,
        (pathname, params) => {
          router.push({ pathname: pathname as any, params });
        },
        { notificationType: item.type, body: item.message, celebrate: !item.read }
      );
    } else {
      // Si es un aviso oficial / announcement o notificación general sin pantalla directa:
      // Abrir modal de detalle para leer el comunicado completo sin truncar.
      setSelectedNotification(item);
    }
  };

  const displayNotifications =
    serverNotifications.length > 0
      ? serverNotifications.map((n: any, idx: number) => {
          const type = n.notification_type || "announcement";
          const visuals = getNotificationVisuals(type);

          let parsedData: any = {};
          if (typeof n.data === "string") {
            try {
              parsedData = JSON.parse(n.data);
            } catch (_) {
              parsedData = {};
            }
          } else if (typeof n.data === "object" && n.data !== null) {
            parsedData = n.data;
          }

          // Unir propiedades raíz del registro con su data
          const mergedData = {
            ...n,
            ...parsedData,
            notification_type: type,
          };

          const targetRoute = resolveNotificationRoute(mergedData, { notificationType: type });

          return {
            id: String(n.id ?? `notification-${idx}`),
            rawId: n.id,
            type,
            title: n.title || "Aviso Oficial",
            message: n.message || n.body || "",
            time: n.created_at ? new Date(n.created_at).toLocaleDateString() : "Reciente",
            read: Boolean(n.is_read),
            icon: visuals.icon,
            color: visuals.color,
            data: mergedData,
            targetRoute,
          };
        })
      : [];

  const renderItem = ({ item }: { item: (typeof displayNotifications)[0] }) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity 
        style={[styles.notificationCard, !item.read && styles.unreadCard]} 
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}>
          <Icon size={20} color={item.color} />
        </View>
        
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{item.title}</Text>
            {!item.read && <Circle size={8} color={theme.primary} fill={theme.primary} />}
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        
        <View style={styles.actionIndicator}>
          {item.targetRoute ? (
            <ChevronRight size={18} color={theme.textSecondary} opacity={0.4} />
          ) : (
            <View style={[styles.noticeBadge, { backgroundColor: item.color + "15" }]}>
              <Text style={[styles.noticeBadgeText, { color: item.color }]}>Aviso</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <LayoutHeader 
        title={t('common.notifications')} 
        showBackButton={true} 
        rightElement={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerSettingsBtn}
              onPress={() => markAllAsRead()}
              disabled={isMarkingAll || displayNotifications.every((n: any) => n.read)}
              activeOpacity={0.7}
            >
              <CheckCheck 
                size={20} 
                color={displayNotifications.every((n: any) => n.read) ? theme.textSecondary : theme.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerSettingsBtn}
              onPress={() => setShowPreferences(true)}
              activeOpacity={0.7}
            >
              <Sliders size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <FlatList
        data={displayNotifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('common.no_notifications')}</Text>
          </View>
        }
      />

      <NotificationPreferencesModal
        visible={showPreferences}
        onClose={() => setShowPreferences(false)}
      />

      <NotificationDetailModal
        visible={!!selectedNotification}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onNavigateToTarget={(pathname, params) => {
          router.push({ pathname: pathname as any, params });
        }}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    headerActions: {
      flexDirection: "row",
      gap: 10,
    },
    headerSettingsBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 40,
    },
    notificationCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 20,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    unreadCard: {
      borderColor: theme.primary + "40",
      backgroundColor: isDark ? "rgba(0, 245, 255, 0.05)" : theme.primary + "10",
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
      marginRight: 10,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    title: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.text,
    },
    message: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
      marginBottom: 6,
    },
    time: {
      fontSize: 11,
      color: theme.textSecondary,
      opacity: 0.6,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 100,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 14,
    },
    actionIndicator: {
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 4,
    },
    noticeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    noticeBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
  });
