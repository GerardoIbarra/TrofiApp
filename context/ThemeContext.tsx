import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme } from '@/constants/theme';

const THEME_STORAGE_KEY = 'user-theme-preference';

type ThemeType = typeof LightTheme;

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Cargar preferencia guardada al iniciar
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        }
      } catch (e) {
        console.error('Error loading theme preference:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();

    // Escuchar cambios en la preferencia del sistema solo si no hay nada guardado
    const subscription = Appearance.addChangeListener(async ({ colorScheme }) => {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === null) {
        setIsDark(colorScheme === 'dark');
      }
    });
    return () => subscription.remove();
  }, []);

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newIsDark ? 'dark' : 'light');
    } catch (e) {
      console.error('Error saving theme preference:', e);
    }
  };

  const theme = isDark ? DarkTheme : LightTheme;

  // Evitar parpadeos de color durante la carga inicial
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return { theme: LightTheme, isDark: false, toggleTheme: () => {} };
  }
  return context;
};
