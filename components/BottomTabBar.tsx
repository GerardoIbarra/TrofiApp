import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Trophy, Search, Users, User, Home } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TrofiTheme } from '@/constants/theme';

export function BottomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);
  
  const handlePress = (routeName: string, index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (!state) return;
    const isFocused = state.index === index;
    if (!isFocused) {
      navigation.navigate(routeName);
    }
  };

  const currentRouteName = state?.routes[state?.index]?.name || 'index';
  const isLeaguesActive = currentRouteName === 'leagues' || currentRouteName === 'league-detail';

  return (
    <View style={[styles.tabBar, { paddingBottom: bottomPadding, height: 65 + bottomPadding }]}>
      <TabItem 
        icon={<Home size={22} color={currentRouteName === 'index' ? TrofiTheme.primary : TrofiTheme.textSecondary} />} 
        label="Home" 
        active={currentRouteName === 'index'} 
        onPress={() => handlePress('index', 0)}
      />
      <TabItem 
        icon={<Trophy size={22} color={isLeaguesActive ? TrofiTheme.primary : TrofiTheme.textSecondary} />} 
        label="Leagues" 
        active={isLeaguesActive} 
        onPress={() => handlePress('leagues', 1)}
      />
      
      {/* Empty space filler for center tab */}
      <View style={{ width: 60 }} />
      
      <TabItem 
        icon={<Users size={22} color={currentRouteName === 'teams' ? TrofiTheme.primary : TrofiTheme.textSecondary} />} 
        label="Teams" 
        active={currentRouteName === 'teams'}
        onPress={() => handlePress('teams', 4)}
      />
      <TabItem 
        icon={<User size={22} color={currentRouteName === 'profile' ? TrofiTheme.primary : TrofiTheme.textSecondary} />} 
        label="Profile" 
        active={currentRouteName === 'profile'}
        onPress={() => handlePress('profile', 5)}
      />

      {/* Absolutely positioned center tab */}
      <View style={styles.centerTabContainer}>
        <TouchableOpacity 
          style={styles.centerTab}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          activeOpacity={0.8}
        >
          <Search size={26} color="#001A2C" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TabItem({ icon, label, active = false, onPress }: { icon: React.ReactNode, label: string, active?: boolean, onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
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
    backgroundColor: '#050A15',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingTop: 10,
    justifyContent: 'space-around',
    zIndex: 10,
  },
  tabItem: {
    alignItems: 'center',
    width: 60,
  },
  tabLabel: {
    fontSize: 9,
    color: TrofiTheme.textSecondary,
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  activeTabLabel: {
    color: TrofiTheme.primary,
  },
  centerTabContainer: {
    position: 'absolute',
    top: -24,
    left: '50%',
    marginLeft: -30,
    width: 60,
    alignItems: 'center',
    zIndex: 20,
  },
  centerTab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: TrofiTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#050A15',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
