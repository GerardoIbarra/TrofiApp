import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";
import api from "./api";
import { logger } from "./logger";
import {
  dispatchCelebration,
  parseCelebrationEvent,
} from "@/features/notifications/services/celebrationEvents";
// Safe loader for expo-notifications: works in standalone APKs, gracefully fails in Expo Go
let Notifications: typeof import("expo-notifications") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Notifications = require("expo-notifications");
} catch (_) {
  Notifications = null;
}

const DEVICE_TOKEN_ID_KEY = "@device_token_id";
const LAST_HANDLED_RESPONSE_KEY = "@last_handled_notification_response";

// Configura el comportamiento cuando llega una notificación con la app abierta (foreground)
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      // Logros y cambios de overall se muestran con el CelebrationOverlay:
      // evitamos el banner del sistema para no duplicar el aviso.
      const isCelebration = Boolean(
        parseCelebrationEvent(notification.request.content.data)
      );
      return {
        shouldShowAlert: !isCelebration,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: !isCelebration,
        shouldShowList: true,
      };
    },
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
  // Pushes que ya animamos en foreground: si después el usuario los toca,
  // solo navegamos (sin repetir la animación).
  const celebratedInForeground = new Set<string>();

  const handleResponse = async (response: import("expo-notifications").NotificationResponse) => {
    const { identifier, content } = response.notification.request;

    // getLastNotificationResponseAsync puede devolver la misma respuesta en
    // cada arranque: no volver a navegar/animar algo que ya se procesó.
    const lastHandled = await AsyncStorage.getItem(LAST_HANDLED_RESPONSE_KEY).catch(() => null);
    if (lastHandled === identifier) return;
    AsyncStorage.setItem(LAST_HANDLED_RESPONSE_KEY, identifier).catch(() => {});

    logger.info("notifications", "Notificación abierta por el usuario", { data: content.data });
    handleNotificationData(content.data, navigate, {
      celebrate: !celebratedInForeground.has(identifier),
      body: content.body ?? undefined,
    });
  };

  // 1. Notificación recibida en primer plano (Foreground)
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      const { identifier, content } = notification.request;
      logger.info("notifications", "Notificación recibida en primer plano", {
        title: content.title,
        data: content.data,
      });
      const event = dispatchCelebration(content.data, {
        source: "received",
        body: content.body ?? undefined,
      });
      if (event) celebratedInForeground.add(identifier);
    }
  );

  // 2. Notificación tocada por el usuario (Background)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      handleResponse(response);
    }
  );

  // 3. Notificación que abrió la app si estaba completamente cerrada (Cold boot)
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) handleResponse(response);
  }).catch(() => {});

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

export interface NotificationRouteTarget {
  pathname: string;
  params: Record<string, any>;
}

const SCREEN_ROUTE_MAP: Record<string, string> = {
  leaguedetail: "/league-detail",
  league: "/league-detail",
  leagues: "/leagues",

  matchdetail: "/match-detail",
  match: "/match-detail",

  tournamentdetail: "/tournament-detail",
  tournament: "/tournament-detail",

  teamdetail: "/team-detail",
  team: "/team-detail",
  teams: "/teams",

  pickupspotdetail: "/pickup-spot-detail",
  pickupspot: "/pickup-spot-detail",
  pickupdetail: "/pickup-spot-detail",

  playerdetail: "/player-detail",
  player: "/player-detail",
  // rating_changed ("Tu overall cambió") siempre es del propio usuario → su perfil
  playercard: "/profile",

  // achievement_unlocked → los logros viven en un modal dentro del perfil
  achievements: "/profile",

  tournamentteamdetail: "/tournament-team-detail",

  directmessages: "/direct-messages",
  chat: "/direct-messages",

  refereemarketplace: "/referee-marketplace",
  referees: "/referee-marketplace",

  retas: "/retas",
  explore: "/explore",
  market: "/market",
  profile: "/profile",
  notifications: "/notifications",
  nearbymap: "/nearby-map",
  sponsorplacements: "/sponsor-placements",
};

/**
 * Resuelve la ruta y parámetros de navegación a partir del campo `data`
 * de una notificación (push de Expo o API /v1/notifications/).
 *
 * @param rawData Diccionario data de la notificación
 * - data.screen: nombre de pantalla a la que navegar (ej: "LeagueDetail", "MatchDetail", etc.)
 * - Resto de claves: diccionario libre pasado a params (ej: league_id, status, match_id, etc.)
 */
