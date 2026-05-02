import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export default function AuthLayout() {
  useEffect(() => {
    /**
     * Intercepta el botón "atrás" de Android cuando el usuario está en el
     * flujo de autenticación. Esto evita que al cerrar sesión el usuario
     * pueda regresar a pantallas autenticadas presionando "atrás".
     *
     * - Desde la pantalla raíz de auth (index): salir de la app.
     * - Desde sub-pantallas (login, register): dejar que el stack navegue
     *   internamente (ej. register → index).
     */
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      // Obtener el estado actual del router para saber si podemos ir atrás
      const canGoBack = router.canGoBack();
      if (!canGoBack) {
        // Estamos en la raíz del stack de auth → salir de la app
        BackHandler.exitApp();
        return true;
      }
      // Hay pantallas de auth en el stack (ej. register) → navegar hacia atrás
      // internamente, pero sin salir del grupo (auth)
      router.back();
      return true;
    });

    return () => subscription.remove();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth-login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
