import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onlineManager } from '@tanstack/react-query';
import { WifiOff, Wifi } from 'lucide-react-native';
import { queryClient } from '@/services/queryClient';

export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());
  const [wasOffline, setWasOffline] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return onlineManager.subscribe((online) => {
      setIsOnline(online);
    });
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    } else if (wasOffline) {
      // Revalidación silenciosa de todas las queries activas en pantalla
      queryClient.refetchQueries({ type: 'active' }).catch(() => {});

      // Muestra brevemente el estado de recuperación y luego se oculta
      hideTimer.current = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setWasOffline(false);
        });
      }, 2000);
    } else {
      slideAnim.setValue(-100);
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isOnline, wasOffline, slideAnim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 10 : 0) + 4,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.banner,
          !isOnline ? styles.bannerOffline : styles.bannerOnline,
        ]}
      >
        {!isOnline ? (
          <>
            <WifiOff size={13} color="#F59E0B" />
            <Text style={styles.textOffline}>Sin conexión • Mostrando datos en caché</Text>
          </>
        ) : (
          <>
            <Wifi size={13} color="#10B981" />
            <Text style={styles.textOnline}>Conexión restablecida • Actualizando...</Text>
          </>
        )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerOffline: {
    backgroundColor: '#1E1B18',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  bannerOnline: {
    backgroundColor: '#0F291E',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  textOffline: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '700',
  },
  textOnline: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '700',
  },
});
