/**
 * Eventos "celebrables" que llegan por push (Expo) o desde el registro
 * persistido de GET /notifications/. Son solo el aviso para animar: la
 * fuente de verdad sigue siendo el endpoint de logros / player cards.
 */

/** De dónde vino el evento: push recibido con la app abierta, o push/fila tocada. */
export type CelebrationSource = 'received' | 'opened';

export interface AchievementCelebration {
  kind: 'achievement';
  key: string;
  source: CelebrationSource;
  achievementId: string;
  achievementType: string;
  /** Texto del push, usado como fallback si el tipo no está en el catálogo local. */
  body?: string;
}

export interface RatingCelebration {
  kind: 'rating';
  key: string;
  source: CelebrationSource;
  playerId: string;
  cardId: string;
  previousOverall: number;
  overall: number;
  direction: 'up' | 'down';
}

export type CelebrationEvent = AchievementCelebration | RatingCelebration;

export const CELEBRATION_NOTIFICATION_TYPES = {
  achievementUnlocked: 'achievement_unlocked',
  ratingChanged: 'rating_changed',
} as const;
