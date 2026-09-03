import { create } from 'zustand';
import { User, AuthResponse } from '@/features/auth/types/auth';
import { AuthStorage } from '@/features/auth/services/authStorage';
import { router } from 'expo-router';
import { unregisterDeviceToken } from '@/services/notifications';
import api from '@/services/api';
import { logger } from '@/services/logger';
import { metrics } from '@/services/metrics';


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (response: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const storedUser = await AuthStorage.getUser();
      const token = await AuthStorage.getAccessToken();

      if (storedUser && token) {
        logger.setUser(storedUser);
        set({ user: storedUser, isAuthenticated: true });
      }
    } catch (e) {
      logger.error('auth', 'Failed to initialize auth store', e);
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (response: AuthResponse) => {
    const { access, refresh, user } = response;
    await AuthStorage.saveTokens(access, refresh);
    
    try {
      // Obtenemos el perfil completo para saber si ya eligió un rol
      const meRes = await api.get<any>('/v1/me/', { silent: true });
      await AuthStorage.saveUser(meRes);
      logger.setUser(meRes);
      set({ user: meRes, isAuthenticated: true });

      const hasProfile = meRes.spectator_profile || meRes.player_profile || 
                         meRes.referee_profile || meRes.sponsor_profile || 
                         (meRes.memberships && meRes.memberships.length > 0);

      metrics.trackAuthEvent('login', true);
      if (hasProfile) {
        router.replace('/(tabs)' as any);
      } else {
        router.replace('/role-selection' as any);
      }
    } catch (e) {
      // Si falla /me/, usamos el usuario del response y asumimos que debe ir al home
      await AuthStorage.saveUser(user);
      logger.setUser(user);
      metrics.trackAuthEvent('login', true);
      set({ user, isAuthenticated: true });
      router.replace('/(tabs)' as any);
    }
  },

  signOut: async () => {
    try {
      await unregisterDeviceToken();
    } catch (e) {
      console.warn('Notification unregistration failed during sign out:', e);
    }
    
    try {
      const refresh = await AuthStorage.getRefreshToken();
      if (refresh) {
        // We use fetch directly to avoid the interceptor loop, or we can use api.post with silent
        await api.post('/v1/auth/logout/', { refresh }, { silent: true });
      }
    } catch (e) {
      console.warn('API logout failed, clearing local session anyway:', e);
    }

    await AuthStorage.clearSession();
    logger.clearUser();
    metrics.trackAuthEvent('logout', true);
    set({ user: null, isAuthenticated: false });
    // Limpiar todo el historial de navegación antes de ir a auth
    // Esto evita que el botón "atrás" de Android lleve al usuario
    // de vuelta a pantallas autenticadas después de cerrar sesión
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace('/(auth)' as any);
  },
}));
