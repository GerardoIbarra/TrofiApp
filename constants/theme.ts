import { Platform } from 'react-native';

export const LightTheme = {
  primary: '#00F5FF',
  background: '#F8F9FB', // Blanco/Gris muy claro
  surface: '#FFFFFF',    // Blanco puro para tarjetas
  text: '#001A2C',       // Navy profundo para texto claro
  textSecondary: '#64748B',
  accent: '#00D1FF',
  success: '#10B981',
  error: '#EF4444',
  border: '#E2E8F0',
  tint: '#001A2C',
};

export const DarkTheme = {
  primary: '#00F5FF',
  background: '#0A192F', // Navy oscuro profundo
  surface: '#112240',    // Navy intermedio para tarjetas
  text: '#FFFFFF',
  textSecondary: '#8892B0',
  accent: '#64FFDA',
  success: '#4ADE80',
  error: '#F87171',
  border: '#233554',
  tint: '#FFFFFF',
};

export const TrofiTheme = DarkTheme; // Retrocompatibilidad (por defecto Dark)

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
