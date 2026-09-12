import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/context/ThemeContext';
import { NearbyMapProps } from './types';
import { League } from '@/features/leagues/types/league';
import { Venue } from '@/features/venues/types/venue';
import { PickupSpot } from '@/features/pickup/types/pickup';

// Safely extract coordinates from direct properties or nested venue properties
const getEntityCoords = (item: any): { lat: number; lng: number } | null => {
  if (!item) return null;
  const rawLat =
    item.latitude ??
    item.lat ??
    item.venue?.latitude ??
    item.venues?.[0]?.latitude ??
    item.location?.latitude;
  const rawLng =
    item.longitude ??
    item.lng ??
    item.venue?.longitude ??
    item.venues?.[0]?.longitude ??
    item.location?.longitude;

  if (rawLat == null || rawLng == null) return null;
  const lat = typeof rawLat === 'number' ? rawLat : parseFloat(rawLat);
  const lng = typeof rawLng === 'number' ? rawLng : parseFloat(rawLng);
  if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return null;
  return { lat, lng };
};

export default function NearbyMapComponent({
  userLatitude,
  userLongitude,
  radiusKm,
  leagues,
  venues,
  pickupSpots = [],
  selectedEntity,
  onSelectEntity,
  filterType,
}: NearbyMapProps) {
  const { isDark } = useTheme();
  const webViewRef = useRef<WebView>(null);

  const showLeagues = filterType === 'all' || filterType === 'leagues';
  const showVenues = filterType === 'all' || filterType === 'venues';
  const showSpots = filterType === 'all' || filterType === 'spots';

  const validLeagues = useMemo(() => {
    if (!showLeagues) return [];
    return leagues
      .map((l) => {
        const coords = getEntityCoords(l);
        return coords ? { ...l, lat: coords.lat, lng: coords.lng } : null;
      })
      .filter(Boolean) as (League & { lat: number; lng: number })[];
  }, [leagues, showLeagues]);

  const validVenues = useMemo(() => {
    if (!showVenues) return [];
    return venues
      .map((v) => {
        const coords = getEntityCoords(v);
        return coords ? { ...v, lat: coords.lat, lng: coords.lng } : null;
      })
      .filter(Boolean) as (Venue & { lat: number; lng: number })[];
  }, [venues, showVenues]);

  const validSpots = useMemo(() => {
    if (!showSpots) return [];
    return pickupSpots
      .map((s) => {
        const coords = getEntityCoords(s);
        return coords ? { ...s, lat: coords.lat, lng: coords.lng } : null;
      })
      .filter(Boolean) as (PickupSpot & { lat: number; lng: number })[];
  }, [pickupSpots, showSpots]);

  // Handle messages from Leaflet webview
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_NEARBY') {
        if (data.entityType === 'league') {
          const item = leagues.find((l) => l.id === data.id);
          if (item) onSelectEntity({ type: 'league', item });
        } else if (data.entityType === 'venue') {
          const item = venues.find((v) => v.id === data.id);
          if (item) onSelectEntity({ type: 'venue', item });
        } else if (data.entityType === 'spot') {
          const item = pickupSpots.find((s) => s.id === data.id);
          if (item) onSelectEntity({ type: 'spot', item });
        }
      } else if (data.type === 'DESELECT') {
        onSelectEntity(null);
      }
    } catch {
      // ignore
    }
  };

  // Fly to selected entity when it changes
  useEffect(() => {
    if (selectedEntity && webViewRef.current) {
      const coords = getEntityCoords(selectedEntity.item);
      if (coords) {
        webViewRef.current.injectJavaScript(`
          if (window.map) {
            window.map.flyTo([${coords.lat}, ${coords.lng}], 15, { animate: true, duration: 0.8 });
          }
          true;
        `);
      }
    }
  }, [selectedEntity]);

  // 100% Free Tile Layer URLs without API keys or watermarks:
  // - Dark: ESRI World Dark Gray Canvas (clean, dark navy/gray, zero watermarks)
  // - Light: OpenStreetMap Standard (official OSM tiles, clean, zero watermarks)
  const tileUrl = isDark
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  const bgColor = isDark ? '#0A192F' : '#F1F5F9';
  const pulseColor = isDark ? '#00F5FF' : '#0284C7';
  const circleColor = isDark ? '#00F5FF' : '#0284C7';

  const leaguesJson = JSON.stringify(
    validLeagues.map((l) => ({
      id: l.id,
      name: l.name,
      lat: l.lat,
      lng: l.lng,
    }))
  );

  const venuesJson = JSON.stringify(
    validVenues.map((v) => ({
      id: v.id,
      name: v.name,
      lat: v.lat,
      lng: v.lng,
    }))
  );

  const spotsJson = JSON.stringify(
    validSpots.map((s) => ({
      id: s.id,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
    }))
  );

  const selectedId = selectedEntity?.item.id ?? null;
  const selectedType = selectedEntity?.type ?? null;
  const initialZoom = radiusKm <= 10 ? 13 : radiusKm <= 25 ? 12 : radiusKm <= 50 ? 11 : 10;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    body, html, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: ${bgColor};
    }
    .pulse-dot {
      width: 16px;
      height: 16px;
      background: ${pulseColor};
      border-radius: 50%;
      border: 3px solid #FFF;
      box-shadow: 0 0 14px ${pulseColor};
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 245, 255, 0.7); }
      70% { box-shadow: 0 0 0 14px rgba(0, 245, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 245, 255, 0); }
    }
    .pin-box {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.45);
      cursor: pointer;
      border: 2px solid #FFF;
      transition: transform 0.2s;
    }
    .pin-box:active {
      transform: scale(1.15);
    }
    .league-pin { background: #00F5FF; color: #000; }
    .venue-pin { background: #10B981; color: #FFF; }
    .spot-pin { background: #F59E0B; color: #FFF; }
    .selected-pin {
      transform: scale(1.25);
      border: 3px solid #FFF;
      box-shadow: 0 0 18px #00F5FF;
    }
    /* Hide Leaflet bottom attribution flag and links */
    .leaflet-control-attribution {
      display: none !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([${userLatitude}, ${userLongitude}], ${initialZoom});

    window.map = map;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('${tileUrl}', {
      maxZoom: 19
    }).addTo(map);

    // User radius circle
    L.circle([${userLatitude}, ${userLongitude}], {
      radius: ${radiusKm * 1000},
      color: '${circleColor}',
      weight: 1.5,
      opacity: 0.6,
      fillColor: '${circleColor}',
      fillOpacity: 0.08
    }).addTo(map);

    // User location marker
    const userIcon = L.divIcon({
      className: '',
      html: '<div class="pulse-dot"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    L.marker([${userLatitude}, ${userLongitude}], { icon: userIcon }).addTo(map);

    const postToRN = (payload) => {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    };

    map.on('click', () => {
      postToRN({ type: 'DESELECT' });
    });

    const leagues = ${leaguesJson};
    const venues = ${venuesJson};
    const spots = ${spotsJson};
    const selectedId = ${JSON.stringify(selectedId)};
    const selectedType = ${JSON.stringify(selectedType)};

    const allPoints = [];
    if (${userLatitude} && ${userLongitude}) {
      allPoints.push([${userLatitude}, ${userLongitude}]);
    }

    leagues.forEach(l => {
      if (l.lat && l.lng) {
        allPoints.push([l.lat, l.lng]);
        const isSel = selectedType === 'league' && selectedId === l.id;
        const icon = L.divIcon({
          className: '',
          html: '<div class="pin-box league-pin ' + (isSel ? 'selected-pin' : '') + '" title="' + (l.name || 'Liga') + '">🏆</div>',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        const m = L.marker([l.lat, l.lng], { icon }).addTo(map);
        m.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          postToRN({ type: 'SELECT_NEARBY', entityType: 'league', id: l.id });
        });
      }
    });

    venues.forEach(v => {
      if (v.lat && v.lng) {
        allPoints.push([v.lat, v.lng]);
        const isSel = selectedType === 'venue' && selectedId === v.id;
        const icon = L.divIcon({
          className: '',
          html: '<div class="pin-box venue-pin ' + (isSel ? 'selected-pin' : '') + '" title="' + (v.name || 'Sede') + '">🏟️</div>',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        const m = L.marker([v.lat, v.lng], { icon }).addTo(map);
        m.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          postToRN({ type: 'SELECT_NEARBY', entityType: 'venue', id: v.id });
        });
      }
    });

    spots.forEach(s => {
      if (s.lat && s.lng) {
        allPoints.push([s.lat, s.lng]);
        const isSel = selectedType === 'spot' && selectedId === s.id;
        const icon = L.divIcon({
          className: '',
          html: '<div class="pin-box spot-pin ' + (isSel ? 'selected-pin' : '') + '" title="' + (s.name || 'Cancha') + '">⚽</div>',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        const m = L.marker([s.lat, s.lng], { icon }).addTo(map);
        m.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          postToRN({ type: 'SELECT_NEARBY', entityType: 'spot', id: s.id });
        });
      }
    });

    // Automatically zoom and center map to include all items and user location
    if (allPoints.length > 1) {
      try {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } catch (e) {
        // fallback
      }
    }
  </script>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        overScrollMode="never"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#0A192F',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0A192F',
  },
});
