import { Platform, Linking, Alert, AlertButton } from 'react-native';

export interface MapLocationOptions {
  latitude?: number | string | null;
  longitude?: number | string | null;
  title?: string | null;
  address?: string | null;
  query?: string | null;
}

/**
 * Safely extracts coordinates and human-readable location data from
 * any entity (League, Venue, PickupSpot, or generic object).
 */
export function extractLocationFromEntity(entity: any): {
  latitude: number | null;
  longitude: number | null;
  title: string;
  address: string;
  hasCoordinates: boolean;
} {
  if (!entity) {
    return {
      latitude: null,
      longitude: null,
      title: '',
      address: '',
      hasCoordinates: false,
    };
  }

  const rawLat =
    entity.latitude ??
    entity.lat ??
    entity.venue?.latitude ??
    entity.venues?.[0]?.latitude ??
    entity.location?.latitude;

  const rawLng =
    entity.longitude ??
    entity.lng ??
    entity.venue?.longitude ??
    entity.venues?.[0]?.longitude ??
    entity.location?.longitude;

  const lat =
    rawLat != null
      ? typeof rawLat === 'number'
        ? rawLat
        : parseFloat(rawLat)
      : null;
  const lng =
    rawLng != null
      ? typeof rawLng === 'number'
        ? rawLng
        : parseFloat(rawLng)
      : null;

  const hasCoordinates =
    lat != null &&
    lng != null &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    !(lat === 0 && lng === 0);

  const title = entity.name || entity.title || 'Ubicación';

  const addressParts = [
    entity.address,
    entity.venue?.address,
    entity.city || entity.venue?.city,
    entity.country,
  ].filter(Boolean);

  const address = addressParts.length > 0 ? addressParts.join(', ') : '';

  return {
    latitude: hasCoordinates ? lat : null,
    longitude: hasCoordinates ? lng : null,
    title,
    address,
    hasCoordinates,
  };
}

/**
 * Opens the location in the user's preferred native map application:
 * - On iOS: Prompts between Apple Maps, Google Maps, and Waze (if installed),
 *   or directly launches Apple Maps if only one is available.
 * - On Android: Dispatches a native `geo:` intent so Android's app chooser lets
 *   the user select Google Maps, Waze, etc. Falls back to Google Maps web.
 * - On Web / Fallback: Opens Google Maps search in a new window/tab.
 */
export async function openInExternalMaps(options: MapLocationOptions): Promise<void> {
  const { latitude, longitude, title, address, query } = options;

  const lat =
    latitude != null
      ? typeof latitude === 'number'
        ? latitude
        : parseFloat(latitude)
      : null;
  const lng =
    longitude != null
      ? typeof longitude === 'number'
        ? longitude
        : parseFloat(longitude)
      : null;

  const hasCoords =
    lat != null &&
    lng != null &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    !(lat === 0 && lng === 0);

  const encodedTitle = encodeURIComponent(title || 'Ubicación');
  const searchQuery =
    query ||
    (hasCoords ? `${lat},${lng}` : address ? address : title || '');
  const encodedSearch = encodeURIComponent(searchQuery);

  const webGoogleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodedSearch}`;

  if (Platform.OS === 'ios') {
    const appleMapsUrl = hasCoords
      ? `http://maps.apple.com/?q=${encodedTitle}&ll=${lat},${lng}`
      : `http://maps.apple.com/?q=${encodedSearch}`;

    const googleMapsUrl = hasCoords
      ? `comgooglemaps://?q=${encodedTitle}&center=${lat},${lng}`
      : `comgooglemaps://?q=${encodedSearch}`;

    const wazeUrl = hasCoords ? `waze://?ll=${lat},${lng}&navigate=yes` : null;

    try {
      const [canGoogle, canWaze] = await Promise.all([
        Linking.canOpenURL('comgooglemaps://').catch(() => false),
        wazeUrl ? Linking.canOpenURL('waze://').catch(() => false) : false,
      ]);

      // If user has multiple map apps installed on iOS, offer a choice
      if (canGoogle || canWaze) {
        const buttons: AlertButton[] = [
          {
            text: 'Apple Maps',
            onPress: () => {
              Linking.openURL(appleMapsUrl).catch(() => {
                Linking.openURL(webGoogleMapsUrl);
              });
            },
          },
        ];

        if (canGoogle) {
          buttons.push({
            text: 'Google Maps',
            onPress: () => {
              Linking.openURL(googleMapsUrl).catch(() => {
                Linking.openURL(webGoogleMapsUrl);
              });
            },
          });
        }

        if (canWaze && wazeUrl) {
          buttons.push({
            text: 'Waze',
            onPress: () => {
              Linking.openURL(wazeUrl).catch(() => {
                Linking.openURL(webGoogleMapsUrl);
              });
            },
          });
        }

        buttons.push({ text: 'Cancelar', style: 'cancel' });

        Alert.alert(
          'Abrir ubicación',
          title ? `¿Cómo deseas ver ${title}?` : 'Selecciona una aplicación de mapas',
          buttons
        );
        return;
      }

      // Default: directly open Apple Maps
      const canApple = await Linking.canOpenURL(appleMapsUrl).catch(() => false);
      if (canApple) {
        await Linking.openURL(appleMapsUrl);
      } else {
        await Linking.openURL(webGoogleMapsUrl);
      }
    } catch {
      await Linking.openURL(webGoogleMapsUrl);
    }
    return;
  }

  if (Platform.OS === 'android') {
    const geoUrl = hasCoords
      ? `geo:0,0?q=${lat},${lng}(${encodedTitle})`
      : `geo:0,0?q=${encodedSearch}`;

    try {
      const canGeo = await Linking.canOpenURL(geoUrl).catch(() => false);
      if (canGeo) {
        await Linking.openURL(geoUrl);
      } else {
        await Linking.openURL(webGoogleMapsUrl);
      }
    } catch {
      await Linking.openURL(webGoogleMapsUrl);
    }
    return;
  }

  // Web or other platform fallback
  try {
    await Linking.openURL(webGoogleMapsUrl);
  } catch (err) {
    console.warn('Could not open external maps:', err);
  }
}
