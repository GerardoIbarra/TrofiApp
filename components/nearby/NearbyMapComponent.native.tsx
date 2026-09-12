import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { Trophy, MapPin, Flame } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { NearbyMapProps } from './types';

// Dark map style matching TrofiApp theme (#0A192F)
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0A192F' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A192F' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#748DA6' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00F5FF' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5B7083' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0C2744' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#162F4D' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0D2137' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1F4068' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#05101E' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#32527B' }],
  },
];

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
  const { theme, isDark } = useTheme();
  const mapRef = useRef<MapView>(null);

  // Delta based on radius (1 degree latitude is approx 111km)
  const latitudeDelta = Math.max((radiusKm / 111) * 2.2, 0.05);
  const longitudeDelta = Math.max((radiusKm / 111) * 2.2, 0.05);

  // Center camera when user coordinates change or entity is selected
  useEffect(() => {
    if (selectedEntity) {
      const lat = selectedEntity.item.latitude;
      const lng = selectedEntity.item.longitude;
      if (lat != null && lng != null && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: lat,
            longitude: lng,
            latitudeDelta: latitudeDelta * 0.4,
            longitudeDelta: longitudeDelta * 0.4,
          },
          500
        );
      }
    }
  }, [selectedEntity]);

  const showLeagues = filterType === 'all' || filterType === 'leagues';
  const showVenues = filterType === 'all' || filterType === 'venues';
  const showSpots = filterType === 'all' || filterType === 'spots';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        customMapStyle={isDark ? DARK_MAP_STYLE : []}
        initialRegion={{
          latitude: userLatitude,
          longitude: userLongitude,
          latitudeDelta,
          longitudeDelta,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={() => onSelectEntity(null)}
      >
        {/* Radius Circle around user */}
        <Circle
          center={{ latitude: userLatitude, longitude: userLongitude }}
          radius={radiusKm * 1000}
          strokeWidth={1.5}
          strokeColor="rgba(0, 245, 255, 0.4)"
          fillColor="rgba(0, 245, 255, 0.05)"
        />

        {/* League Pins */}
        {showLeagues &&
          leagues.map((league) => {
            if (league.latitude == null || league.longitude == null) return null;
            const isSelected =
              selectedEntity?.type === 'league' &&
              selectedEntity.item.id === league.id;

            return (
              <Marker
                key={`league-${league.id}`}
                coordinate={{
                  latitude: Number(league.latitude),
                  longitude: Number(league.longitude),
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  onSelectEntity({ type: 'league', item: league });
                }}
                tracksViewChanges={Platform.OS === 'android' ? false : true}
              >
                <View style={[styles.markerContainer, isSelected && styles.markerSelected]}>
                  <View style={[styles.pinCircle, styles.leaguePinCircle]}>
                    <Trophy size={14} color="#000" />
                  </View>
                  <View style={[styles.pinArrow, styles.leaguePinArrow]} />
                </View>
              </Marker>
            );
          })}

        {/* Venue Pins */}
        {showVenues &&
          venues.map((venue) => {
            if (venue.latitude == null || venue.longitude == null) return null;
            const isSelected =
              selectedEntity?.type === 'venue' &&
              selectedEntity.item.id === venue.id;

            return (
              <Marker
                key={`venue-${venue.id}`}
                coordinate={{
                  latitude: Number(venue.latitude),
                  longitude: Number(venue.longitude),
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  onSelectEntity({ type: 'venue', item: venue });
                }}
                tracksViewChanges={Platform.OS === 'android' ? false : true}
              >
                <View style={[styles.markerContainer, isSelected && styles.markerSelectedVenue]}>
                  <View style={[styles.pinCircle, styles.venuePinCircle]}>
                    <MapPin size={14} color="#FFF" />
                  </View>
                  <View style={[styles.pinArrow, styles.venuePinArrow]} />
                </View>
              </Marker>
            );
          })}

        {/* Pickup Spot Pins */}
        {showSpots &&
          pickupSpots.map((spot) => {
            if (spot.latitude == null || spot.longitude == null) return null;
            const isSelected =
              selectedEntity?.type === 'spot' &&
              selectedEntity.item.id === spot.id;

            return (
              <Marker
                key={`spot-${spot.id}`}
                coordinate={{
                  latitude: Number(spot.latitude),
                  longitude: Number(spot.longitude),
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  onSelectEntity({ type: 'spot', item: spot });
                }}
                tracksViewChanges={Platform.OS === 'android' ? false : true}
              >
                <View style={[styles.markerContainer, isSelected && styles.markerSelectedSpot]}>
                  <View style={[styles.pinCircle, styles.spotPinCircle]}>
                    <Flame size={14} color="#FFF" />
                  </View>
                  <View style={[styles.pinArrow, styles.spotPinArrow]} />
                </View>
              </Marker>
            );
          })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSelected: {
    transform: [{ scale: 1.25 }],
    zIndex: 999,
  },
  markerSelectedVenue: {
    transform: [{ scale: 1.25 }],
    zIndex: 999,
  },
  markerSelectedSpot: {
    transform: [{ scale: 1.25 }],
    zIndex: 999,
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  leaguePinCircle: {
    backgroundColor: '#00F5FF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  venuePinCircle: {
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  spotPinCircle: {
    backgroundColor: '#F59E0B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  leaguePinArrow: {
    borderTopColor: '#00F5FF',
  },
  venuePinArrow: {
    borderTopColor: '#10B981',
  },
  spotPinArrow: {
    borderTopColor: '#F59E0B',
  },
});
