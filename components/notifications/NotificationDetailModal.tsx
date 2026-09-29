import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import {
  X,
  ExternalLink,
  Calendar,
  Tag,
  Trophy,
  MessageSquare,
  Zap,
  Activity,
  Megaphone,
  Shield,
  Award,
  TrendingUp,
} from "lucide-react-native";

export interface NotificationDetailItem {
  id: string;
  rawId?: string | number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  data?: any;
  targetRoute?: {
    pathname: string;
    params?: Record<string, any>;
    actionLabel?: string;
  } | null;
}

interface NotificationDetailModalProps {
  visible: boolean;
  notification: NotificationDetailItem | null;
  onClose: () => void;
  onNavigateToTarget?: (pathname: string, params?: Record<string, any>) => void;
}

export const getNotificationVisuals = (type: string) => {
  const normalized = (type || "").toLowerCase();
  if (normalized === "achievement_unlocked" || normalized.includes("achievement")) {
    return { icon: Award, color: "#F59E0B", label: "Logro" };
  }
  if (normalized === "rating_changed" || normalized.includes("rating")) {
    return { icon: TrendingUp, color: "#10B981", label: "Rating OVR" };
  }
  if (normalized.includes("league")) {
    return { icon: Trophy, color: "#FFB000", label: "Liga" };
  }
  if (normalized.includes("match")) {
    return { icon: Zap, color: "#00F5FF", label: "Partido" };
  }
  if (normalized.includes("tournament")) {
    return { icon: Trophy, color: "#FF8C00", label: "Torneo" };
  }
  if (normalized.includes("team")) {
    return { icon: Shield, color: "#A855F7", label: "Equipo" };
  }
  if (normalized.includes("message") || normalized.includes("chat")) {
    return { icon: MessageSquare, color: "#3B82F6", label: "Mensaje" };
  }
  if (normalized.includes("announcement")) {
    return { icon: Megaphone, color: "#00F5FF", label: "Aviso Oficial" };
  }
  return { icon: Activity, color: "#00F5FF", label: "Notificación" };
};

export function NotificationDetailModal({
  visible,
  notification,
  onClose,
  onNavigateToTarget,
}: NotificationDetailModalProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  if (!notification) return null;

  const visuals = getNotificationVisuals(notification.type);
  const Icon = visuals.icon;

  const handleActionPress = () => {
    if (notification.targetRoute && onNavigateToTarget) {
      onClose();
      onNavigateToTarget(
        notification.targetRoute.pathname,
        notification.targetRoute.params
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: theme.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.typeBadgeRow}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: visuals.color + "20" },
                ]}
              >
                <Icon size={20} color={visuals.color} />
              </View>
              <View style={styles.badgeGroup}>
                <View
                  style={[
                    styles.categoryPill,
                    { backgroundColor: visuals.color + "18", borderColor: visuals.color + "40" },
                  ]}
                >
                  <Tag size={10} color={visuals.color} style={{ marginRight: 4 }} />
                  <Text style={[styles.categoryText, { color: visuals.color }]}>
                    {visuals.label.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.timePill}>
                  <Calendar size={10} color={theme.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                    {notification.time}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Cerrar aviso"
            >
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content Body */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              {notification.title}
            </Text>

            <View style={styles.separator} />

            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {notification.message}
            </Text>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            {notification.targetRoute && (
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: visuals.color }]}
                onPress={handleActionPress}
                activeOpacity={0.8}
              >
                <ExternalLink size={16} color="#0A1525" style={{ marginRight: 8 }} />
                <Text style={styles.primaryActionText}>
                  {notification.targetRoute.actionLabel || "Ver Detalle"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.dismissBtn,
                !notification.targetRoute && styles.dismissBtnFull,
                { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)" },
              ]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.dismissText, { color: theme.text }]}>
                {notification.targetRoute ? "Cerrar" : "Entendido"}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalCard: {
      width: "100%",
      maxWidth: 420,
      maxHeight: "80%",
      borderRadius: 24,
      borderWidth: 1.5,
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    typeBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    badgeGroup: {
      gap: 4,
    },
    categoryPill: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 1,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    timePill: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeText: {
      fontSize: 11,
      fontWeight: "500",
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollArea: {
      maxHeight: 280,
    },
    scrollContent: {
      paddingBottom: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: "800",
      lineHeight: 24,
    },
    separator: {
      height: 1,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.06)",
      marginVertical: 12,
    },
    message: {
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "400",
    },
    footer: {
      marginTop: 20,
      gap: 10,
    },
    primaryActionBtn: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      height: 46,
      borderRadius: 12,
    },
    primaryActionText: {
      color: "#0A1525",
      fontSize: 14,
      fontWeight: "800",
    },
    dismissBtn: {
      justifyContent: "center",
      alignItems: "center",
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
    },
    dismissBtnFull: {
      height: 46,
    },
    dismissText: {
      fontSize: 13,
      fontWeight: "700",
    },
  });
