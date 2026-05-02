import { ThemeProvider } from "@/context/ThemeContext";
import { useAuthStore } from "@/features/auth/store/authStore";
import "@/i18n";
import { LocationService } from "@/services/locationService";
import {
  registerDeviceToken,
  setupNotifications,
} from "@/services/notifications";
import { queryClient } from "@/services/queryClient";
import { asyncStoragePersister } from "@/services/queryPersister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as Location from "expo-location";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(auth)",
};

function InitialNavigation() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      LocationService.setLocation(
        location.coords.latitude,
        location.coords.longitude,
      );
      //  console.log("📍 Location captured:", location.coords.latitude, location.coords.longitude);
    } catch (err) {
      console.error("Error capturing location:", err);
    }
  };

  // Setup Notification listeners
  useEffect(() => {
    const unsubscribe = setupNotifications((path, params) => {
      router.push({ pathname: path as any, params });
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      registerDeviceToken();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();

      // Auto-navigation based on auth state
      if (!isAuthenticated) {
        router.replace("/(auth)" as any);
      } else {
        router.replace("/(tabs)" as any);
      }
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="league-detail" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <ThemeProvider>
        <InitialNavigation />
        <StatusBar style="auto" />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
