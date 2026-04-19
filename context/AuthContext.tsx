import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '@/types/auth';
import { AuthStorage } from '@/services/authStorage';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (response: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load session on startup
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedUser = await AuthStorage.getUser();
      const token = await AuthStorage.getAccessToken();

      if (storedUser && token) {
        setUser(storedUser);
      }
    } catch (e) {
      console.error('Failed to load storage data', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(response: AuthResponse) {
    const { access, refresh, user: userData } = response;
    await AuthStorage.saveTokens(access, refresh);
    await AuthStorage.saveUser(userData);
    setUser(userData);
    router.replace('/(tabs)' as any);
  }

  async function signOut() {
    await AuthStorage.clearSession();
    setUser(null);
    router.replace('/(auth)/signin' as any);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
