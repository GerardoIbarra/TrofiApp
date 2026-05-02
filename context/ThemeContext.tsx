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
  // Inicializar basado en la preferencia del usuario o sistema
  // El usuario pidió "default light o auto", usaremos light como base inicial manual
  const [isDark, setIsDark] = useState(false); 

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
