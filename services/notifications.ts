import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import api from "./api";
import { logger } from "./logger";

const DEVICE_TOKEN_ID_KEY = "@device_token_id";

// Configura el comportamiento cuando llega una notificación con la app abierta (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registra el Expo Push Token del dispositivo en el backend.
 * Funciona de forma transparente y segura: si el backend aún no expone
 * el endpoint /v1/device-tokens/, no rompe la app ni arroja excepciones.
 */
export async function registerDeviceToken(): Promise<string | null> {
  try {
    // 1. Canal de notificación en Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Predeterminado",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#00F0FF",
      });
    }

    // 2. Comprobar / solicitar permisos de notificación
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      logger.info("notifications", "Permiso de notificaciones push no otorgado por el usuario");
      return null;
    }

    // 3. Obtener el Expo Push Token único
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      process.env.EXPO_PUBLIC_PROJECT_ID ??
      "ef2fcc5a-8ec9-40b3-bf4d-b11ccc316b44";

    const pushTokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = pushTokenData.data;

    logger.info("notifications", "Expo push token obtenido con éxito", {
      tokenPreview: token ? `${token.slice(0, 24)}...` : undefined,
    });

    // 4. Enviar token al backend de Trofi
    try {
      const response = await api.post<any>(
        "/v1/device-tokens/",
        {
          token,
          platform: Platform.OS,
        },
        { silent: true }
      );

      if (response?.id) {
        await AsyncStorage.setItem(DEVICE_TOKEN_ID_KEY, response.id.toString());
      }
    } catch (err: any) {
      // El backend todavía puede no tener el endpoint activo; no genera error ni interrumpe la app
      logger.info("notifications", "Endpoint de device-tokens en backend pendiente de integración", {
        status: err?.status,
      });
    }

    return token;
  } catch (error: any) {
    logger.info("notifications", "No se pudo registrar token de notificaciones", {
      message: error?.message,
    });
    return null;
  }
}

/**
 * Elimina el token del dispositivo del backend al cerrar sesión.
 */
export async function unregisterDeviceToken(): Promise<void> {
  try {
    const tokenId = await AsyncStorage.getItem(DEVICE_TOKEN_ID_KEY);

    if (tokenId) {
      try {
        await api.delete(`/v1/device-tokens/${tokenId}/`, { silent: true });
      } catch (_) {}
      await AsyncStorage.removeItem(DEVICE_TOKEN_ID_KEY);
    }
  } catch (error: any) {
    logger.info("notifications", "Error al desregistrar device token", {
      message: error?.message,
    });
  }
}

/**
 * Configura los listeners de notificaciones push y deep-linking.
 * @param navigate Callback para enrutar según la pantalla solicitada
 */
export function setupNotifications(
  navigate: (screen: string, params: any) => void
): () => void {
  // 1. Notificación recibida en primer plano (Foreground)
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      logger.info("notifications", "Notificación recibida en primer plano", {
        title: notification.request.content.title,
        data: notification.request.content.data,
      });
    }
  );

  // 2. Notificación tocada por el usuario (Background o cerrada)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      logger.info("notifications", "Notificación abierta por el usuario", { data });
      handleNotificationData(data, navigate);
    }
  );

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Lógica de navegación basada en la data de la notificación
 */
function handleNotificationData(
  data: any,
  navigate: (screen: string, params: any) => void
) {
  if (!data) return;
  const { screen, match_id, tournament_id, league_id, team_id } = data;

  if (screen === "MatchDetail" || match_id) {
    navigate("/match-detail", { id: match_id });
  } else if (screen === "TournamentDetail" || tournament_id) {
    navigate("/tournament-detail", { id: tournament_id });
  } else if (screen === "LeagueDetail" || league_id) {
    navigate("/league-detail", { id: league_id });
  } else if (screen === "TeamDetail" || team_id) {
    navigate("/team-detail", { id: team_id });
  }
}
