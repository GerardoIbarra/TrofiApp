import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
  View,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

export interface PrimaryButtonProps {
  title?: string;
  label?: string;
  children?: React.ReactNode;
  onPress: (e?: any) => void | Promise<any>;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

export function PrimaryButton({
  title,
  label,
  children,
  onPress,
  style,
  fullWidth,
  disabled,
  isLoading,
}: PrimaryButtonProps) {
  const { theme } = useTheme();
  const textContent = title || label || (typeof children === 'string' ? children : '');

  const handlePress = () => {
    if (disabled || isLoading) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <View
      style={[
        styles.shadowContainer,
        { shadowColor: theme.primary },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      <TouchableOpacity
        style={[styles.button, (disabled || isLoading) && { opacity: 0.6 }]}
        activeOpacity={0.8}
        onPress={handlePress}
        disabled={disabled || isLoading}
      >
        <LinearGradient
          colors={[theme.primary, theme.accent || '#00D1FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#001A2C" />
          ) : children && typeof children !== 'string' ? (
            children
          ) : (
            <Text style={styles.buttonText}>{textContent}</Text>
          )}
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
