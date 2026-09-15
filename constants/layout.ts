import { Dimensions, Platform, PixelRatio } from 'react-native';

// Basado en el estándar de iPhone 11/12/13/14 (375 x 812)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Escala basada en el ancho de la pantalla.
 * Ideal para: anchos, márgenes horizontales, paddings horizontales, iconos.
 * Lee Dimensions.get() en cada llamada (no cachea el valor a nivel de módulo)
 * para reflejar cambios de tamaño en web/split-screen/foldables.
 */
export const scale = (size: number) => {
  const { width } = Dimensions.get('window');
  return (width / guidelineBaseWidth) * size;
};

/**
 * Escala basada en el alto de la pantalla.
 * Ideal para: alturas de cards, márgenes verticales, paddings verticales.
 */
export const verticalScale = (size: number) => {
  const { height } = Dimensions.get('window');
  return (height / guidelineBaseHeight) * size;
};

/**
 * Escala moderada (permite controlar qué tanto escala).
 * Ideal para: FONT SIZE (para que no se vean gigantes en tablets).
 */
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export const getLayout = () => {
  const { width, height } = Dimensions.get('window');
  return {
    window: { width, height },
    isSmallDevice: width < 375,
    isTablet: width >= 768,
  };
};

/** @deprecated Snapshot tomado al importar el módulo — usar getLayout() para un valor siempre actualizado. */
export const Layout = getLayout();
