import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { TrofiTheme } from '@/constants/theme';

interface LeagueTabsListProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = ['STANDINGS', 'MATCHES', 'PLAYERS', 'NEWS'];

export function LeagueTabsList({ activeTab, onTabChange }: LeagueTabsListProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => onTabChange(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 15,
    paddingBottom: 15, // Espacio para el borde inferior si es que se necesita margin visual
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: TrofiTheme.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
  },
  activeTabText: {
    color: TrofiTheme.background, // Letra oscura sobre barra cyan
  },
});
