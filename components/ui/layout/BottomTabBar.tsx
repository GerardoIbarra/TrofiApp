import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Trophy, Search, Users, User, Home } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

export function BottomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
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
    <View style={[
      styles.tabBar, 
      { 
        paddingBottom: bottomPadding, 
        height: 65 + bottomPadding,
        backgroundColor: isDark ? '#050A15' : '#FFFFFF',
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      }
    ]}>
      <TabItem 
        icon={<Home size={22} color={currentRouteName === 'index' ? theme.primary : theme.textSecondary} />} 
        label="Inicio" 
        active={currentRouteName === 'index'} 
        theme={theme}
        onPress={() => handlePress('index', 0)}
      />
      <TabItem 
        icon={<Trophy size={22} color={isLeaguesActive ? theme.primary : theme.textSecondary} />} 
        label="Ligas" 
        active={isLeaguesActive} 
        theme={theme}
        onPress={() => handlePress('leagues', 1)}
      />
      
      <TabItem 
        isCenter 
        theme={theme} 
        isDark={isDark} 
        handlePress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          handlePress('explore', 2);
        }}
      />
      
      <TabItem
        icon={
          <Users
            size={22}
            color={
              currentRouteName === "teams" ? theme.primary : theme.textSecondary
            }
          />
        }
        label="Equipos"
        active={currentRouteName === "teams"}
        theme={theme}
        onPress={() => handlePress("teams", 3)}
      />
      <TabItem 
        icon={<User size={22} color={currentRouteName === 'profile' ? theme.primary : theme.textSecondary} />} 
        label="Perfil" 
        active={currentRouteName === 'profile'}
        theme={theme}
        onPress={() => handlePress('profile', 4)}
      />
    </View>
  );
}

function TabItem({ icon, label, active = false, theme, onPress, isCenter = false, isDark = false, handlePress }: any) {
  if (isCenter) {
    return (
      <View style={styles.centerTabWrapper}>
        <TouchableOpacity 
          style={[
            styles.centerTab,
            { 
              backgroundColor: theme.primary,
              borderColor: isDark ? '#050A15' : '#FFFFFF',
            }
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Search size={26} color="#001A2C" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
      {icon}
      <Text style={[
        styles.tabLabel, 
        { color: theme.textSecondary },
        active && { color: theme.primary }
      ]}>{label}</Text>
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
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 15,
    zIndex: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  centerTabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    position: 'absolute',
    top: -32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
