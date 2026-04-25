import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/queryClient';
import { ThemeProvider } from '@/context/ThemeContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import * as Location from 'expo-location';
import { LocationService } from '@/services/locationService';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(auth)',
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
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      LocationService.setLocation(location.coords.latitude, location.coords.longitude);
      console.log("📍 Location captured:", location.coords.latitude, location.coords.longitude);
    } catch (err) {
      console.error("Error capturing location:", err);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
      
      // Auto-navigation based on auth state
      if (!isAuthenticated) {
        router.replace('/(auth)' as any);
      } else {
        router.replace('/(tabs)' as any);
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <InitialNavigation />
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
