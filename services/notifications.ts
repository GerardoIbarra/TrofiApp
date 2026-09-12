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
  // Stub for Expo Go - push notifications require native Firebase build
}

/**
 * Elimina el token del dispositivo del backend.
 * Requiere build nativo con Firebase para funcionar.
 */
export async function unregisterDeviceToken() {
  // Stub for Expo Go
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
