import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { useTheme } from '@/context/ThemeContext';

interface NotFoundStateProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function NotFoundState({ title, message, actionLabel, onAction }: NotFoundStateProps) {
  const { theme } = useTheme();

  return (
    <View style={[GlobalStyles.container, styles.container]}>
      <BackgroundGradient />
      <AlertTriangle size={40} color={theme.textSecondary} />
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={onAction}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14,
  },
});
