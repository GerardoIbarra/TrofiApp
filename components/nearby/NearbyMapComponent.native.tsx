import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/context/ThemeContext';
import { NearbyMapProps } from './types';

interface MappableEntity {
  id: string;
  name: string;
  lat: number;
  lng: number;
  displayLat: number;
  displayLng: number;
  entityType: 'league' | 'venue' | 'spot';
}

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

// Separates markers that share the exact same coordinates (radial fan-out)
function distributeOverlappingPoints(
  items: Array<{ id: string; name: string; lat: number; lng: number; entityType: 'league' | 'venue' | 'spot' }>
): MappableEntity[] {
  const groups: Array<typeof items> = [];

  items.forEach((item) => {
    let placed = false;
    for (const group of groups) {
      const rep = group[0];
      const dist = Math.hypot(item.lat - rep.lat, item.lng - rep.lng);
      // If closer than ~25 meters, consider overlapping
      if (dist < 0.0003) {
        group.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) {
      groups.push([item]);
    }
  });

  const result: MappableEntity[] = [];

  groups.forEach((group) => {
    if (group.length === 1) {
      result.push({
        ...group[0],
        displayLat: group[0].lat,
        displayLng: group[0].lng,
      });
    } else {
      const count = group.length;
      const centerLat = group.reduce((sum, g) => sum + g.lat, 0) / count;
      const centerLng = group.reduce((sum, g) => sum + g.lng, 0) / count;
      // Offset radius ~ 35 meters in degrees
      const radiusDeg = 0.00032;
      const cosLat = Math.cos((centerLat * Math.PI) / 180) || 1;

      group.forEach((item, index) => {
        // Distribute points radially around the shared center
        const angle = (2 * Math.PI * index) / count - Math.PI / 2;
        const displayLat = centerLat + radiusDeg * Math.cos(angle);
        const displayLng = centerLng + (radiusDeg / cosLat) * Math.sin(angle);
        result.push({
          ...item,
          displayLat,
          displayLng,
        });
      });
    }
  });

  return result;
}

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

  const mappableItems = useMemo(() => {
    const rawList: Array<{
      id: string;
      name: string;
      lat: number;
      lng: number;
      entityType: 'league' | 'venue' | 'spot';
    }> = [];

    if (showLeagues) {
      leagues.forEach((l) => {
        const coords = getEntityCoords(l);
        if (coords) rawList.push({ id: l.id, name: l.name, lat: coords.lat, lng: coords.lng, entityType: 'league' });
      });
    }

    if (showVenues) {
      venues.forEach((v) => {
        const coords = getEntityCoords(v);
        if (coords) rawList.push({ id: v.id, name: v.name, lat: coords.lat, lng: coords.lng, entityType: 'venue' });
      });
    }

    if (showSpots) {
      pickupSpots.forEach((s) => {
        const coords = getEntityCoords(s);
        if (coords) rawList.push({ id: s.id, name: s.name, lat: coords.lat, lng: coords.lng, entityType: 'spot' });
      });
    }

    return distributeOverlappingPoints(rawList);
  }, [leagues, venues, pickupSpots, showLeagues, showVenues, showSpots]);

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

  const tileUrl = isDark
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  const bgColor = isDark ? '#0A192F' : '#F1F5F9';
  const pulseColor = isDark ? '#00F5FF' : '#0284C7';
  const circleColor = isDark ? '#00F5FF' : '#0284C7';

  const itemsJson = JSON.stringify(mappableItems);
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

    const items = ${itemsJson};
    const selectedId = ${JSON.stringify(selectedId)};
    const selectedType = ${JSON.stringify(selectedType)};

    const allPoints = [];
    if (${userLatitude} && ${userLongitude}) {
      allPoints.push([${userLatitude}, ${userLongitude}]);
    }

    items.forEach(item => {
      allPoints.push([item.displayLat, item.displayLng]);

      // If item was offset from a shared coordinate, draw a subtle connector line
      if (item.displayLat !== item.lat || item.displayLng !== item.lng) {
        L.polyline(
          [[item.lat, item.lng], [item.displayLat, item.displayLng]],
          { color: '#64748B', weight: 1.5, dashArray: '3, 4', opacity: 0.7 }
        ).addTo(map);
      }

      const isSel = selectedType === item.entityType && selectedId === item.id;
      let pinClass = 'league-pin';
      let iconEmoji = '🏆';
      if (item.entityType === 'venue') {
        pinClass = 'venue-pin';
        iconEmoji = '🏟️';
      } else if (item.entityType === 'spot') {
        pinClass = 'spot-pin';
        iconEmoji = '⚽';
      }

      const icon = L.divIcon({
        className: '',
        html: '<div class="pin-box ' + pinClass + ' ' + (isSel ? 'selected-pin' : '') + '" title="' + (item.name || '') + '">' + iconEmoji + '</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const m = L.marker([item.displayLat, item.displayLng], { icon }).addTo(map);
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        postToRN({ type: 'SELECT_NEARBY', entityType: item.entityType, id: item.id });
      });
    });

    // Automatically zoom and fit bounds so all markers are visible
    if (allPoints.length > 1) {
      try {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
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
