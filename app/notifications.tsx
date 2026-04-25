import React from "react";
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
import { 
  Trophy, 
  MessageSquare, 
  Zap, 
  ChevronRight, 
  Circle,
  Activity
} from "lucide-react-native";

// Mock data for notifications
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "match",
    title: "¡Gol de tu equipo!",
    message: "Tu equipo 'Los Galácticos' ha anotado el 1-0 contra 'Dream Team'.",
    time: "Hace 5 min",
    read: false,
    icon: Activity,
    color: "#4ADE80",
  },
  {
    id: "2",
    type: "tournament",
    title: "Inscripciones Abiertas",
    message: "El Torneo de Invierno 2024 ya acepta nuevos equipos. ¡No te quedes fuera!",
    time: "Hace 2 horas",
    read: false,
    icon: Trophy,
    color: "#FFB000",
  },
  {
    id: "3",
    type: "system",
    title: "Actualización de Perfil",
    message: "Tu media general ha subido a 84 tras el último partido.",
    time: "Ayer",
    read: true,
    icon: Zap,
    color: "#00F5FF",
  },
  {
    id: "4",
    type: "social",
    title: "Nuevo Mensaje",
    message: "El capitán del equipo te ha enviado un mensaje sobre el próximo encuentro.",
    time: "Hace 2 días",
    read: true,
    icon: MessageSquare,
    color: "#60A5FA",
  },
];

export default function NotificationsScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const renderItem = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity 
        style={[styles.notificationCard, !item.read && styles.unreadCard]} 
        activeOpacity={0.7}
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
        
        <ChevronRight size={18} color={theme.textSecondary} opacity={0.3} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <LayoutHeader title="NOTIFICACIONES" showBackButton={true} />

      <FlatList
        data={MOCK_NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes notificaciones por ahora.</Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
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
  });
