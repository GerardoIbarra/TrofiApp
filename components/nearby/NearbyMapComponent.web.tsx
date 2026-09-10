import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { NearbyMapProps } from './types';

export default function NearbyMapComponent({
  userLatitude,
  userLongitude,
  radiusKm,
  leagues,
  venues,
  selectedEntity,
  onSelectEntity,
  filterType,
}: NearbyMapProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const showLeagues = filterType === 'all' || filterType === 'leagues';
  const showVenues = filterType === 'all' || filterType === 'venues';

  const validLeagues = showLeagues
    ? leagues.filter((l) => l.latitude != null && l.longitude != null)
    : [];
  const validVenues = showVenues
    ? venues.filter((v) => v.latitude != null && v.longitude != null)
    : [];

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'SELECT_NEARBY') {
          if (data.entityType === 'league') {
            const found = leagues.find((l) => l.id === data.id);
            if (found) onSelectEntity({ type: 'league', item: found });
          } else if (data.entityType === 'venue') {
            const found = venues.find((v) => v.id === data.id);
            if (found) onSelectEntity({ type: 'venue', item: found });
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [leagues, venues, onSelectEntity]);

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #0A192F; }
    .pulse-dot {
      width: 14px;
      height: 14px;
      background: #00F5FF;
      border-radius: 50%;
      border: 3px solid #FFF;
      box-shadow: 0 0 12px #00F5FF;
    }
    .pin-box {
      width: 30px;
      height: 30px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      font-weight: bold;
      box-shadow: 0 3px 8px rgba(0,0,0,0.5);
      cursor: pointer;
      border: 2px solid #FFF;
    }
    .league-pin { background: #00F5FF; color: #000; }
    .venue-pin { background: #10B981; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false }).setView([${userLatitude}, ${userLongitude}], 11);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    // User circle
    L.circle([${userLatitude}, ${userLongitude}], {
      radius: ${radiusKm * 1000},
      color: '#00F5FF',
      weight: 1.5,
      opacity: 0.5,
      fillColor: '#00F5FF',
      fillOpacity: 0.06
    }).addTo(map);

    // User marker
    const userIcon = L.divIcon({ className: '', html: '<div class="pulse-dot"></div>', iconSize: [20, 20], iconAnchor: [10, 10] });
    L.marker([${userLatitude}, ${userLongitude}], { icon: userIcon }).addTo(map);

    const leaguesData = ${JSON.stringify(
      validLeagues.map((l) => ({
        id: l.id,
        name: l.name,
        lat: l.latitude,
        lng: l.longitude,
        dist: l.distance_km,
      }))
    )};

    const venuesData = ${JSON.stringify(
      validVenues.map((v) => ({
        id: v.id,
        name: v.name,
        lat: v.latitude,
        lng: v.longitude,
        dist: v.distance_km,
      }))
    )};

    leaguesData.forEach(l => {
      const icon = L.divIcon({
        className: '',
        html: '<div class="pin-box league-pin" title="' + l.name + '">🏆</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      const m = L.marker([l.lat, l.lng], { icon }).addTo(map);
      m.on('click', () => {
        window.parent.postMessage({ type: 'SELECT_NEARBY', entityType: 'league', id: l.id }, '*');
      });
    });

    venuesData.forEach(v => {
      const icon = L.divIcon({
        className: '',
        html: '<div class="pin-box venue-pin" title="' + v.name + '">🏟️</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      const m = L.marker([v.lat, v.lng], { icon }).addTo(map);
      m.on('click', () => {
        window.parent.postMessage({ type: 'SELECT_NEARBY', entityType: 'venue', id: v.id }, '*');
      });
    });
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <iframe
        ref={iframeRef as any}
        srcDoc={mapHtml}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
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
});
