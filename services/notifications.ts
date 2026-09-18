import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";
import api from "./api";
import { logger } from "./logger";
// Safe loader for expo-notifications: works in standalone APKs, gracefully fails in Expo Go
let Notifications: typeof import("expo-notifications") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Notifications = require("expo-notifications");
} catch (_) {
  Notifications = null;
}

const DEVICE_TOKEN_ID_KEY = "@device_token_id";

// Configura el comportamiento cuando llega una notificación con la app abierta (foreground)
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Registra el Expo Push Token del dispositivo en el backend.
 * Funciona de forma transparente y segura: si el backend aún no expone
 * el endpoint /v1/device-tokens/, no rompe la app ni arroja excepciones.
 */
export async function registerDeviceToken(): Promise<string | null> {
  if (!Notifications) {
    // expo-notifications not available (e.g., running in Expo Go)
    logger.info("notifications", "expo-notifications unavailable – skipping registration");
    return null;
  }
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
  if (!Notifications) {
    logger.info("notifications", "expo-notifications unavailable – listeners not set up");
    return () => {};
  }
  // 1. Notificación recibida en primer plano (Foreground)
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      logger.info("notifications", "Notificación recibida en primer plano", {
        title: notification.request.content.title,
        data: notification.request.content.data,
      });
    }
  );

  // 2. Notificación tocada por el usuario (Background)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      logger.info("notifications", "Notificación abierta por el usuario", { data });
      handleNotificationData(data, navigate);
    }
  );

  // 3. Notificación que abrió la app si estaba completamente cerrada (Cold boot)
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) {
      const data = response.notification.request.content.data;
      handleNotificationData(data, navigate);
    }
  }).catch(() => {});

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
  const matchId = data.match_id || data.matchId;
  const tournamentId = data.tournament_id || data.tournamentId;
  const leagueId = data.league_id || data.leagueId;
  const teamId = data.team_id || data.teamId;

  if (data.screen === "MatchDetail" || matchId) {
    navigate("/match-detail", { id: matchId });
  } else if (data.screen === "TournamentDetail" || tournamentId) {
    navigate("/tournament-detail", { id: tournamentId });
  } else if (data.screen === "LeagueDetail" || leagueId) {
    navigate("/league-detail", { id: leagueId });
  } else if (data.screen === "TeamDetail" || teamId) {
    navigate("/team-detail", { id: teamId });
  }
}
