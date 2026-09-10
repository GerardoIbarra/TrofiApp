import { League } from '@/features/leagues/types/league';
import { Venue } from '@/features/venues/types/venue';

export type NearbyItemType = 'league' | 'venue';

export interface SelectedNearbyEntity {
  type: NearbyItemType;
  item: League | Venue;
}

export interface NearbyMapProps {
  userLatitude: number;
  userLongitude: number;
  radiusKm: number;
  leagues: League[];
  venues: Venue[];
  selectedEntity: SelectedNearbyEntity | null;
  onSelectEntity: (entity: SelectedNearbyEntity | null) => void;
  filterType: 'all' | 'leagues' | 'venues';
}
