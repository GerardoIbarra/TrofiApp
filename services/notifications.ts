import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import api from "./api";

const DEVICE_TOKEN_ID_KEY = "@device_token_id";

/**
 * Registra el token del dispositivo en el backend
 */
export async function registerDeviceToken() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      // console.log('Permiso de notificaciones denegado');
      return;
    }

    const token = await messaging().getToken();
    // console.log('FCM Token:', token);

    // Enviamos el token al backend
    const response = await api.post<any>("/v1/device-tokens/", {
      token,
      platform: Platform.OS, // 'ios' o 'android'
    });

    // Guardamos el ID que nos regresa el back para poder borrarlo al hacer logout
    if (response?.id) {
      await AsyncStorage.setItem(
        DEVICE_TOKEN_ID_KEY,
        response.id.toString(),
      );
    }
  } catch (error) {
    console.error("Error al registrar device token:", error);
  }
}

/**
 * Elimina el token del dispositivo del backend y de Firebase
 */
export async function unregisterDeviceToken() {
  try {
    const tokenId = await AsyncStorage.getItem(DEVICE_TOKEN_ID_KEY);

    if (tokenId) {
      await api.delete(`/v1/device-tokens/${tokenId}/`);
      await AsyncStorage.removeItem(DEVICE_TOKEN_ID_KEY);
    }

    await messaging().deleteToken();
  } catch (error) {
    console.error("Error al desregistrar device token:", error);
  }
}

/**
 * Configura los listeners de notificaciones
 * @param navigate Callback para manejar la navegación
 */
export function setupNotifications(
  navigate: (screen: string, params: any) => void,
) {
  // 1. Notificaciones en primer plano (Foreground)
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log("Notificación en primer plano:", remoteMessage);
    // Aquí se podría mostrar un Toast o banner interno si se desea
  });

  // 2. Click en notificación cuando la app está en segundo plano (Background)
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log("Notificación abierta desde background:", remoteMessage);
    handleNotificationData(remoteMessage.data, navigate);
  });

  // 3. Click en notificación cuando la app estaba cerrada (Cold Start)
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log("Notificación inicial (cold start):", remoteMessage);
        handleNotificationData(remoteMessage.data, navigate);
      }
    });

  // 4. Manejo de rotación de tokens
  messaging().onTokenRefresh(async (newToken) => {
    console.log("Token refrescado:", newToken);
    await api.post("/v1/device-tokens/", {
      token: newToken,
      platform: Platform.OS,
    });
  });

  return unsubscribe;
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
