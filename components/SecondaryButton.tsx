import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  disabled?: boolean;
}

export function SecondaryButton({ title, onPress, style, fullWidth, disabled }: SecondaryButtonProps) {
  const { theme, isDark } = useTheme();
  
  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { 
          borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        },
        fullWidth && { width: '100%' }, 
        disabled && { opacity: 0.5 },
        style
      ]}
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
