import { StyleSheet } from 'react-native';
import { Fonts } from './theme';

export const GlobalStyles = StyleSheet.create({
  // Basic layout wrappers
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  
  // Basic Typography - Layout only (Colors handled by theme)
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
    fontFamily: Fonts.sans,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.sans,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: Fonts.sans,
  },
});
