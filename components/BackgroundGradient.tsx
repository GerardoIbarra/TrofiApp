import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrofiTheme } from '@/constants/theme';

export function BackgroundGradient() {
  return (
    <LinearGradient
      colors={[TrofiTheme.background, '#0D1B2A', '#1B263B']}
      style={StyleSheet.absoluteFill}
    />
  );
}
