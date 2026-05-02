import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { LightTheme, DarkTheme } from '@/constants/theme';

type ThemeType = typeof LightTheme;

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detectar la preferencia inicial del sistema
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark'); 

  useEffect(() => {
    // Escuchar cambios en la preferencia del sistema
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = isDark ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Fallback seguro para cuando el Provider aún no ha montado
    return { theme: LightTheme, isDark: false, toggleTheme: () => {} };
  }
  return context;
};
