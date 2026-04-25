/**
 * Simple in-memory storage for user location to be used by the API client.
 */

interface UserLocation {
  latitude: number;
  longitude: number;
}

let currentUserLocation: UserLocation | null = null;

export const LocationService = {
  /**
   * Save location to memory.
   */
  setLocation: (lat: number, lng: number) => {
    currentUserLocation = { latitude: lat, longitude: lng };
  },

  /**
   * Get current location from memory.
   */
  getLocation: (): UserLocation | null => {
    return currentUserLocation;
  },

  /**
   * Clear location.
   */
  clearLocation: () => {
    currentUserLocation = null;
  }
};
