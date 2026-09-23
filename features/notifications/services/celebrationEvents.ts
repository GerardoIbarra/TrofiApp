import { queryClient } from '@/services/queryClient';
import { useCelebrationStore } from '../store/celebrationStore';
import {
  CELEBRATION_NOTIFICATION_TYPES,
  CelebrationEvent,
  CelebrationSource,
} from '../types/celebration';

// Los logros de liga no tienen un usuario a quien animarle nada.
const LEAGUE_ACHIEVEMENT_TYPES = new Set(['league_spotlight', 'fastest_growing_league']);

let keyCounter = 0;
const nextKey = () => `celebration-${Date.now()}-${++keyCounter}`;

function normalizePayload(rawData: unknown): Record<string, any> | null {
  let payload = rawData;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (_) {
      return null;
    }
  }
  if (typeof payload !== 'object' || payload === null) return null;
  return payload as Record<string, any>;
}

const normalizeScreen = (screen: unknown) =>
  typeof screen === 'string' ? screen.toLowerCase().replace(/[-_\s]/g, '') : '';

const toNumber = (value: unknown): number | null => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

/**
 * Interpreta el `data` de una notificación y devuelve el evento a animar, o
 * `null` si no es un `achievement_unlocked` / `rating_changed`.
 *
 * `notificationType` viene del registro persistido (`notification_type`); en
 * el push de Expo puede no venir, así que también se reconoce por la forma
 * del payload (`screen` + campos propios de cada evento).
 */
export function parseCelebrationEvent(
  rawData: unknown,
  options: { notificationType?: string | null; source?: CelebrationSource; body?: string } = {}
): CelebrationEvent | null {
  const data = normalizePayload(rawData);
  if (!data) return null;

  const source = options.source ?? 'opened';
  const type = String(
    options.notificationType ?? data.notification_type ?? data.type ?? ''
  ).toLowerCase();
  const screen = normalizeScreen(data.screen);

  const looksLikeAchievement =
    type === CELEBRATION_NOTIFICATION_TYPES.achievementUnlocked ||
    (!type && screen === 'achievements' && data.achievement_type);

  if (looksLikeAchievement) {
    const achievementType = typeof data.achievement_type === 'string' ? data.achievement_type : '';
    if (!achievementType || LEAGUE_ACHIEVEMENT_TYPES.has(achievementType)) return null;
    return {
      kind: 'achievement',
      key: nextKey(),
      source,
      achievementId: String(data.achievement_id ?? achievementType),
      achievementType,
      body: options.body,
    };
  }

  const looksLikeRating =
    type === CELEBRATION_NOTIFICATION_TYPES.ratingChanged ||
    (!type && screen === 'playercard' && data.card_id && data.overall != null);

  if (looksLikeRating) {
    const overall = toNumber(data.overall);
    const previousOverall = toNumber(data.previous_overall);
    if (overall === null || previousOverall === null || !data.card_id) return null;
    const direction =
      data.direction === 'up' || data.direction === 'down'
        ? data.direction
        : overall >= previousOverall
        ? 'up'
        : 'down';
    return {
      kind: 'rating',
      key: nextKey(),
      source,
      playerId: String(data.player_id ?? ''),
      cardId: String(data.card_id),
      previousOverall,
      overall,
      direction,
    };
  }

  return null;
}

/**
 * Refresca las pantallas afectadas desde sus endpoints normales. El payload
 * del push es solo el aviso, no la fuente de datos de la UI.
 */
function refreshAffectedQueries(event: CelebrationEvent) {
  queryClient.invalidateQueries({ queryKey: ['notifications'] });

  if (event.kind === 'achievement') {
    queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
    queryClient.invalidateQueries({ queryKey: ['player-achievements'] });
    return;
  }

  if (event.playerId) {
    queryClient.invalidateQueries({ queryKey: ['player-profile', event.playerId] });
    queryClient.invalidateQueries({ queryKey: ['player-cards', event.playerId] });
  } else {
    queryClient.invalidateQueries({ queryKey: ['player-profile'] });
    queryClient.invalidateQueries({ queryKey: ['player-cards'] });
  }
}

/**
 * Punto de entrada único: si la notificación es un evento celebrable, lo
 * encola para el `CelebrationOverlay` y refresca los datos. Devuelve el
 * evento reconocido (aunque se haya deduplicado) o `null`.
 */
export function dispatchCelebration(
  rawData: unknown,
  options: { notificationType?: string | null; source?: CelebrationSource; body?: string } = {}
): CelebrationEvent | null {
  const event = parseCelebrationEvent(rawData, options);
  if (!event) return null;

  useCelebrationStore.getState().enqueue(event);
  refreshAffectedQueries(event);
  return event;
}
