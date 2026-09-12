import * as Location from 'expo-location';

/**
 * In-memory storage for user location and proximity preferences.
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
  radius?: number;
}

let currentUserLocation: UserLocation | null = null;
let defaultRadius: number = 50;

export const LocationService = {
  /**
   * Save location coordinates and optional radius to memory.
   */
  setLocation: (lat: number, lng: number, radius?: number) => {
    currentUserLocation = {
      latitude: lat,
      longitude: lng,
      radius: radius ?? currentUserLocation?.radius ?? defaultRadius,
    };
  },

  /**
   * Set search radius (km).
   */
  setRadius: (radius: number) => {
    defaultRadius = radius;
    if (currentUserLocation) {
      currentUserLocation.radius = radius;
    }
  },

  /**
   * Get current location from memory.
   */
  getLocation: (): UserLocation | null => {
    return currentUserLocation;
  },

  /**
   * Request foreground permission and fetch current GPS coordinates.
   */
  fetchCurrentPosition: async (): Promise<UserLocation | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return currentUserLocation;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const updatedLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        radius: currentUserLocation?.radius ?? 50,
      };
      currentUserLocation = updatedLocation;
      return updatedLocation;
    } catch (err) {
      console.warn('Failed to fetch live GPS position:', err);
      return currentUserLocation;
    }
  },

  /**
   * Clear location.
   */
  clearLocation: () => {
    currentUserLocation = null;
  },
};

