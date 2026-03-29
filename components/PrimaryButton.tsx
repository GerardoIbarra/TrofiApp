import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrofiTheme } from '@/constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export function PrimaryButton({ title, onPress, style, fullWidth }: PrimaryButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, fullWidth && { width: '100%' }, style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <LinearGradient
        colors={[TrofiTheme.primary, '#00D1FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.buttonGradient}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: TrofiTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#001A2C',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
