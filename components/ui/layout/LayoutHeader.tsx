import { useTheme } from "@/context/ThemeContext";
import { router, usePathname } from "expo-router";
import { Bell, ChevronLeft } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LayoutHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export function LayoutHeader({
  title = "TROFI",
  showBackButton = false,
}: LayoutHeaderProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const isNotificationsScreen = pathname === "/notifications";

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
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
        {!isNotificationsScreen && (
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
            },
          ]}
        >
          <Image
            source={{ uri: "https://i.pravatar.cc/150?u=avatar2" }}
            style={styles.profileImage}
          />
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
    paddingVertical: 15,
    minHeight: 80,
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
    gap: 15,
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
