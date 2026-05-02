import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Basado en el estándar de iPhone 11/12/13/14 (375 x 812)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Escala basada en el ancho de la pantalla. 
 * Ideal para: anchos, márgenes horizontales, paddings horizontales, iconos.
 */
export const scale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * Escala basada en el alto de la pantalla.
 * Ideal para: alturas de cards, márgenes verticales, paddings verticales.
 */
export const verticalScale = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * Escala moderada (permite controlar qué tanto escala).
 * Ideal para: FONT SIZE (para que no se vean gigantes en tablets).
 */
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export const Layout = {
  window: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  isSmallDevice: SCREEN_WIDTH < 375,
  isTablet: SCREEN_WIDTH >= 768,
};
