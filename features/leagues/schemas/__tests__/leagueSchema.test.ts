import { leagueSchema } from '../leagueSchema';

describe('leagueSchema', () => {
  it('should validate a valid league object', () => {
    const validData = {
      name: 'Liga Premier MX',
      city: 'Guadalajara',
      country: 'México',
      latitude: 20.6597,
      longitude: -103.3496,
    };

    const result = leagueSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject a league name shorter than 3 characters', () => {
    const invalidData = {
      name: 'AB',
      city: 'Guadalajara',
      country: 'México',
    };

    const result = leagueSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre debe tener al menos 3 caracteres');
    }
  });

  it('should reject when city is empty', () => {
    const invalidData = {
      name: 'Liga Mayor',
      city: '',
      country: 'México',
    };

    const result = leagueSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should transform empty string coordinates to null', () => {
    const dataWithEmptyCoords = {
      name: 'Liga Interbarrial',
      city: 'Monterrey',
      country: 'México',
      latitude: '',
      longitude: '',
    };

    const result = leagueSchema.safeParse(dataWithEmptyCoords);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.latitude).toBeNull();
      expect(result.data.longitude).toBeNull();
    }
  });
});
