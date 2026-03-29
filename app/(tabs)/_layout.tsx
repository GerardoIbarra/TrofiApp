import { Tabs } from 'expo-router';
import { BottomTabBar } from '@/components/BottomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="leagues" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="teams" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
