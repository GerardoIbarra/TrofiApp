import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

export function BackgroundGradient() {
  const { theme, isDark } = useTheme();
  
  const colors: [string, string, string] = isDark 
    ? [theme.background, '#0D1B2A', '#1B263B'] 
    : [theme.background, '#F0F2F5', '#E5E7EB'];

  return (
    <LinearGradient
      colors={colors}
      style={StyleSheet.absoluteFill}
    />
  );
}
