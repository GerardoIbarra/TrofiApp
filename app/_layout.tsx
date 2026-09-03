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
import * as Updates from "expo-updates";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";

import { ErrorBoundary } from "@/components/ui/feedback/ErrorBoundary";
import { UpdatePrompt } from "@/components/ui/feedback/UpdatePrompt";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || "https://e1a140813db3ac1cda5643b6e7d8ffae@o4512019969802240.ingest.us.sentry.io/4512019974389760",
  debug: false,
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
});

SplashScreen.preventAutoHideAsync();

const UPDATE_CHECK_TIMEOUT_MS = 5000;

// Forces every cold start to run on the latest published update instead of
// silently downloading it in the background and waiting for a manual tap.
function useUpdateGate() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function runUpdateCheck() {
      if (__DEV__ || !Updates.isEnabled) {
        setIsReady(true);
        return;
      }

      try {
        const check = (async () => {
          const { isAvailable } = await Updates.checkForUpdateAsync();
          if (isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        })();

        await Promise.race([
          check,
          new Promise((resolve) => setTimeout(resolve, UPDATE_CHECK_TIMEOUT_MS)),
        ]);
      } catch (err) {
        console.error("Error checking for updates:", err);
      } finally {
        setIsReady(true);
      }
    }

    runUpdateCheck();
  }, []);

  return isReady;
}

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
        router.replace("/(auth)");
      } else {
        router.replace("/(tabs)");
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

function RootLayout() {
  const isUpdateGateReady = useUpdateGate();

  if (!isUpdateGateReady) return null;

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister }}
        >
          <ThemeAwareStatusBar />
          <InitialNavigation />
          <UpdatePrompt />
        </PersistQueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);

function ThemeAwareStatusBar() {
  const { isDark } = useTheme();
  
  return (
    <StatusBar 
      style={isDark ? "light" : "dark"} 
    />
  );
}
