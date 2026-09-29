/**
 * Utility functions, types, and constants for Trofi Player Cards.
 */

export interface UltimateCardData {
  id?: string;
  overall?: number | null;
  position?: string | null;
  pace?: number | null;
  shooting?: number | null;
  passing?: number | null;
  dribbling?: number | null;
  defense?: number | null;
  physical?: number | null;
  generated_image?: string | null;
  rarity?: string | null;
  rarity_color?: string | null;
  rarity_label?: string | null;
  card_type?: string | null;
  card_type_display?: string | null;
  tournament?: string | null;
  tournament_name?: string | null;
  tournament_season_label?: string | null;
  theme?: string | null;
  last_calculated_at?: string | null;
}

// Fallback colors in case backend does not embed rarity_color
export const DEFAULT_RARITY_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#D4AF37",
  elite: "#9966CC",
  iconic: "#17968C",
  legend: "#000000",
  icon: "#F5F5F0",
  champion: "#FFD700",
  on_fire: "#FF4500",
  veteran: "#4A5D23",
  rookie: "#39FF14",
  birthday: "#FF69B4",
  community: "#FFB703",
  derby: "#C41E3A",
};

/**
 * Calculates optimal text/ink contrast (dark or white) based on the background hex color.
 */
export function getContrastInk(hexColor?: string | null): string {
  if (!hexColor) return "#FFFFFF";
  const cleanHex = hexColor.replace("#", "").trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? "#0A1525" : "#FFFFFF";
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? "#0A1525" : "#FFFFFF";
  }
  return "#FFFFFF";
}
