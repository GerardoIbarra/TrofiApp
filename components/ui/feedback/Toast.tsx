import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [slideAnim] = useState(() => new Animated.Value(-140));
  const [cachedToast, setCachedToast] = useState<ToastData | null>(toast);

  if (toast && toast !== cachedToast) {
    setCachedToast(toast);
  }

  useEffect(() => {
    if (toast) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -140,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setCachedToast(null);
        }
      });
    }
  }, [toast, slideAnim]);

  const data = toast ?? cachedToast;
  if (!data) return null;

  const Icon = ICONS[data.type];
  const accent =
    data.type === 'success' ? theme.success : data.type === 'error' ? theme.error : theme.primary;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 10), transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onDismiss}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? '#112240' : '#FFFFFF',
            borderColor: accent + '40',
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: accent + '20' }]}>
          <Icon size={18} color={accent} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {data.title}
          </Text>
          {data.message ? (
            <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
              {data.message}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        >
          <X size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
  },
  message: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
});
