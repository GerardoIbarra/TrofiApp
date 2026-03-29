import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Trophy, Search, Users, User, ArrowUpRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrofiTheme } from '@/constants/theme';

export function BottomTabBar() {
  const insets = useSafeAreaInsets();
  
  // En Android si insets.bottom es 0, podemos usar un pad seguro pequeño
  const bottomPadding = Math.max(insets.bottom, 10);
  
  return (
    <View style={[styles.tabBar, { paddingBottom: bottomPadding, height: 65 + bottomPadding }]}>
      <TabItem icon={<Trophy size={24} color={TrofiTheme.primary} />} label="Leagues" active />
      <TabItem icon={<ArrowUpRight size={24} color={TrofiTheme.textSecondary} />} label="Explore" />
      
      {/* Empty space filler for center tab */}
      <View style={{ width: 70 }} />
      
      <TabItem icon={<Users size={24} color={TrofiTheme.textSecondary} />} label="Teams" />
      <TabItem icon={<User size={24} color={TrofiTheme.textSecondary} />} label="Profile" />

      {/* Absolutely positioned center tab so it always hovers perfectly */}
      <View style={styles.centerTabContainer}>
        <TouchableOpacity style={styles.centerTab}>
          <Search size={28} color="#001A2C" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TabItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <TouchableOpacity style={styles.tabItem}>
      {icon}
      <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#050A15',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingTop: 10,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    width: 60,
  },
  tabLabel: {
    fontSize: 9,
    color: TrofiTheme.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: TrofiTheme.primary,
  },
  centerTabContainer: {
    position: 'absolute',
    top: -25,
    left: '50%',
    marginLeft: -35,
    width: 70,
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  centerTab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: TrofiTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#050A15',
  },
});
