import { isValidMatchId, isUUID } from '../matchValidation';

describe('matchValidation', () => {
  describe('isValidMatchId', () => {
    it('returns false for nil, empty, or whitespace', () => {
      expect(isValidMatchId(undefined)).toBe(false);
      expect(isValidMatchId(null)).toBe(false);
      expect(isValidMatchId('')).toBe(false);
      expect(isValidMatchId('   ')).toBe(false);
    });

    it('returns false for placeholder strings like demo, undefined, null', () => {
      expect(isValidMatchId('demo')).toBe(false);
      expect(isValidMatchId('DEMO')).toBe(false);
      expect(isValidMatchId('demo-1')).toBe(false);
      expect(isValidMatchId('undefined')).toBe(false);
      expect(isValidMatchId('null')).toBe(false);
      expect(isValidMatchId('placeholder')).toBe(false);
      expect(isValidMatchId('[object Object]')).toBe(false);
    });

    it('returns true for real match IDs and UUIDs', () => {
      expect(isValidMatchId('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidMatchId('c8a4d704-5e5d-4f1c-995b-01c51a0dcce9')).toBe(true);
      expect(isValidMatchId('match-uuid-99')).toBe(true);
    });
  });

  describe('isUUID', () => {
    it('returns true for valid UUID formats', () => {
      expect(isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isUUID('C8A4D704-5E5D-4F1C-995B-01C51A0DCCE9')).toBe(true);
    });

    it('returns false for non-UUID strings', () => {
      expect(isUUID('demo')).toBe(false);
      expect(isUUID('12345')).toBe(false);
      expect(isUUID('match-uuid-99')).toBe(false);
      expect(isUUID(null)).toBe(false);
      expect(isUUID(undefined)).toBe(false);
    });
  });
});
