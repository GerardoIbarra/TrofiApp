/**
 * Types for Trofi Fan Cards (Ticket 18 & Fan Card spec).
 * FanCard measures fan commitment instead of soccer stats.
 */

export type FanCardRarity = 'bronze' | 'silver' | 'gold' | 'elite' | 'iconic';

export type FanCardType = 'base' | 'season' | 'special';

export interface FanCard {
  id: string;
  user: string; // User UUID
  card_type: FanCardType | string;
  card_type_display?: string | null;
  overall: number;
  /** Total de check-ins históricos */
  passion: number;
  /** Racha de asistencia actual (attendance_streak) */
  loyalty: number;
  /** Check-ins verificados por GPS */
  verification: number;
  /** Cantidad de logros de hincha/árbitro (Achievement) */
  recognition: number;
  rarity: FanCardRarity | string;
  /** Color hex embebido desde backend (mismo que PlayerCard.rarity_color) */
  rarity_color?: string | null;
  /** Label en español provisto por el backend listo para mostrar */
  rarity_label?: string | null;
  theme?: string | null;
  last_calculated_at: string;
}

export interface FanCardListResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: FanCard[];
}
