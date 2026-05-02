import { create } from 'zustand';
import { User, AuthResponse } from '@/features/auth/types/auth';
import { AuthStorage } from '@/features/auth/services/authStorage';
import { router } from 'expo-router';
import { unregisterDeviceToken } from '@/services/notifications';

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
        set({ user: storedUser, isAuthenticated: true });
      }
    } catch (e) {
      console.error('Failed to initialize auth store', e);
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (response: AuthResponse) => {
    const { access, refresh, user } = response;
    await AuthStorage.saveTokens(access, refresh);
    await AuthStorage.saveUser(user);
    set({ user, isAuthenticated: true });
    router.replace('/(tabs)' as any);
  },

  signOut: async () => {
    try {
      await unregisterDeviceToken();
    } catch (e) {
      console.warn('Notification unregistration failed during sign out:', e);
    }
    await AuthStorage.clearSession();
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
