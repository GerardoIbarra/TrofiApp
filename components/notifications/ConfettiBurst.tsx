import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';

interface ConfettiBurstProps {
  colors: string[];
  count?: number;
}

/**
 * Lluvia de confetti con la API `Animated` nativa (sin dependencias extra).
 * Se monta una vez por celebración — usar `key` para relanzarla.
 */
export function ConfettiBurst({ colors, count = 36 }: ConfettiBurstProps) {
  const { width, height } = useWindowDimensions();

  // Las piezas se generan una sola vez por montaje (inicializador lazy).
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      progress: new Animated.Value(0),
      left: Math.random() * width,
      drift: (Math.random() - 0.5) * 140,
      delay: Math.random() * 400,
      duration: 2000 + Math.random() * 1200,
      spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
      size: 6 + Math.random() * 6,
      round: Math.random() > 0.6,
      color: colors[i % colors.length],
    }))
  );

  useEffect(() => {
    const animation = Animated.parallel(
      pieces.map((piece) =>
        Animated.timing(piece.progress, {
          toValue: 1,
          duration: piece.duration,
          delay: piece.delay,
          easing: Easing.bezier(0.25, 0.6, 0.45, 1),
          useNativeDriver: true,
        })
      )
    );
    animation.start();
    return () => animation.stop();
  }, [pieces]);

  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            top: -24,
            left: piece.left,
            width: piece.size,
            height: piece.round ? piece.size : piece.size * 1.8,
            borderRadius: piece.round ? piece.size / 2 : 2,
            backgroundColor: piece.color,
            opacity: piece.progress.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 1, 0],
            }),
            transform: [
              {
                translateY: piece.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, height + 48],
                }),
              },
              {
                translateX: piece.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, piece.drift],
                }),
              },
              {
                rotate: piece.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${piece.spin}deg`],
                }),
              },
            ],
          }}
        />
      ))}
    </Animated.View>
  );
}
