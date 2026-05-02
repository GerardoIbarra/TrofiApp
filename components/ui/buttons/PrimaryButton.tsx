import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({ title, onPress, style, fullWidth, disabled }: PrimaryButtonProps) {
  const { theme } = useTheme();
  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <View style={[
      styles.shadowContainer,
      { shadowColor: theme.primary },
      fullWidth && { width: '100%' },
      style
    ]}>
      <TouchableOpacity 
        style={[
          styles.button, 
          disabled && { opacity: 0.5 },
        ]}
        activeOpacity={0.8}
        onPress={handlePress}
        disabled={disabled}
      >
        <LinearGradient
          colors={[theme.primary, theme.accent || '#00D1FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    height: 56,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  button: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#001A2C', // Navy profundo para contraste con el cyan
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
