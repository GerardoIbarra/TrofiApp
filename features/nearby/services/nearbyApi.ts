import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { League } from '@/features/leagues/types/league';
import { Venue } from '@/features/venues/types/venue';
import { PickupSpot } from '@/features/pickup/types/pickup';

export interface NearbyResponse {
  leagues: League[];
  venues: Venue[];
  pickup_spots?: PickupSpot[];
}

interface UseGetNearbyOptions {
  latitude?: number | null;
  longitude?: number | null;
  radius?: number;
  enabled?: boolean;
}

export const useGetNearby = ({
  latitude,
  longitude,
  radius = 50,
  enabled = true,
}: UseGetNearbyOptions) => {
  const hasCoordinates =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  return useQuery({
    queryKey: ['nearby', latitude, longitude, radius],
    queryFn: async (): Promise<NearbyResponse> => {
      if (!hasCoordinates) {
        throw new Error('Coordinates are required for nearby query');
      }

      const query = new URLSearchParams({
        latitude: latitude!.toString(),
        longitude: longitude!.toString(),
        radius: (radius ?? 50).toString(),
        lat: latitude!.toString(),
        lng: longitude!.toString(),
      }).toString();

      const headers: Record<string, string> = {
        'X-Latitude': latitude!.toString(),
        'X-Longitude': longitude!.toString(),
        'X-Radius': (radius ?? 50).toString(),
      };

      const response = await api.get<NearbyResponse>(`/v1/nearby/?${query}`, {
        headers,
      });

      return {
        leagues: response?.leagues || [],
        venues: response?.venues || [],
        pickup_spots: response?.pickup_spots || [],
      };
    },
    enabled: enabled && hasCoordinates,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};
