import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X, Check, MapPin, Navigation, Compass } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { LocationService } from '@/services/locationService';

interface LocationPickerModalProps {
  visible: boolean;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  onConfirm: (coords: { latitude: number; longitude: number }) => void;
  onClose: () => void;
}

const DEFAULT_LAT = 19.432608;
const DEFAULT_LNG = -99.133209;

export function LocationPickerModal({
  visible,
  initialLatitude,
  initialLongitude,
  onConfirm,
  onClose,
}: LocationPickerModalProps) {
  const { theme, isDark } = useTheme();
  const webViewRef = useRef<WebView>(null);

  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: initialLatitude ?? DEFAULT_LAT,
    longitude: initialLongitude ?? DEFAULT_LNG,
  });

  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (visible) {
      const lat = initialLatitude ?? DEFAULT_LAT;
      const lng = initialLongitude ?? DEFAULT_LNG;
      setSelectedCoords({ latitude: lat, longitude: lng });
    }
  }, [visible, initialLatitude, initialLongitude]);

  const handleUseGPS = async () => {
    setIsLocating(true);
    try {
      const pos = await LocationService.fetchCurrentPosition();
      if (pos) {
        const newCoords = {
          latitude: Number(pos.latitude.toFixed(6)),
          longitude: Number(pos.longitude.toFixed(6)),
        };
        setSelectedCoords(newCoords);

        // Move map and marker in webview
        webViewRef.current?.injectJavaScript(`
          if (window.setMarkerLocation) {
            window.setMarkerLocation(${newCoords.latitude}, ${newCoords.longitude}, true);
          }
          true;
        `);
      }
    } catch (e) {
      console.warn('Could not get GPS location:', e);
    } finally {
      setIsLocating(false);
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'PIN_MOVED') {
        setSelectedCoords({
          latitude: Number(data.lat.toFixed(6)),
          longitude: Number(data.lng.toFixed(6)),
        });
      }
    } catch {
      // Ignore
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedCoords);
    onClose();
  };

  const tileUrl = isDark
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: ${isDark ? '#0A192F' : '#F1F5F9'}; }
    .custom-pin {
      width: 38px;
      height: 38px;
      background: #00BFA5;
      border: 3px solid #FFFFFF;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .custom-pin-inner {
      width: 14px;
      height: 14px;
      background: #FFFFFF;
      border-radius: 50%;
      transform: rotate(45deg);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var currentLat = ${selectedCoords.latitude};
    var currentLng = ${selectedCoords.longitude};

    var map = L.map('map', {
      center: [currentLat, currentLng],
      zoom: 15,
      zoomControl: false
    });

    L.tileLayer('${tileUrl}', {
      maxZoom: 19,
      attribution: ''
    }).addTo(map);

    var pinIcon = L.divIcon({
      className: '',
      html: '<div class="custom-pin"><div class="custom-pin-inner"></div></div>',
      iconSize: [38, 38],
      iconAnchor: [19, 38]
    });

    var marker = L.marker([currentLat, currentLng], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);

    function notifyPosition(lat, lng) {
      var msg = JSON.stringify({ type: 'PIN_MOVED', lat: lat, lng: lng });
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(msg);
      }
    }

    marker.on('dragend', function(e) {
      var pos = marker.getLatLng();
      notifyPosition(pos.lat, pos.lng);
    });

    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      notifyPosition(e.latlng.lat, e.latlng.lng);
    });

    window.setMarkerLocation = function(lat, lng, pan) {
      marker.setLatLng([lat, lng]);
      if (pan) {
        map.flyTo([lat, lng], 16, { animate: true, duration: 0.8 });
      }
    };
  </script>
</body>
</html>
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? '#0A192F' : '#F8FAFC' },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.surface,
              borderBottomColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.08)',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Seleccionar Ubicación
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Toca o arrastra el pin hasta la sede o cancha
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.gpsHeaderBtn, { backgroundColor: theme.primary + '1A' }]}
            onPress={handleUseGPS}
            disabled={isLocating}
            activeOpacity={0.7}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Navigation size={18} color={theme.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Map View */}
        <View style={styles.mapWrapper}>
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            style={styles.map}
            onMessage={handleMessage}
            scrollEnabled={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
          />

          {/* Floating Instructions Pill */}
          <View style={styles.floatingPill}>
            <MapPin size={14} color="#00BFA5" />
            <Text style={styles.floatingPillText}>
              Toca en el mapa para posicionar el pin
            </Text>
          </View>
        </View>

        {/* Footer Confirmation Bar */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.surface,
              borderTopColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.08)',
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Check size={18} color="#000000" />
            <Text style={styles.confirmBtnText}>Fijar este punto en el mapa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  gpsHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  floatingPill: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 25, 47, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.4)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  floatingPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1,
    gap: 14,
  },
  coordsInfo: {
    alignItems: 'center',
  },
  coordsLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  coordsValue: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    minHeight: 48,
  },
  confirmBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
