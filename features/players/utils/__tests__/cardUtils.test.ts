import { getContrastInk, DEFAULT_RARITY_COLORS } from '../cardUtils';
import { playerCardSchema } from '@/features/players/schemas/playerProfileSchema';

describe('cardUtils', () => {
  describe('getContrastInk', () => {
    it('returns dark ink for light background colors', () => {
      expect(getContrastInk('#C0C0C0')).toBe('#0A1525'); // silver
      expect(getContrastInk('#D4AF37')).toBe('#0A1525'); // gold
      expect(getContrastInk('#F5F5F0')).toBe('#0A1525'); // icon (bone white)
      expect(getContrastInk('#39FF14')).toBe('#0A1525'); // rookie (bright green)
      expect(getContrastInk('#FFD700')).toBe('#0A1525'); // champion (bright gold)
      expect(getContrastInk('#FFB703')).toBe('#0A1525'); // community (amber)
    });

    it('returns white ink for dark background colors', () => {
      expect(getContrastInk('#CD7F32')).toBe('#FFFFFF'); // bronze
      expect(getContrastInk('#9966CC')).toBe('#FFFFFF'); // elite (amethyst)
      expect(getContrastInk('#17968C')).toBe('#FFFFFF'); // iconic (teal)
      expect(getContrastInk('#000000')).toBe('#FFFFFF'); // legend (black)
      expect(getContrastInk('#FF4500')).toBe('#FFFFFF'); // on_fire (red-orange)
      expect(getContrastInk('#C41E3A')).toBe('#FFFFFF'); // derby (deep red)
      expect(getContrastInk('#4A5D23')).toBe('#FFFFFF'); // veteran (aged bronze)
    });

    it('handles empty or invalid color fallback gracefully', () => {
      expect(getContrastInk(null)).toBe('#FFFFFF');
      expect(getContrastInk(undefined)).toBe('#FFFFFF');
      expect(getContrastInk('')).toBe('#FFFFFF');
    });
  });

  describe('DEFAULT_RARITY_COLORS', () => {
    it('has exact hex definitions corresponding to backend specification', () => {
      expect(DEFAULT_RARITY_COLORS.bronze).toBe('#CD7F32');
      expect(DEFAULT_RARITY_COLORS.silver).toBe('#C0C0C0');
      expect(DEFAULT_RARITY_COLORS.gold).toBe('#D4AF37');
      expect(DEFAULT_RARITY_COLORS.elite).toBe('#9966CC');
      expect(DEFAULT_RARITY_COLORS.iconic).toBe('#17968C');
      expect(DEFAULT_RARITY_COLORS.legend).toBe('#000000');
      expect(DEFAULT_RARITY_COLORS.icon).toBe('#F5F5F0');
      expect(DEFAULT_RARITY_COLORS.champion).toBe('#FFD700');
      expect(DEFAULT_RARITY_COLORS.on_fire).toBe('#FF4500');
      expect(DEFAULT_RARITY_COLORS.veteran).toBe('#4A5D23');
      expect(DEFAULT_RARITY_COLORS.rookie).toBe('#39FF14');
      expect(DEFAULT_RARITY_COLORS.birthday).toBe('#FF69B4');
      expect(DEFAULT_RARITY_COLORS.community).toBe('#FFB703');
      expect(DEFAULT_RARITY_COLORS.derby).toBe('#C41E3A');
    });
  });

  describe('playerCardSchema compatibility', () => {
    it('validates a complete player card response from backend', () => {
      const mockCard = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        player: '123e4567-e89b-12d3-a456-426614174001',
        card_type: 'top_scorer',
        card_type_display: 'Goleador',
        position: 'FW',
        overall: 92,
        pace: 94,
        shooting: 93,
        passing: 84,
        dribbling: 91,
        defense: 42,
        physical: 80,
        rarity: 'iconic',
        rarity_color: '#17968C',
        rarity_label: 'Icónica',
        tournament: '123e4567-e89b-12d3-a456-426614174002',
        tournament_name: 'God Mode Tournament',
        tournament_season_label: 'God Mode Season',
        theme: 'dark',
        last_calculated_at: '2026-09-28T12:00:00Z',
      };

      const parsed = playerCardSchema.parse(mockCard);
      expect(parsed.card_type_display).toBe('Goleador');
      expect(parsed.rarity_label).toBe('Icónica');
      expect(parsed.rarity_color).toBe('#17968C');
      expect(parsed.tournament_name).toBe('God Mode Tournament');
    });

    it('accepts cards with null tournament fields (base/special cards)', () => {
      const mockSpecialCard = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        player: '123e4567-e89b-12d3-a456-426614174001',
        card_type: 'special',
        card_type_display: 'Leyenda',
        position: 'ST',
        overall: 95,
        pace: 90,
        shooting: 96,
        passing: 88,
        dribbling: 92,
        defense: 50,
        physical: 85,
        rarity: 'legend',
        rarity_color: '#000000',
        rarity_label: 'Leyenda',
        tournament: null,
        tournament_name: null,
        tournament_season_label: null,
      };

      const parsed = playerCardSchema.parse(mockSpecialCard);
      expect(parsed.rarity).toBe('legend');
      expect(parsed.tournament).toBeNull();
    });
  });
});
