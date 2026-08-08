import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import * as Updates from 'expo-updates';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    if (Platform.OS === 'web' && 
        (error.message?.includes('ChunkLoadError') || 
         error.message?.includes('Loading chunk') ||
         error.message?.includes('Failed to fetch dynamically imported module'))) {
      try {
        window.location.reload();
      } catch (e) {
        // fallback
      }
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Global Error]", error, errorInfo);
    // Aquí podrías agregar Sentry más adelante:
    // Sentry.captureException(error, { extra: errorInfo });
  }

  private handleRestart = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Updates.reloadAsync();
      } else {
        window.location.reload();
      }
    } catch (e) {
      this.setState({ hasError: false, error: null });
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <AlertCircle size={64} color="#EF4444" />
            </View>
            
            <Text style={styles.title}>¡Oops! Algo salió mal</Text>
            <Text style={styles.subtitle}>
              La aplicación encontró un error inesperado. Hemos sido notificados y estamos trabajando en ello.
            </Text>

            {__DEV__ && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.button} 
              onPress={this.handleRestart}
              activeOpacity={0.8}
            >
              <RefreshCw size={20} color="#001A2C" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Reiniciar Aplicación</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

// Configuración global para errores de JS fuera de React
if (!__DEV__) {
  const defaultHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error("Global JS Error:", error, isFatal);
    // En producción, podrías forzar el reinicio o loggear a Sentry
    defaultHandler(error, isFatal);
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F', // Navy Profundo
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8892B0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorBox: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  button: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#00F5FF',
    borderRadius: 16,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#001A2C',
    fontSize: 16,
    fontWeight: '800',
  },
});
