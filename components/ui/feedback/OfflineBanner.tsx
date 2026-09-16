import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onlineManager } from '@tanstack/react-query';
import { WifiOff } from 'lucide-react-native';

export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());
  const [slideAnim] = useState(() => new Animated.Value(-80));

  useEffect(() => {
    return onlineManager.subscribe((online) => {
      setIsOnline(online);
    });
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOnline ? -80 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOnline, slideAnim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 10 : 0),
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.banner}>
        <WifiOff size={14} color="#FFFFFF" />
        <Text style={styles.text}>Sin conexión a internet</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#B45309',
    paddingVertical: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
