import { League } from '@/features/leagues/types/league';
import { Venue } from '@/features/venues/types/venue';
import { PickupSpot } from '@/features/pickup/types/pickup';

export type NearbyItemType = 'league' | 'venue' | 'spot';

export interface SelectedNearbyEntity {
  type: NearbyItemType;
  item: League | Venue | PickupSpot;
}

export interface NearbyMapProps {
  userLatitude: number;
  userLongitude: number;
  radiusKm: number;
  leagues: League[];
  venues: Venue[];
  pickupSpots?: PickupSpot[];
  selectedEntity: SelectedNearbyEntity | null;
  onSelectEntity: (entity: SelectedNearbyEntity | null) => void;
  filterType: 'all' | 'leagues' | 'venues' | 'spots';
}
