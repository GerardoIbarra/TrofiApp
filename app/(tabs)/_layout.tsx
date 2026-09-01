import { Tabs } from 'expo-router';
import { BottomTabBar } from '@/components/ui/layout/BottomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="leagues" />
      <Tabs.Screen name="market" />
      <Tabs.Screen name="teams" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="change-password" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
    </Tabs>
  );
}
