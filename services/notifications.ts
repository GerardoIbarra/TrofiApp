import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import api from "./api";

const DEVICE_TOKEN_ID_KEY = "@device_token_id";

// ─────────────────────────────────────────────────────────────────────────────
// NOTA: Firebase Cloud Messaging requiere un build nativo (NO funciona en Expo Go).
// Estas funciones son stubs funcionales para desarrollo con Expo Go.
// Para activar notificaciones reales, se necesita:
// 1. Un custom dev build o APK/IPA
// 2. El archivo google-services.json (Android) y GoogleService-Info.plist (iOS)
// 3. Descomentar el código de Firebase en este archivo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registra el token del dispositivo en el backend.
 * Requiere build nativo con Firebase para funcionar.
 */
export async function registerDeviceToken() {
  // TODO: Activar cuando se tenga build nativo con Firebase
  // try {
  //   const messaging = require('@react-native-firebase/messaging').default;
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  //   if (!enabled) return;
  //   const token = await messaging().getToken();
  //   const response = await api.post<any>('/v1/device-tokens/', { token, platform: Platform.OS });
  //   if (response?.id) {
  //     await AsyncStorage.setItem(DEVICE_TOKEN_ID_KEY, response.id.toString());
  //   }
  // } catch (error) {
  //   console.error('Error al registrar device token:', error);
  // }
  console.log('[Notifications] registerDeviceToken: stub (requiere build nativo)');
}

/**
 * Elimina el token del dispositivo del backend.
 * Requiere build nativo con Firebase para funcionar.
 */
export async function unregisterDeviceToken() {
  // TODO: Activar cuando se tenga build nativo con Firebase
  // try {
  //   const tokenId = await AsyncStorage.getItem(DEVICE_TOKEN_ID_KEY);
  //   if (tokenId) {
  //     await api.delete(`/v1/device-tokens/${tokenId}/`);
  //     await AsyncStorage.removeItem(DEVICE_TOKEN_ID_KEY);
  //   }
  //   const messaging = require('@react-native-firebase/messaging').default;
  //   await messaging().deleteToken();
  // } catch (error) {
  //   console.error('Error al desregistrar device token:', error);
  // }
  console.log('[Notifications] unregisterDeviceToken: stub (requiere build nativo)');
}

/**
 * Configura los listeners de notificaciones push.
 * Requiere build nativo con Firebase para funcionar.
 * @param navigate Callback para manejar la navegación al llegar una notificación
 * @returns Función de cleanup (no-op en este stub)
 */
export function setupNotifications(
  navigate: (screen: string, params: any) => void,
): () => void {
  // TODO: Activar cuando se tenga build nativo con Firebase
  // const messaging = require('@react-native-firebase/messaging').default;
  // const unsubscribe = messaging().onMessage(async (msg) => { ... });
  // messaging().onNotificationOpenedApp((msg) => handleNotificationData(msg.data, navigate));
  // messaging().getInitialNotification().then((msg) => { if (msg) handleNotificationData(msg.data, navigate); });
  // messaging().onTokenRefresh(async (token) => { await api.post('/v1/device-tokens/', { token, platform: Platform.OS }); });
  // return unsubscribe;
  console.log('[Notifications] setupNotifications: stub (requiere build nativo)');
  return () => {}; // noop unsubscribe
}

/**
 * Lógica de navegación basada en la data de la notificación
 */
function handleNotificationData(
  data: any,
  navigate: (screen: string, params: any) => void,
) {
  if (!data) return;
  const { screen, match_id, tournament_id } = data;
  if (screen === "MatchDetail" && match_id) {
    navigate("/match-detail", { id: match_id });
  } else if (tournament_id) {
    navigate("/tournament-detail", { id: tournament_id });
  }
}
