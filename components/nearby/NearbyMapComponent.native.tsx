import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/context/ThemeContext';
import { NearbyMapProps } from './types';

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

  const validLeagues = useMemo(
    () => (showLeagues ? leagues.filter((l) => l.latitude != null && l.longitude != null) : []),
    [leagues, showLeagues]
  );
  const validVenues = useMemo(
    () => (showVenues ? venues.filter((v) => v.latitude != null && v.longitude != null) : []),
    [venues, showVenues]
  );
  const validSpots = useMemo(
    () => (showSpots ? pickupSpots.filter((s) => s.latitude != null && s.longitude != null) : []),
    [pickupSpots, showSpots]
  );

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
      const lat = selectedEntity.item.latitude;
      const lng = selectedEntity.item.longitude;
      if (lat != null && lng != null) {
        webViewRef.current.injectJavaScript(`
          if (window.map) {
            window.map.flyTo([${lat}, ${lng}], 15, { animate: true, duration: 0.8 });
          }
          true;
        `);
      }
    }
  }, [selectedEntity]);

  // Tile layer URL based on theme (CartoDB Dark Matter vs Voyager - 100% free, no API key required)
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const bgColor = isDark ? '#0A192F' : '#F1F5F9';
  const pulseColor = isDark ? '#00F5FF' : '#0284C7';
  const circleColor = isDark ? '#00F5FF' : '#0284C7';

  const leaguesJson = JSON.stringify(
    validLeagues.map((l) => ({
      id: l.id,
      name: l.name,
      lat: Number(l.latitude),
      lng: Number(l.longitude),
    }))
  );

  const venuesJson = JSON.stringify(
    validVenues.map((v) => ({
      id: v.id,
      name: v.name,
      lat: Number(v.latitude),
      lng: Number(v.longitude),
    }))
  );

  const spotsJson = JSON.stringify(
    validSpots.map((s) => ({
      id: s.id,
      name: s.name,
      lat: Number(s.latitude),
      lng: Number(s.longitude),
    }))
  );

  const selectedId = selectedEntity?.item.id ?? null;
  const selectedType = selectedEntity?.type ?? null;

  // Compute zoom level based on radius
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
    * { -webkit-tap-highlight-color: transparent; }
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
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
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
      box-shadow: 0 0 16px #00F5FF;
    }
    .leaflet-control-attribution {
      font-size: 9px !important;
      background: rgba(0,0,0,0.4) !important;
      color: #94A3B8 !important;
    }
    .leaflet-control-attribution a {
      color: #38BDF8 !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([${userLatitude}, ${userLongitude}], ${initialZoom});

    window.map = map;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('${tileUrl}', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OSM</a>'
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

    map.on('click', (e) => {
      postToRN({ type: 'DESELECT' });
    });

    const leagues = ${leaguesJson};
    const venues = ${venuesJson};
    const spots = ${spotsJson};
    const selectedId = ${JSON.stringify(selectedId)};
    const selectedType = ${JSON.stringify(selectedType)};

    leagues.forEach(l => {
      const isSel = selectedType === 'league' && selectedId === l.id;
      const icon = L.divIcon({
        className: '',
        html: '<div class="pin-box league-pin ' + (isSel ? 'selected-pin' : '') + '">🏆</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      const m = L.marker([l.lat, l.lng], { icon }).addTo(map);
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        postToRN({ type: 'SELECT_NEARBY', entityType: 'league', id: l.id });
      });
    });

    venues.forEach(v => {
      const isSel = selectedType === 'venue' && selectedId === v.id;
      const icon = L.divIcon({
        className: '',
        html: '<div class="pin-box venue-pin ' + (isSel ? 'selected-pin' : '') + '">🏟️</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      const m = L.marker([v.lat, v.lng], { icon }).addTo(map);
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        postToRN({ type: 'SELECT_NEARBY', entityType: 'venue', id: v.id });
      });
    });

    spots.forEach(s => {
      const isSel = selectedType === 'spot' && selectedId === s.id;
      const icon = L.divIcon({
        className: '',
        html: '<div class="pin-box spot-pin ' + (isSel ? 'selected-pin' : '') + '">⚽</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      const m = L.marker([s.lat, s.lng], { icon }).addTo(map);
      m.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        postToRN({ type: 'SELECT_NEARBY', entityType: 'spot', id: s.id });
      });
    });
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
