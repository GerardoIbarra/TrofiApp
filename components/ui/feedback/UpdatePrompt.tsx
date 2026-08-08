import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { RefreshCw, Sparkles } from 'lucide-react-native';

export function UpdatePrompt() {
  const { isUpdatePending, isUpdateAvailable } = Updates.useUpdates();
  const slideAnim = useRef(new Animated.Value(150)).current; // starts offscreen at bottom

  useEffect(() => {
    if (isUpdatePending || isUpdateAvailable) {
      // Slide up
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Slide down
      Animated.timing(slideAnim, {
        toValue: 150,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isUpdatePending, isUpdateAvailable]);

  const handleUpdate = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Failed to reload update:', error);
      if (Platform.OS === 'web') {
        window.location.reload();
      }
    }
  };

  if (!isUpdatePending && !isUpdateAvailable) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Sparkles size={20} color="#00F5FF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isUpdatePending ? "¡Nueva versión lista!" : "Instalando mejoras..."}
          </Text>
          <Text style={styles.subtitle}>
            {isUpdatePending 
              ? "Actualiza ahora para disfrutar de las últimas novedades." 
              : "Descargando la última versión en segundo plano..."}
          </Text>
        </View>
        {isUpdatePending && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <RefreshCw size={14} color="#001A2C" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Actualizar</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#112240', // Navy intermedio
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: '#8892B0',
    lineHeight: 15,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#00F5FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#001A2C',
    fontSize: 12,
    fontWeight: '800',
  },
});
