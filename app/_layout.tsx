import { ThemeProvider } from "@/context/ThemeContext";
import { useAuthStore } from "@/features/auth/store/authStore";
import { loadSavedLanguage } from "@/i18n";
import { LocationService } from "@/services/locationService";
import {
  registerDeviceToken,
  setupNotifications,
} from "@/services/notifications";
import { queryClient } from "@/services/queryClient";
import { asyncStoragePersister } from "@/services/queryPersister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as Location from "expo-location";
import { Stack, router, useNavigationContainerRef } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform, LogBox } from "react-native";
import "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";

LogBox.ignoreLogs([
  "Cannot connect to Expo CLI",
]);

import { ErrorBoundary } from "@/components/ui/feedback/ErrorBoundary";
import { UpdatePrompt } from "@/components/ui/feedback/UpdatePrompt";
import * as Sentry from "@sentry/react-native";

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || "https://e1a140813db3ac1cda5643b6e7d8ffae@o4512019969802240.ingest.us.sentry.io/4512019974389760",
  debug: false,
  enableLogs: false,
  tracesSampleRate: 1.0,
  // profilesSampleRate is relative to tracesSampleRate (100% of transactions profiled)
  profilesSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  enableAutoSessionTracking: true,
  enableNativeFramesTracking: true,
  integrations: [
    navigationIntegration,
    // mobileReplayIntegration requires a native build — disabled in DEV (Expo Go)
    ...(__DEV__ ? [] : [
      Sentry.mobileReplayIntegration({
        maskAllText: true,
        maskAllImages: true,
        maskAllVectors: true,
      }),
    ]),
    // hermesProfilingIntegration requires the native Sentry client to be ready
    // Guard it to avoid "Native Client is not available" at module load time
    ...(!__DEV__ && typeof Sentry.hermesProfilingIntegration === 'function' ? [Sentry.hermesProfilingIntegration()] : []),
    // consoleLoggingIntegration patches console.* globally at init — this causes
    // "Native Client is not available" errors on every console call before the native
    // bridge is ready, which crashes _layout.tsx module evaluation in Expo Go.
    // Disabled entirely to fix the ErrorBoundary crash.
  ],
  tracePropagationTargets: ["localhost", /^https:\/\/api\.trofi\.club/],
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
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (navigationRef) {
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  useEffect(() => {
    initialize();
    loadSavedLanguage();
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
    const handleInitialNavigation = async () => {
      if (!isLoading) {
        SplashScreen.hideAsync();

        // Auto-navigation based on auth state
        if (!isAuthenticated) {
          router.replace("/(auth)");
        } else {
          try {
            const hasSeenOnboarding = await AsyncStorage.getItem("has_seen_onboarding");
            if (hasSeenOnboarding === "true") {
              router.replace("/(tabs)");
            } else {
              router.replace("/onboarding" as any);
            }
          } catch (e) {
            router.replace("/(tabs)");
          }
        }
      }
    };
    handleInitialNavigation();
  }, [isLoading, isAuthenticated]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
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
          persistOptions={{
            persister: asyncStoragePersister,
            maxAge: 1000 * 60 * 60 * 24, // 24 hours cache retention
          }}
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
