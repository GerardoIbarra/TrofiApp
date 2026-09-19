import {
  DisciplinaryRecordSchema,
  SuspensionSchema,
  SuspensionCarryoverSchema,
  DisciplinaryCardTypeEnum,
  SuspensionReasonEnum,
} from '../disciplineSchema';

describe('Discipline Schemas', () => {
  describe('DisciplinaryCardTypeEnum', () => {
    it('should validate yellow, red, and second_yellow', () => {
      expect(DisciplinaryCardTypeEnum.safeParse('yellow').success).toBe(true);
      expect(DisciplinaryCardTypeEnum.safeParse('red').success).toBe(true);
      expect(DisciplinaryCardTypeEnum.safeParse('second_yellow').success).toBe(true);
      expect(DisciplinaryCardTypeEnum.safeParse('blue').success).toBe(false);
    });
  });

  describe('SuspensionReasonEnum', () => {
    it('should validate all suspension reasons including carryover and direct red', () => {
      expect(SuspensionReasonEnum.safeParse('accumulated_yellows').success).toBe(true);
      expect(SuspensionReasonEnum.safeParse('red_card').success).toBe(true);
      expect(SuspensionReasonEnum.safeParse('direct_red').success).toBe(true);
      expect(SuspensionReasonEnum.safeParse('manual').success).toBe(true);
      expect(SuspensionReasonEnum.safeParse('season_carryover').success).toBe(true);
      expect(SuspensionReasonEnum.safeParse('carryover').success).toBe(true);
      expect(SuspensionReasonEnum.safeParse('unknown_reason').success).toBe(false);
    });
  });

  describe('DisciplinaryRecordSchema', () => {
    it('should parse a record with second_yellow', () => {
      const record = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        tournament: '123e4567-e89b-12d3-a456-426614174001',
        roster_membership: '123e4567-e89b-12d3-a456-426614174002',
        player_name: 'Carlos Vela',
        team_name: 'Los Ángeles',
        match: '123e4567-e89b-12d3-a456-426614174003',
        card_type: 'second_yellow',
        minute: 78,
        created_at: '2026-03-01T10:00:00Z',
      };

      const result = DisciplinaryRecordSchema.safeParse(record);
      expect(result.success).toBe(true);
    });
  });

  describe('SuspensionCarryoverSchema', () => {
    it('should parse carryover record', () => {
      const carryover = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        suspension: '123e4567-e89b-12d3-a456-426614174001',
        player_name: 'Guillermo Ochoa',
        from_tournament: '123e4567-e89b-12d3-a456-426614174002',
        to_tournament: '123e4567-e89b-12d3-a456-426614174003',
        matches_remaining: 2,
        created_at: '2026-03-01T10:00:00Z',
      };

      const result = SuspensionCarryoverSchema.safeParse(carryover);
      expect(result.success).toBe(true);
    });
  });
});
