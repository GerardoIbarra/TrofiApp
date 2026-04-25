import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

interface LayoutHeaderProps {
  title?: string;
}

export function LayoutHeader({ title = "TROFI" }: LayoutHeaderProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.header}>
      <Text
        style={[styles.logoHeader, { color: isDark ? "#F8FAFC" : theme.text }]}
      >
        {title}
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/profile" as any)}
        style={[
          styles.profileButton,
          { borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" },
        ]}
      >
        <Image
          source={{ uri: "https://i.pravatar.cc/150?u=avatar2" }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
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
    minHeight: 70,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  logoHeader: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
    fontStyle: "italic",
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
