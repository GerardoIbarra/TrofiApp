import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Menu } from 'lucide-react-native';
import { TrofiTheme } from '@/constants/theme';

interface LayoutHeaderProps {
  title?: string;
}

export function LayoutHeader({ title = 'TROFI' }: LayoutHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuButton}>
        <Menu size={24} color={TrofiTheme.primary} />
      </TouchableOpacity>
      <Text style={styles.logoHeader}>{title}</Text>
      <TouchableOpacity style={styles.profileButton}>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/150?u=luis' }} 
          style={styles.profileImage} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    minHeight: 70,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoHeader: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
});
