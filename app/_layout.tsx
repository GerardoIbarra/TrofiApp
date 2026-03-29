import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="league-detail" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
