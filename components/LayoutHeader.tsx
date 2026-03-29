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
        <Menu size={24} color={TrofiTheme.text} />
      </TouchableOpacity>
      <Text style={styles.logoHeader}>{title}</Text>
      <TouchableOpacity style={styles.profileButton}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }} 
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
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoHeader: {
    fontSize: 20,
    fontWeight: '900',
    color: TrofiTheme.text,
    letterSpacing: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: TrofiTheme.primary,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
});
