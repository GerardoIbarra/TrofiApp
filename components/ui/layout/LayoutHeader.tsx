import { useTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/features/auth/store/authStore";
import { router, usePathname } from "expo-router";
import { Bell, ChevronLeft, MessageSquare, User, Flame } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetConversations } from "@/features/chat/services/chatApi";

interface LayoutHeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

export function LayoutHeader({
  title = "TROFI",
  showBackButton = false,
  rightElement,
}: LayoutHeaderProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const isNotificationsScreen = pathname === "/notifications";
  const isDMsScreen = pathname === "/direct-messages";
  const isRetasScreen = pathname === "/retas";

  const { data: conversations } = useGetConversations();
  const totalUnreadDMs =
    conversations?.reduce((sum, c) => sum + (c.unread_count || 0), 0) || 0;

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={28} color={theme.text} />
          </TouchableOpacity>
        )}
        <Text
          style={[
            styles.logoHeader,
            { color: isDark ? "#F8FAFC" : theme.text },
            showBackButton && { marginLeft: 10 },
          ]}
        >
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {rightElement}
        {!isRetasScreen && !rightElement && (
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push("/retas" as any)}
          >
            <Flame size={20} color="#F59E0B" />
          </TouchableOpacity>
        )}
        {!isDMsScreen && !rightElement && (
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push("/direct-messages" as any)}
          >
            <MessageSquare size={21} color={theme.primary} />
            {totalUnreadDMs > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        )}
        {!isNotificationsScreen && !rightElement && (
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push("/notifications" as any)}
          >
            <Bell size={22} color={theme.primary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile" as any)}
          style={[
            styles.profileButton,
            {
              borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
              backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          {user?.photo ? (
            <Image
              source={{ uri: user.photo }}
              style={styles.profileImage}
            />
          ) : (
            <User size={18} color={theme.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    minHeight: 56,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  logoHeader: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
    fontStyle: "italic",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4B4B",
    borderWidth: 1.5,
    borderColor: "#001A2C", // Background color approx
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
});
