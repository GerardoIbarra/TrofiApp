/**
 * Utility functions for validating match IDs and preventing placeholder/unresolved values
 * (such as "demo", "undefined", "null") from reaching the backend endpoints.
 */

// Standard UUID format: 8-4-4-4-12 hex characters
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PLACEHOLDER_VALUES = new Set([
  'demo',
  'undefined',
  'null',
  'placeholder',
  '[object object]',
  'nan',
  'none',
  'false',
]);

/**
 * Checks if an ID string is a valid standard UUID.
 */
export function isUUID(id?: string | null): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return UUID_REGEX.test(id.trim());
}

/**
 * Validates that a matchId is real and resolved before performing API requests.
 * Rejects undefined, null, empty strings, "demo", and other common placeholders.
 */
export function isValidMatchId(id?: string | null): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  const cleanId = id.trim().toLowerCase();
  if (
    cleanId === '' ||
    PLACEHOLDER_VALUES.has(cleanId) ||
    cleanId.startsWith('demo') ||
    cleanId.includes('placeholder')
  ) {
    return false;
  }
  return true;
}

/**
 * Validates generic entity IDs (user, league, tournament, sponsor) to avoid
 * shooting requests with 'demo', 'undefined', 'null', or placeholder strings.
 */
export const isValidEntityId = isValidMatchId;