export function resolveNotificationRoute(rawData: any): NotificationRouteTarget | null {
  if (!rawData) return null;

  let payload = rawData;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch (_) {
      return null;
    }
  }

  if (typeof payload !== "object" || payload === null) return null;

  const rawScreen = typeof payload.screen === "string" ? payload.screen.trim() : "";
  const params: Record<string, any> = {};

  // Tratar todas las claves como un diccionario libre
  for (const [key, value] of Object.entries(payload)) {
    if (key === "screen") continue;
    if (value !== undefined && value !== null) {
      params[key] = typeof value === "object" ? JSON.stringify(value) : value;
    }
  }

  const normalized = rawScreen.toLowerCase().replace(/[-_]/g, "");
  let pathname = SCREEN_ROUTE_MAP[normalized] || "";

  if (!pathname && rawScreen) {
    if (rawScreen.startsWith("/")) {
      pathname = rawScreen;
    } else {
      // Convertir camelCase o PascalCase a /kebab-case
      const kebab = "/" + rawScreen.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().replace(/_/g, "-");
      pathname = kebab;
    }
  }

  // Heurística de fallback si no se especificó screen
  if (!pathname) {
    if (payload.match_id || payload.matchId) {
      pathname = "/match-detail";
    } else if (payload.tournament_id || payload.tournamentId) {
      pathname = "/tournament-detail";
    } else if (payload.league_id || payload.leagueId) {
      pathname = "/league-detail";
    } else if (payload.team_id || payload.teamId) {
      pathname = "/team-detail";
    } else if (payload.spot_id || payload.pickup_spot_id || payload.pickupSpotId) {
      pathname = "/pickup-spot-detail";
    } else if (payload.player_id || payload.playerId) {
      pathname = "/player-detail";
    }
  }

  if (!pathname) {
    logger.warn("notifications", "No se pudo resolver la pantalla para los datos de notificación:", payload);
    return null;
  }

  // Garantizar que las pantallas que esperan 'id' como parámetro principal lo tengan disponible
  if (!params.id) {
    if (pathname === "/league-detail" && (payload.league_id || payload.leagueId)) {
      params.id = String(payload.league_id || payload.leagueId);
    } else if (pathname === "/match-detail" && (payload.match_id || payload.matchId)) {
      params.id = String(payload.match_id || payload.matchId);
    } else if (pathname === "/tournament-detail" && (payload.tournament_id || payload.tournamentId)) {
      params.id = String(payload.tournament_id || payload.tournamentId);
    } else if (pathname === "/team-detail" && (payload.team_id || payload.teamId)) {
      params.id = String(payload.team_id || payload.teamId);
    } else if (pathname === "/pickup-spot-detail" && (payload.spot_id || payload.pickup_spot_id || payload.pickupSpotId)) {
      params.id = String(payload.spot_id || payload.pickup_spot_id || payload.pickupSpotId);
    } else if (pathname === "/player-detail" && (payload.player_id || payload.playerId)) {
      params.id = String(payload.player_id || payload.playerId);
    }
  }

  if (normalized === "achievements") {
    params.openAchievements = "1";
  }

  if (pathname === "/player-detail" && !params.playerId && (payload.player_id || payload.playerId || params.id)) {
    params.playerId = String(payload.player_id || payload.playerId || params.id);
  }

  if (pathname === "/direct-messages") {
    if (!params.with && (payload.with || payload.with_user_id || payload.sender_id || payload.userId || payload.user_id)) {
      params.with = String(payload.with || payload.with_user_id || payload.sender_id || payload.userId || payload.user_id);
    }
    if (!params.name && (payload.name || payload.user_name || payload.sender_name)) {
      params.name = String(payload.name || payload.user_name || payload.sender_name);
    }
  }

  return { pathname, params };
}

/**
 * Lógica centralizada de navegación basada en la data de la notificación.
 * Usada tanto por push notifications (Expo) como al tocar filas en NotificationsScreen.
 */
export function handleNotificationData(
  data: any,
  navigate: (screen: string, params: Record<string, any>) => void,
  options: {
    /** `notification_type` del registro persistido (la lista no lo trae en `data`). */
    notificationType?: string | null;
    /** `false` si el evento ya se animó (ej. push recibido en foreground). */
    celebrate?: boolean;
    body?: string;
  } = {}
) {
  // Logros / cambios de overall: animar al abrir, sea desde el push o desde
  // una fila vieja de la lista (el mismo `data` queda persistido).
  if (options.celebrate !== false) {
    dispatchCelebration(data, {
      notificationType: options.notificationType,
      source: "opened",
      body: options.body,
    });
  }

  const route = resolveNotificationRoute(data);
  if (route) {
    logger.info("notifications", "Navegando a pantalla desde notificación", {
      pathname: route.pathname,
      params: route.params,
    });
    navigate(route.pathname, route.params);
  }
}

