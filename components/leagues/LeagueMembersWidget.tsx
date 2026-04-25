import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Users, Shield, User, ChevronRight } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { LeagueMembership } from "@/features/leagues/types/league";
import { Image } from "expo-image";

interface LeagueMembersWidgetProps {
  leagueId: string;
}

export function LeagueMembersWidget({ leagueId }: LeagueMembersWidgetProps) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const [members, setMembers] = useState<LeagueMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [leagueId]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      // Usar la ruta dinámica proporcionada por el usuario
      const response = await api.get<LeagueMembership[]>(
        `/v1/leagues/${leagueId}/memberships/`
      );
      setMembers(response);
    } catch (error) {
      console.error("Error fetching league members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={theme.primary} />
        <Text style={styles.loaderText}>Cargando comunidad...</Text>
      </View>
    );
  }

  const admins = members.filter((m) => m.role === "admin");
  const players = members.filter((m) => m.role !== "admin");

  const RenderMemberItem = ({ member }: { member: LeagueMembership }) => (
    <TouchableOpacity style={styles.memberCard} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <Image
          source={`https://i.pravatar.cc/150?u=${member.user}`}
          style={styles.avatar}
        />
        {member.role === "admin" && (
          <View style={styles.adminBadge}>
            <Shield size={10} color="#000" />
          </View>
        )}
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.user_name}</Text>
        <Text style={styles.memberRole}>
          {member.role === "admin" ? "Organizador" : "Jugador Oficial"}
        </Text>
      </View>
      <ChevronRight size={18} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Sección Directiva */}
      {admins.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={18} color={theme.primary} />
            <Text style={styles.sectionTitle}>DIRECTIVA Y STAFF</Text>
          </View>
          {admins.map((admin) => (
            <RenderMemberItem key={admin.id} member={admin} />
          ))}
        </View>
      )}

      {/* Sección Jugadores */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Users size={18} color={theme.primary} />
          <Text style={styles.sectionTitle}>JUGADORES REGISTRADOS</Text>
        </View>
        {players.length > 0 ? (
          players.map((player) => (
            <RenderMemberItem key={player.id} member={player} />
          ))
        ) : (
          <View style={styles.emptyBox}>
            <User size={30} color={theme.textSecondary} opacity={0.3} />
            <Text style={styles.emptyText}>No hay jugadores inscritos en esta liga aún.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingBottom: 20,
    },
    loader: {
      padding: 40,
      alignItems: "center",
      gap: 15,
    },
    loaderText: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 1,
    },
    section: {
      marginBottom: 30,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 15,
      paddingHorizontal: 5,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "900",
      color: theme.textSecondary,
      letterSpacing: 1.5,
    },
    memberCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      padding: 12,
      borderRadius: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    avatarContainer: {
      position: "relative",
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    },
    adminBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: theme.primary,
      width: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.background,
    },
    memberInfo: {
      flex: 1,
      marginLeft: 15,
    },
    memberName: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
    },
    memberRole: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    emptyBox: {
      alignItems: "center",
      padding: 30,
      backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)",
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 13,
      textAlign: "center",
      marginTop: 10,
      lineHeight: 20,
    },
  });
